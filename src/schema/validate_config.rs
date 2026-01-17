use crate::{
    schema::{
        self,
        server_config::{ArgumentType, DynamicField},
    },
    utils::error_response,
};
use regex::Regex;
use rocket::{http::Status, response::Responder};
use serde_json::{Map, Value};
use thiserror::Error;

#[cfg(test)]
mod tests;

#[derive(Error, Debug)]
pub enum SchemaValidationError {
    #[error("Missing required field: {0}")]
    MissingField(String),

    #[error("Invalid value for field '{0}': {1}")]
    InvalidFieldValue(String, String),

    #[error("General validation error: {0}")]
    GeneralError(String),
}

impl Responder<'_, 'static> for SchemaValidationError {
    fn respond_to(self, _: &rocket::Request<'_>) -> rocket::response::Result<'static> {
        error_response(self, Status::BadRequest)
    }
}

pub fn validate_config(
    schema: &schema::ServerConfig,
    to_validate: &serde_json::Value,
) -> Result<(), Vec<SchemaValidationError>> {
    let mut errors = Vec::new();

    // Ensure to_validate is an object
    let config_obj = match to_validate.as_object() {
        Some(obj) => obj,
        None => {
            return Err(vec![SchemaValidationError::GeneralError(
                "Config must be a JSON object".to_string(),
            )])
        }
    };

    // First pass: Validate each field in the schema
    for field in &schema.args {
        if let Err(field_errors) = validate_field(field, config_obj) {
            errors.extend(field_errors);
        }
    }

    // Second pass: Evaluate rules and apply constraints
    for rule in &schema.rules {
        if let Err(rule_errors) = apply_rule_constraints(rule, &schema.args, config_obj) {
            errors.extend(rule_errors);
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

fn validate_field(
    field: &DynamicField,
    config: &Map<String, Value>,
) -> Result<(), Vec<SchemaValidationError>> {
    let mut errors = Vec::new();

    // Get the value from config or use default
    let value = match config.get(&field.name) {
        Some(v) => v.clone(),
        None => {
            // Field not provided - check if required or has default
            if field.required {
                errors.push(SchemaValidationError::MissingField(field.name.clone()));
                return Err(errors);
            }

            // Use default if available, otherwise skip validation
            if let Some(default) = &field.default {
                Value::String(default.clone())
            } else {
                return Ok(()); // Optional field with no value
            }
        }
    };

    // Validate based on field type
    match &field.arg_type {
        ArgumentType::String(string_config) => {
            if let Err(e) = validate_string_field(field, string_config, &value) {
                errors.extend(e);
            }
        }
        ArgumentType::Number(number_config) => {
            if let Err(e) = validate_number_field(number_config, &value, &field.name) {
                errors.extend(e);
            }
        }
        ArgumentType::Enum(enum_config) => {
            if let Err(e) = validate_enum_field(enum_config, &value, &field.name) {
                errors.extend(e);
            }
        }
        ArgumentType::Boolean | ArgumentType::Flag => {
            if !value.is_boolean() && !value.is_string() && !value.is_null() {
                errors.push(SchemaValidationError::InvalidFieldValue(
                    field.name.clone(),
                    "Expected boolean or string value".to_string(),
                ));
            }
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

fn validate_string_field(
    field: &DynamicField,
    string_config: &schema::server_config::StringConfig,
    value: &Value,
) -> Result<(), Vec<SchemaValidationError>> {
    let mut errors = Vec::new();

    let str_value = match value {
        Value::String(s) => s.clone(),
        Value::Null => {
            if field.required {
                errors.push(SchemaValidationError::InvalidFieldValue(
                    field.name.clone(),
                    "Cannot be null".to_string(),
                ));
            }
            return if errors.is_empty() {
                Ok(())
            } else {
                Err(errors)
            };
        }
        _ => {
            errors.push(SchemaValidationError::InvalidFieldValue(
                field.name.clone(),
                format!("Expected string, got {}", get_value_type_name(value)),
            ));
            return Err(errors);
        }
    };

    // Check pattern if present
    if let Some(pattern) = &string_config.pattern {
        match Regex::new(pattern) {
            Ok(regex) => {
                if !regex.is_match(&str_value) {
                    errors.push(SchemaValidationError::InvalidFieldValue(
                        field.name.clone(),
                        format!("Does not match pattern: {}", pattern),
                    ));
                }
            }
            Err(_) => {
                errors.push(SchemaValidationError::GeneralError(format!(
                    "Invalid regex pattern in field '{}': {}",
                    field.name, pattern
                )));
            }
        }
    }

    // Check minLength if present
    if let Some(min_len) = string_config.min_length {
        if str_value.len() < min_len {
            errors.push(SchemaValidationError::InvalidFieldValue(
                field.name.clone(),
                format!("Length must be at least {}", min_len),
            ));
        }
    }

    // Check maxLength if present
    if let Some(max_len) = string_config.max_length {
        if str_value.len() > max_len {
            errors.push(SchemaValidationError::InvalidFieldValue(
                field.name.clone(),
                format!("Length must not exceed {}", max_len),
            ));
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

fn validate_number_field(
    number_config: &schema::server_config::NumberConfig,
    value: &Value,
    field_name: &str,
) -> Result<(), Vec<SchemaValidationError>> {
    let mut errors = Vec::new();

    let num_value = match value {
        Value::Number(n) => match n.as_f64() {
            Some(f) => f,
            None => {
                errors.push(SchemaValidationError::InvalidFieldValue(
                    field_name.to_string(),
                    "Invalid number format".to_string(),
                ));
                return Err(errors);
            }
        },
        Value::String(s) => {
            // Try to parse string as number
            match s.parse::<f64>() {
                Ok(n) => n,
                Err(_) => {
                    errors.push(SchemaValidationError::InvalidFieldValue(
                        field_name.to_string(),
                        format!("Cannot parse '{}' as a number", s),
                    ));
                    return Err(errors);
                }
            }
        }
        Value::Null => {
            return Ok(());
        }
        _ => {
            errors.push(SchemaValidationError::InvalidFieldValue(
                field_name.to_string(),
                format!("Expected number, got {}", get_value_type_name(value)),
            ));
            return Err(errors);
        }
    };

    // Check min if present
    if let Some(min) = number_config.min {
        if num_value < min {
            errors.push(SchemaValidationError::InvalidFieldValue(
                field_name.to_string(),
                format!("Must be at least {}", min),
            ));
        }
    }

    // Check max if present
    if let Some(max) = number_config.max {
        if num_value > max {
            errors.push(SchemaValidationError::InvalidFieldValue(
                field_name.to_string(),
                format!("Must not exceed {}", max),
            ));
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

fn validate_enum_field(
    enum_config: &schema::server_config::EnumConfig,
    value: &Value,
    field_name: &str,
) -> Result<(), Vec<SchemaValidationError>> {
    let mut errors = Vec::new();

    let str_value = match value {
        Value::String(s) => s.clone(),
        Value::Null => {
            return Ok(());
        }
        _ => {
            errors.push(SchemaValidationError::InvalidFieldValue(
                field_name.to_string(),
                format!(
                    "Expected string for enum, got {}",
                    get_value_type_name(value)
                ),
            ));
            return Err(errors);
        }
    };

    // Check if value is in the allowed values
    if !enum_config.values.contains(&str_value) {
        errors.push(SchemaValidationError::InvalidFieldValue(
            field_name.to_string(),
            format!(
                "Invalid enum value '{}'. Allowed values: {}",
                str_value,
                enum_config.values.join(", ")
            ),
        ));
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

fn apply_rule_constraints(
    rule: &schema::ConditionalRule,
    fields: &[DynamicField],
    config: &Map<String, Value>,
) -> Result<(), Vec<SchemaValidationError>> {
    let mut errors = Vec::new();

    // Evaluate the rule condition
    if let Err(cond_errors) = evaluate_condition(&rule.condition, fields, config) {
        errors.extend(cond_errors);
        return Err(errors);
    }

    if evaluate_condition(&rule.condition, fields, config).unwrap_or(false) {
        // Condition is met, apply the constraint
        if let Some(target_field) = fields.iter().find(|f| f.name == rule.target_field_name) {
            match &rule.constraint {
                schema::FieldConstraint::Required => {
                    if !config.contains_key(&target_field.name) {
                        errors.push(SchemaValidationError::MissingField(
                            target_field.name.clone(),
                        ));
                    }
                }
                schema::FieldConstraint::Optional => {
                    // No validation needed for optional constraint
                }
                schema::FieldConstraint::RestrictEnum { values, .. } => {
                    if let Some(field_value) = config.get(&target_field.name) {
                        if let Value::String(s) = field_value {
                            if !values.contains(s) {
                                errors.push(SchemaValidationError::InvalidFieldValue(
                                    target_field.name.clone(),
                                    format!(
                                        "Value '{}' not allowed. Restricted to: {}",
                                        s,
                                        values.join(", ")
                                    ),
                                ));
                            }
                        }
                    }
                }
                schema::FieldConstraint::RestrictNumber { min, max } => {
                    if let Some(field_value) = config.get(&target_field.name) {
                        if let Some(num) = as_f64(field_value) {
                            if let Some(min_val) = min {
                                if num < *min_val {
                                    errors.push(SchemaValidationError::InvalidFieldValue(
                                        target_field.name.clone(),
                                        format!("Must be at least {}", min_val),
                                    ));
                                }
                            }
                            if let Some(max_val) = max {
                                if num > *max_val {
                                    errors.push(SchemaValidationError::InvalidFieldValue(
                                        target_field.name.clone(),
                                        format!("Must not exceed {}", max_val),
                                    ));
                                }
                            }
                        }
                    }
                }
                schema::FieldConstraint::RestrictString {
                    pattern,
                    min_length,
                    max_length,
                } => {
                    if let Some(field_value) = config.get(&target_field.name) {
                        if let Value::String(s) = field_value {
                            if let Some(pat) = pattern {
                                match Regex::new(pat) {
                                    Ok(regex) => {
                                        if !regex.is_match(s) {
                                            errors.push(SchemaValidationError::InvalidFieldValue(
                                                target_field.name.clone(),
                                                format!("Does not match required pattern: {}", pat),
                                            ));
                                        }
                                    }
                                    Err(_) => {
                                        errors.push(SchemaValidationError::GeneralError(format!(
                                            "Invalid regex pattern in rule constraint: {}",
                                            pat
                                        )));
                                    }
                                }
                            }
                            if let Some(min_len) = min_length {
                                if s.len() < *min_len {
                                    errors.push(SchemaValidationError::InvalidFieldValue(
                                        target_field.name.clone(),
                                        format!("Length must be at least {}", min_len),
                                    ));
                                }
                            }
                            if let Some(max_len) = max_length {
                                if s.len() > *max_len {
                                    errors.push(SchemaValidationError::InvalidFieldValue(
                                        target_field.name.clone(),
                                        format!("Length must not exceed {}", max_len),
                                    ));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

fn evaluate_condition(
    condition: &schema::Condition,
    _fields: &[DynamicField],
    config: &Map<String, Value>,
) -> Result<bool, Vec<SchemaValidationError>> {
    let mut errors = Vec::new();

    // Get the field value from config
    let field_value = match config.get(&condition.field_name) {
        Some(v) => v,
        None => {
            errors.push(SchemaValidationError::GeneralError(format!(
                "Condition references non-existent field: {}",
                condition.field_name
            )));
            return Err(errors);
        }
    };

    let result = match &condition.operator {
        schema::ConditionOperator::Equals => {
            if let schema::ConditionValue::Single(val) = &condition.value {
                extract_comparable_value(field_value) == *val
            } else {
                false
            }
        }
        schema::ConditionOperator::NotEquals => {
            if let schema::ConditionValue::Single(val) = &condition.value {
                extract_comparable_value(field_value) != *val
            } else {
                false
            }
        }
        schema::ConditionOperator::LessThan => {
            if let schema::ConditionValue::Single(val) = &condition.value {
                if let (Some(fv), Ok(cv)) = (as_f64(field_value), val.parse::<f64>()) {
                    fv < cv
                } else {
                    false
                }
            } else {
                false
            }
        }
        schema::ConditionOperator::GreaterThan => {
            if let schema::ConditionValue::Single(val) = &condition.value {
                if let (Some(fv), Ok(cv)) = (as_f64(field_value), val.parse::<f64>()) {
                    fv > cv
                } else {
                    false
                }
            } else {
                false
            }
        }
        schema::ConditionOperator::LessThanOrEqual => {
            if let schema::ConditionValue::Single(val) = &condition.value {
                if let (Some(fv), Ok(cv)) = (as_f64(field_value), val.parse::<f64>()) {
                    fv <= cv
                } else {
                    false
                }
            } else {
                false
            }
        }
        schema::ConditionOperator::GreaterThanOrEqual => {
            if let schema::ConditionValue::Single(val) = &condition.value {
                if let (Some(fv), Ok(cv)) = (as_f64(field_value), val.parse::<f64>()) {
                    fv >= cv
                } else {
                    false
                }
            } else {
                false
            }
        }
        schema::ConditionOperator::Contains => {
            if let schema::ConditionValue::Single(needle) = &condition.value {
                if let Value::String(s) = field_value {
                    s.contains(needle)
                } else {
                    false
                }
            } else {
                false
            }
        }
        schema::ConditionOperator::Matches => {
            if let schema::ConditionValue::Single(pattern) = &condition.value {
                if let Value::String(s) = field_value {
                    match Regex::new(pattern) {
                        Ok(regex) => regex.is_match(s),
                        Err(_) => {
                            errors.push(SchemaValidationError::GeneralError(format!(
                                "Invalid regex in condition: {}",
                                pattern
                            )));
                            false
                        }
                    }
                } else {
                    false
                }
            } else {
                false
            }
        }
        schema::ConditionOperator::In => {
            if let schema::ConditionValue::Multiple(values) = &condition.value {
                values
                    .iter()
                    .any(|v| extract_comparable_value(field_value) == *v)
            } else {
                false
            }
        }
    };

    if errors.is_empty() {
        Ok(result)
    } else {
        Err(errors)
    }
}

fn extract_comparable_value(value: &Value) -> String {
    match value {
        Value::String(s) => s.clone(),
        Value::Number(n) => n.to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Null => "null".to_string(),
        _ => value.to_string(),
    }
}

fn as_f64(value: &Value) -> Option<f64> {
    match value {
        Value::Number(n) => n.as_f64(),
        Value::String(s) => s.parse::<f64>().ok(),
        _ => None,
    }
}

fn get_value_type_name(value: &Value) -> &'static str {
    match value {
        Value::Null => "null",
        Value::Bool(_) => "boolean",
        Value::Number(_) => "number",
        Value::String(_) => "string",
        Value::Array(_) => "array",
        Value::Object(_) => "object",
    }
}

use super::*;
use crate::schema::server_config::*;
use serde_json::json;

// Helper function to create a basic test schema
fn create_test_schema() -> ServerConfig {
    ServerConfig {
        static_config: StaticConfig {
            steam_app_id: 123456,
            executable_name: "test_server".to_string(),
            display_name: "Test Server".to_string(),
            schema_version: "1.0".to_string(),
        },
        args: vec![],
        rules: vec![],
        command_builder: None,
    }
}

#[test]
fn test_validate_config_non_object_input() {
    let schema = create_test_schema();
    let config = json!("not an object");

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    let errors = result.unwrap_err();
    assert_eq!(errors.len(), 1);
    match &errors[0] {
        SchemaValidationError::GeneralError(msg) => assert!(msg.contains("must be a JSON object")),
        _ => panic!("Expected GeneralError"),
    }
}

#[test]
fn test_validate_config_empty_schema_empty_config() {
    let schema = create_test_schema();
    let config = json!({});

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_required_string_field_missing() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "server_name".to_string(),
        flag: "--name".to_string(),
        use_equals: false,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: true,
        description: "Server name".to_string(),
        display_name: None,
    });

    let config = json!({});

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    let errors = result.unwrap_err();
    assert_eq!(errors.len(), 1);
    match &errors[0] {
        SchemaValidationError::MissingField(name) => assert_eq!(name, "server_name"),
        _ => panic!("Expected MissingField"),
    }
}

#[test]
fn test_required_string_field_provided() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "server_name".to_string(),
        flag: "--name".to_string(),
        use_equals: false,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: true,
        description: "Server name".to_string(),
        display_name: None,
    });

    let config = json!({
        "server_name": "My Server"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_string_field_pattern_validation_pass() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "port".to_string(),
        flag: "--port".to_string(),
        use_equals: true,
        arg_type: ArgumentType::String(StringConfig {
            pattern: Some("^\\d{1,5}$".to_string()),
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Port".to_string(),
        display_name: None,
    });

    let config = json!({
        "port": "8080"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_string_field_pattern_validation_fail() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "port".to_string(),
        flag: "--port".to_string(),
        use_equals: true,
        arg_type: ArgumentType::String(StringConfig {
            pattern: Some("^\\d{1,5}$".to_string()),
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Port".to_string(),
        display_name: None,
    });

    let config = json!({
        "port": "not_a_port"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    let errors = result.unwrap_err();
    assert_eq!(errors.len(), 1);
    match &errors[0] {
        SchemaValidationError::InvalidFieldValue(field, msg) => {
            assert_eq!(field, "port");
            assert!(msg.contains("pattern"));
        }
        _ => panic!("Expected InvalidFieldValue"),
    }
}

#[test]
fn test_string_field_min_length() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "name".to_string(),
        flag: "--name".to_string(),
        use_equals: false,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: Some(3),
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Name".to_string(),
        display_name: None,
    });

    let config = json!({
        "name": "ab"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    let errors = result.unwrap_err();
    assert_eq!(errors.len(), 1);
    match &errors[0] {
        SchemaValidationError::InvalidFieldValue(field, msg) => {
            assert_eq!(field, "name");
            assert!(msg.contains("at least 3"));
        }
        _ => panic!("Expected InvalidFieldValue"),
    }
}

#[test]
fn test_string_field_max_length() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "name".to_string(),
        flag: "--name".to_string(),
        use_equals: false,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: Some(5),
        }),
        default: None,
        required: false,
        description: "Name".to_string(),
        display_name: None,
    });

    let config = json!({
        "name": "toolongname"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
}

#[test]
fn test_number_field_parse_string() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "max_players".to_string(),
        flag: "--max-players".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: Some(1.0),
            max: Some(256.0),
        }),
        default: None,
        required: false,
        description: "Max players".to_string(),
        display_name: None,
    });

    let config = json!({
        "max_players": "64"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_number_field_min_constraint() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "max_players".to_string(),
        flag: "--max-players".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: Some(1.0),
            max: Some(256.0),
        }),
        default: None,
        required: false,
        description: "Max players".to_string(),
        display_name: None,
    });

    let config = json!({
        "max_players": 0
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    let errors = result.unwrap_err();
    match &errors[0] {
        SchemaValidationError::InvalidFieldValue(field, msg) => {
            assert_eq!(field, "max_players");
            assert!(msg.contains("at least 1"));
        }
        _ => panic!("Expected InvalidFieldValue"),
    }
}

#[test]
fn test_number_field_max_constraint() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "max_players".to_string(),
        flag: "--max-players".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: Some(1.0),
            max: Some(256.0),
        }),
        default: None,
        required: false,
        description: "Max players".to_string(),
        display_name: None,
    });

    let config = json!({
        "max_players": 300
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
}

#[test]
fn test_number_field_invalid_string() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "max_players".to_string(),
        flag: "--max-players".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: None,
            max: None,
        }),
        default: None,
        required: false,
        description: "Max players".to_string(),
        display_name: None,
    });

    let config = json!({
        "max_players": "not_a_number"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    match &result.unwrap_err()[0] {
        SchemaValidationError::InvalidFieldValue(field, msg) => {
            assert_eq!(field, "max_players");
            assert!(msg.contains("Cannot parse"));
        }
        _ => panic!("Expected InvalidFieldValue"),
    }
}

#[test]
fn test_enum_field_valid() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "difficulty".to_string(),
        flag: "--difficulty".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["easy".to_string(), "normal".to_string(), "hard".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Difficulty".to_string(),
        display_name: None,
    });

    let config = json!({
        "difficulty": "normal"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_enum_field_invalid() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "difficulty".to_string(),
        flag: "--difficulty".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["easy".to_string(), "normal".to_string(), "hard".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Difficulty".to_string(),
        display_name: None,
    });

    let config = json!({
        "difficulty": "impossible"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    let errors = result.unwrap_err();
    match &errors[0] {
        SchemaValidationError::InvalidFieldValue(field, msg) => {
            assert_eq!(field, "difficulty");
            assert!(msg.contains("Invalid enum value"));
        }
        _ => panic!("Expected InvalidFieldValue"),
    }
}

#[test]
fn test_boolean_field_valid() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "enable_pvp".to_string(),
        flag: "--pvp".to_string(),
        use_equals: false,
        arg_type: ArgumentType::Boolean,
        default: None,
        required: false,
        description: "Enable PvP".to_string(),
        display_name: None,
    });

    let config = json!({
        "enable_pvp": true
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_condition_equals_true() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "difficulty".to_string(),
        flag: "--difficulty".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["easy".to_string(), "hard".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Difficulty".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "extra_loot".to_string(),
        flag: "--loot".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["low".to_string(), "high".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Loot level".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "difficulty".to_string(),
            operator: ConditionOperator::Equals,
            value: ConditionValue::Single("hard".to_string()),
        },
        target_field_name: "extra_loot".to_string(),
        constraint: FieldConstraint::RestrictEnum {
            values: vec!["high".to_string()],
            display_names: None,
        },
    });

    let config = json!({
        "difficulty": "hard",
        "extra_loot": "high"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_condition_equals_constraint_violated() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "difficulty".to_string(),
        flag: "--difficulty".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["easy".to_string(), "hard".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Difficulty".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "extra_loot".to_string(),
        flag: "--loot".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["low".to_string(), "high".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Loot level".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "difficulty".to_string(),
            operator: ConditionOperator::Equals,
            value: ConditionValue::Single("hard".to_string()),
        },
        target_field_name: "extra_loot".to_string(),
        constraint: FieldConstraint::RestrictEnum {
            values: vec!["high".to_string()],
            display_names: None,
        },
    });

    let config = json!({
        "difficulty": "hard",
        "extra_loot": "low"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    let errors = result.unwrap_err();
    match &errors[0] {
        SchemaValidationError::InvalidFieldValue(field, msg) => {
            assert_eq!(field, "extra_loot");
            assert!(msg.contains("not allowed"));
        }
        _ => panic!("Expected InvalidFieldValue"),
    }
}

#[test]
fn test_condition_not_met_no_constraint() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "difficulty".to_string(),
        flag: "--difficulty".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["easy".to_string(), "hard".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Difficulty".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "extra_loot".to_string(),
        flag: "--loot".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["low".to_string(), "high".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Loot level".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "difficulty".to_string(),
            operator: ConditionOperator::Equals,
            value: ConditionValue::Single("hard".to_string()),
        },
        target_field_name: "extra_loot".to_string(),
        constraint: FieldConstraint::RestrictEnum {
            values: vec!["high".to_string()],
            display_names: None,
        },
    });

    let config = json!({
        "difficulty": "easy",
        "extra_loot": "low"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_condition_greater_than() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "max_players".to_string(),
        flag: "--max-players".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: None,
            max: None,
        }),
        default: None,
        required: false,
        description: "Max players".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "server_ram".to_string(),
        flag: "--ram".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: None,
            max: None,
        }),
        default: None,
        required: false,
        description: "Server RAM".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "max_players".to_string(),
            operator: ConditionOperator::GreaterThan,
            value: ConditionValue::Single("100".to_string()),
        },
        target_field_name: "server_ram".to_string(),
        constraint: FieldConstraint::RestrictNumber {
            min: Some(8.0),
            max: None,
        },
    });

    let config = json!({
        "max_players": 150,
        "server_ram": 16
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_condition_less_than() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "player_count".to_string(),
        flag: "--players".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: None,
            max: None,
        }),
        default: None,
        required: false,
        description: "Player count".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "mode".to_string(),
        flag: "--mode".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["singleplayer".to_string(), "multiplayer".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Mode".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "player_count".to_string(),
            operator: ConditionOperator::LessThan,
            value: ConditionValue::Single("2".to_string()),
        },
        target_field_name: "mode".to_string(),
        constraint: FieldConstraint::RestrictEnum {
            values: vec!["singleplayer".to_string()],
            display_names: None,
        },
    });

    let config = json!({
        "player_count": 1,
        "mode": "singleplayer"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_condition_contains() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "server_name".to_string(),
        flag: "--name".to_string(),
        use_equals: false,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Server name".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "pvp_enabled".to_string(),
        flag: "--pvp".to_string(),
        use_equals: false,
        arg_type: ArgumentType::Boolean,
        default: None,
        required: false,
        description: "PvP enabled".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "server_name".to_string(),
            operator: ConditionOperator::Contains,
            value: ConditionValue::Single("PvP".to_string()),
        },
        target_field_name: "pvp_enabled".to_string(),
        constraint: FieldConstraint::Required,
    });

    let config = json!({
        "server_name": "PvP Arena",
        "pvp_enabled": true
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_condition_in_operator() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "game_type".to_string(),
        flag: "--type".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec![
                "survival".to_string(),
                "creative".to_string(),
                "adventure".to_string(),
            ],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Game type".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "difficulty_locked".to_string(),
        flag: "--lock-difficulty".to_string(),
        use_equals: false,
        arg_type: ArgumentType::Boolean,
        default: None,
        required: false,
        description: "Lock difficulty".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "game_type".to_string(),
            operator: ConditionOperator::In,
            value: ConditionValue::Multiple(vec!["survival".to_string(), "adventure".to_string()]),
        },
        target_field_name: "difficulty_locked".to_string(),
        constraint: FieldConstraint::Required,
    });

    let config = json!({
        "game_type": "survival",
        "difficulty_locked": true
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_condition_matches_regex() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "port".to_string(),
        flag: "--port".to_string(),
        use_equals: true,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Port".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "require_auth".to_string(),
        flag: "--auth".to_string(),
        use_equals: false,
        arg_type: ArgumentType::Boolean,
        default: None,
        required: false,
        description: "Require auth".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "port".to_string(),
            operator: ConditionOperator::Matches,
            value: ConditionValue::Single("^(80|443)$".to_string()),
        },
        target_field_name: "require_auth".to_string(),
        constraint: FieldConstraint::Required,
    });

    let config = json!({
        "port": "443",
        "require_auth": true
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_multiple_validation_errors_collected() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "server_name".to_string(),
        flag: "--name".to_string(),
        use_equals: false,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: true,
        description: "Server name".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "max_players".to_string(),
        flag: "--max-players".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: Some(1.0),
            max: Some(256.0),
        }),
        default: None,
        required: true,
        description: "Max players".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "port".to_string(),
        flag: "--port".to_string(),
        use_equals: true,
        arg_type: ArgumentType::String(StringConfig {
            pattern: Some("^\\d{1,5}$".to_string()),
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: true,
        description: "Port".to_string(),
        display_name: None,
    });

    let config = json!({
        "max_players": 300,
        "port": "invalid"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    let errors = result.unwrap_err();
    assert_eq!(errors.len(), 3); // Missing server_name, invalid max_players, invalid port
}

#[test]
fn test_optional_field_with_no_value() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "optional_field".to_string(),
        flag: "--optional".to_string(),
        use_equals: false,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Optional field".to_string(),
        display_name: None,
    });

    let config = json!({});

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_field_with_default_value() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "difficulty".to_string(),
        flag: "--difficulty".to_string(),
        use_equals: true,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: Some("normal".to_string()),
        required: false,
        description: "Difficulty".to_string(),
        display_name: None,
    });

    let config = json!({});

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_restrict_number_constraint() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "player_count".to_string(),
        flag: "--players".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: None,
            max: None,
        }),
        default: None,
        required: false,
        description: "Player count".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "server_ram".to_string(),
        flag: "--ram".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Number(NumberConfig {
            min: None,
            max: None,
        }),
        default: None,
        required: false,
        description: "Server RAM".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "player_count".to_string(),
            operator: ConditionOperator::GreaterThan,
            value: ConditionValue::Single("50".to_string()),
        },
        target_field_name: "server_ram".to_string(),
        constraint: FieldConstraint::RestrictNumber {
            min: Some(8.0),
            max: Some(32.0),
        },
    });

    let config = json!({
        "player_count": 100,
        "server_ram": 16
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_restrict_string_constraint() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "mode".to_string(),
        flag: "--mode".to_string(),
        use_equals: true,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Mode".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "server_name".to_string(),
        flag: "--name".to_string(),
        use_equals: false,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Server name".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "mode".to_string(),
            operator: ConditionOperator::Equals,
            value: ConditionValue::Single("hardcore".to_string()),
        },
        target_field_name: "server_name".to_string(),
        constraint: FieldConstraint::RestrictString {
            pattern: Some("^\\[HC\\]".to_string()),
            min_length: None,
            max_length: None,
        },
    });

    let config = json!({
        "mode": "hardcore",
        "server_name": "[HC] My Server"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_invalid_regex_in_pattern() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "port".to_string(),
        flag: "--port".to_string(),
        use_equals: true,
        arg_type: ArgumentType::String(StringConfig {
            pattern: Some("[invalid".to_string()), // Invalid regex
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Port".to_string(),
        display_name: None,
    });

    let config = json!({
        "port": "8080"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_err());
    let errors = result.unwrap_err();
    match &errors[0] {
        SchemaValidationError::GeneralError(msg) => assert!(msg.contains("Invalid regex")),
        _ => panic!("Expected GeneralError"),
    }
}

#[test]
fn test_null_value_for_optional_field() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "optional_string".to_string(),
        flag: "--opt".to_string(),
        use_equals: false,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Optional".to_string(),
        display_name: None,
    });

    let config = json!({
        "optional_string": null
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

#[test]
fn test_condition_not_equals() {
    let mut schema = create_test_schema();
    schema.args.push(DynamicField {
        name: "difficulty".to_string(),
        flag: "--difficulty".to_string(),
        use_equals: true,
        arg_type: ArgumentType::Enum(EnumConfig {
            values: vec!["easy".to_string(), "normal".to_string(), "hard".to_string()],
            display_names: None,
        }),
        default: None,
        required: false,
        description: "Difficulty".to_string(),
        display_name: None,
    });

    schema.args.push(DynamicField {
        name: "warning_level".to_string(),
        flag: "--warn".to_string(),
        use_equals: true,
        arg_type: ArgumentType::String(StringConfig {
            pattern: None,
            min_length: None,
            max_length: None,
        }),
        default: None,
        required: false,
        description: "Warning level".to_string(),
        display_name: None,
    });

    schema.rules.push(ConditionalRule {
        condition: Condition {
            field_name: "difficulty".to_string(),
            operator: ConditionOperator::NotEquals,
            value: ConditionValue::Single("easy".to_string()),
        },
        target_field_name: "warning_level".to_string(),
        constraint: FieldConstraint::RestrictEnum {
            values: vec!["high".to_string()],
            display_names: None,
        },
    });

    let config = json!({
        "difficulty": "hard",
        "warning_level": "high"
    });

    let result = validate_config(&schema, &config);
    assert!(result.is_ok());
}

use serde::{Deserialize, Serialize};
use ts_rs::TS;

pub trait Validate {
    /// The target type against which validation is performed
    type Target;
    /// Validates the implementing struct against the target
    fn validate(&self, target: &Self::Target) -> Result<(), String>;
}

/// Represents the type of an argument that a game server supports
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, TS)]
#[serde(tag = "type", rename_all = "lowercase")]
#[ts(export)]
pub enum ArgumentType {
    /// A text/string argument
    String(StringConfig),
    /// A numeric argument with optional min/max constraints
    Number(NumberConfig),
    /// A true/false toggle
    Boolean,
    /// A dropdown selector with predefined values
    Enum(EnumConfig),
    /// A flag (boolean) that is represented as a command-line argument
    /// Defaults to false if not provided
    Flag,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct StringConfig {
    /// Optional regex pattern that the string must match
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pattern: Option<String>,
    /// Optional maximum length for the string
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_length: Option<usize>,
    /// Optional minimum length for the string
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min_length: Option<usize>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct NumberConfig {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct EnumConfig {
    /// Possible values for the enum
    pub values: Vec<String>,
}

/// Represents a single dynamic field/argument that a game server supports
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct DynamicField {
    /// Name of this argument
    pub name: String,

    /// Command-line flag associated with this argument (e.g., "--max-players")
    pub flag: String,

    /// Whether to use '=' between flag and value (e.g., --flag=value) (defaults to false)
    #[serde(default)]
    pub use_equals: bool,

    /// The type of this field (includes type-specific configuration)
    #[serde(flatten)]
    pub arg_type: ArgumentType,

    /// Default value for this field (as a string, to be parsed based on arg_type)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default: Option<String>,

    /// Whether this field is required to start the server
    #[serde(default)]
    pub required: bool,

    /// Human-readable description of what this field does
    pub description: String,

    /// Display name for UI purposes
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
}

impl DynamicField {
    /// Validates the field configuration
    pub fn validate(&self) -> Result<(), String> {
        if let ArgumentType::Enum(EnumConfig { values }) = &self.arg_type {
            if values.is_empty() {
                return Err("Enum values cannot be empty".to_string());
            }
        }
        Ok(())
    }
}

/// Represents a complete server configuration
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ServerConfig {
    /// Static fields (flattened into the root)
    #[serde(flatten)]
    pub static_config: StaticConfig,

    /// Dynamic arguments that vary per game/server
    #[serde(default)]
    pub args: Vec<DynamicField>,
}

/// Static configuration for a server
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct StaticConfig {
    /// Steam App ID for this game
    pub steam_app_id: u32,

    /// Name of the executable file (without path)
    pub executable_name: String,

    /// Display name for the server/game
    pub display_name: String,

    /// Version of the config schema
    #[serde(default = "default_schema_version")]
    pub schema_version: String,
}

fn default_schema_version() -> String {
    "1.0.0".to_string()
}

impl ServerConfig {
    /// Creates a new server config with static config and empty dynamic fields
    pub fn new(steam_app_id: u32, executable_name: String, display_name: String) -> Self {
        Self {
            static_config: StaticConfig {
                steam_app_id,
                executable_name,
                display_name,
                schema_version: default_schema_version(),
            },
            args: Vec::new(),
        }
    }

    /// Adds a dynamic field to the config
    pub fn add_field(mut self, name: String, field: DynamicField) -> Self {
        let mut field = field;
        field.name = name;
        self.args.push(field);
        self
    }

    /// Validates the entire config
    pub fn validate(&self) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();

        if self.static_config.steam_app_id == 0 {
            errors.push("steam_app_id cannot be 0".to_string());
        }

        if self.static_config.executable_name.is_empty() {
            errors.push("executable_name cannot be empty".to_string());
        }

        for field in &self.args {
            if let Err(e) = field.validate() {
                errors.push(format!("Field '{}': {}", field.name, e));
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
}

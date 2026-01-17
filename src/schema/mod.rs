pub mod server_config;
pub mod validate_config;

pub use server_config::*;

use serde_json::Value;
use std::collections::HashMap;

/// Represents the configuration values for a game server instance
/// Maps field names to their provided values during server creation
pub type GameConfig = HashMap<String, Value>;

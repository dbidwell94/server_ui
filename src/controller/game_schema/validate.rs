use rocket::{post, serde::json::Json};

use crate::{controller, schema};

#[post("/validate", data = "<_data>")]
pub fn validate_schema(
    _data: Json<schema::server_config::ServerConfig>,
) -> Result<(), controller::Error> {
    Ok(())
}

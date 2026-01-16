use crate::{auth::guards::AccessTokenGuard, schema, service};
use rocket::{put, serde::json::Json};

#[put("/update/<id>", data = "<data>")]
pub async fn update_schema(
    id: i32,
    data: Json<schema::server_config::ServerConfig>,
    schema_service: service::game_schema::GameSchema,
    _auth_guard: AccessTokenGuard,
) -> Result<(), crate::controller::Error> {
    schema_service.update_schema(id, data.0).await?;

    Ok(())
}

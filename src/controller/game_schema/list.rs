use rocket::{get, serde::json::Json};

use crate::{controller, dto, service};

#[get("/list")]
pub async fn get_server_schemas(
    schema_service: service::game_schema::GameSchema,
) -> Result<Json<Vec<dto::game_schema::SchemaMetadata>>, controller::Error> {
    let schemas = schema_service.get_schemas().await?;
    Ok(Json(schemas))
}

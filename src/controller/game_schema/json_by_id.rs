use crate::{controller, schema, service};
use rocket::{get, serde::json::Json};

#[get("/json/<id>")]
pub async fn get_schema_json_by_id(
    id: i32,
    schema_service: service::game_schema::GameSchema,
) -> Result<Json<schema::server_config::ServerConfig>, controller::Error> {
    let schema_json = schema_service.get_schema_json_by_id(id).await?;
    Ok(Json(schema_json))
}

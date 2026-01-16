use rocket::{get, serde::json::Json};

use crate::{controller, dto, service};

#[get("/metadata/<id>")]
pub async fn get_schema_metadata_by_id(
    id: i32,
    schema_service: service::game_schema::GameSchema,
) -> Result<Json<dto::game_schema::SchemaMetadata>, controller::Error> {
    let metadata = schema_service.get_metadata_by_id(id).await?;
    Ok(Json(metadata))
}

use crate::controller;
use crate::schema::server_config::ServerConfig;
use crate::{auth::guards::AccessTokenGuard, service};
use rocket::response::status::Created;
use rocket::{post, serde::json::Json};

#[post("/create", data = "<data>")]
pub async fn create(
    _auth_user: AccessTokenGuard,
    game_schema_service: service::game_schema::GameSchema,
    data: Json<ServerConfig>,
) -> Result<Created<Json<crate::dto::game_schema::SchemaMetadata>>, controller::Error> {
    let new_schema = data.into_inner();
    let schema_id = game_schema_service.insert_schema(new_schema).await?;

    let metadata = game_schema_service.get_metadata_by_id(schema_id).await?;

    let created = Created::new(format!("/api/game_schema/metadata/{}", schema_id));

    Ok(created.body(Json(metadata)))
}

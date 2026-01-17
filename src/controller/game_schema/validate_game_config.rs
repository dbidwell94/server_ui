use crate::{dto, schema, service};
use rocket::{post, response::Responder, serde::json::Json};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Schema validation errors: {0:?}")]
    SchemaValidation(Vec<schema::validate_config::SchemaValidationError>),
    #[error(transparent)]
    SchemaError(#[from] crate::service::game_schema::GameSchemaError),
}

impl Responder<'_, 'static> for Error {
    fn respond_to(self, req: &rocket::Request<'_>) -> rocket::response::Result<'static> {
        match self {
            Error::SchemaValidation(errors) => {
                let error_messages: Vec<String> = errors.iter().map(|e| e.to_string()).collect();

                rocket::response::Response::build()
                    .status(rocket::http::Status::UnprocessableEntity)
                    .sized_body(
                        serde_json::to_string(&error_messages).unwrap().len(),
                        std::io::Cursor::new(serde_json::to_string(&error_messages).unwrap()),
                    )
                    .header(rocket::http::ContentType::JSON)
                    .ok()
            }
            Error::SchemaError(e) => e.respond_to(req),
        }
    }
}

#[post("/validate_game_config", data = "<game_config>")]
pub async fn validate_game_config(
    game_config: Json<dto::game_schema::GameConfig>,
    schema_service: service::game_schema::GameSchema,
) -> Result<(), Error> {
    let game_schema = schema_service
        .get_schema_json_by_id(game_config.schema_id)
        .await?;

    schema::validate_config::validate_config(&game_schema, &game_config.config)
        .map_err(Error::SchemaValidation)?;

    Ok(())
}

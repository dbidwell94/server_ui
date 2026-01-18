use crate::dto::game_schema::SchemaMetadata;
use crate::utils::error_response;
use crate::{auth, entity};
use rocket::request::FromRequest;
use rocket::{http::Status, request::Outcome, response::Responder};
use sea_orm::prelude::*;
use sea_orm::ActiveValue::Set;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum GameSchemaError {
    #[error("database connection not found")]
    DbNotFound,

    #[error("game schema not found")]
    NotFound,

    #[error("A database error occurred. Please review the logs for more details.")]
    DbError(#[from] sea_orm::DbErr),

    #[error(transparent)]
    SchemaError(#[from] serde_json::Error),
}

impl Responder<'_, 'static> for GameSchemaError {
    fn respond_to(self, _: &rocket::Request<'_>) -> rocket::response::Result<'static> {
        let status = match self {
            GameSchemaError::DbNotFound
            | GameSchemaError::DbError(_)
            | GameSchemaError::SchemaError(_) => Status::InternalServerError,
            GameSchemaError::NotFound => Status::NotFound,
        };
        error_response(self, status)
    }
}

pub struct GameSchema {
    db: DatabaseConnection,
    auth_session: Option<auth::guards::AccessTokenGuard>,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for GameSchema {
    type Error = GameSchemaError;

    async fn from_request(request: &'r rocket::Request<'_>) -> Outcome<Self, Self::Error> {
        let auth_session = auth::guards::AccessTokenGuard::from_request(request)
            .await
            .succeeded();

        match request.rocket().state::<DatabaseConnection>() {
            Some(db) => Outcome::Success(GameSchema {
                db: db.clone(),
                auth_session,
            }),
            None => Outcome::Error((
                rocket::http::Status::InternalServerError,
                GameSchemaError::DbNotFound,
            )),
        }
    }
}

impl GameSchema {
    pub async fn get_schemas(&self) -> Result<Vec<SchemaMetadata>, GameSchemaError> {
        let schemas = entity::game_schema::Entity::find()
            .into_model::<SchemaMetadata>()
            .all(&self.db)
            .await?;

        Ok(schemas)
    }

    pub async fn insert_schema(
        &self,
        new_schema: crate::schema::server_config::ServerConfig,
    ) -> Result<i32, GameSchemaError> {
        let auth_user_id = self
            .auth_session
            .as_ref()
            .map(|a| Set(a.user_id))
            .unwrap_or_default();

        let schema_json = serde_json::to_value(new_schema.clone())?;
        let active_model = entity::game_schema::ActiveModel {
            name: Set(new_schema.static_config.display_name),
            schema_version: Set(new_schema.static_config.schema_version),
            steam_app_id: Set(new_schema.static_config.steam_app_id.into()),
            schema_json: Set(schema_json),
            created_by: auth_user_id.clone(),
            updated_by: auth_user_id,
            ..Default::default()
        };
        let res = active_model
            .insert(&self.db)
            .await
            .map_err(GameSchemaError::DbError)?;
        Ok(res.id)
    }

    pub async fn update_schema(
        &self,
        id: i32,
        updated_schema: crate::schema::server_config::ServerConfig,
    ) -> Result<(), GameSchemaError> {
        let auth_user_id = self
            .auth_session
            .as_ref()
            .map(|a| Set(a.user_id))
            .unwrap_or_default();
        let updated_at = Set(chrono::Utc::now());

        let schema_json = serde_json::to_value(updated_schema.clone())?;
        let active_model = entity::game_schema::ActiveModel {
            id: Set(id),
            name: Set(updated_schema.static_config.display_name),
            schema_version: Set(updated_schema.static_config.schema_version),
            steam_app_id: Set(updated_schema.static_config.steam_app_id.into()),
            schema_json: Set(schema_json),
            updated_by: auth_user_id,
            updated_at,
            ..Default::default()
        };

        active_model.update(&self.db).await?;

        Ok(())
    }

    pub async fn delete_by_id(&self, id: i32) -> Result<(), GameSchemaError> {
        let active_model = entity::game_schema::ActiveModel {
            id: Set(id),
            ..Default::default()
        };

        active_model.delete(&self.db).await?;

        Ok(())
    }

    pub async fn get_metadata_by_name_like(
        &self,
        name_like: &str,
    ) -> Result<Vec<crate::dto::game_schema::SchemaMetadata>, GameSchemaError> {
        let schemas = entity::game_schema::Entity::find()
            .filter(entity::game_schema::Column::Name.contains(name_like))
            .into_model::<SchemaMetadata>()
            .all(&self.db)
            .await
            .map_err(GameSchemaError::DbError)?;

        Ok(schemas)
    }

    pub async fn get_schema_json_by_id(
        &self,
        id: i32,
    ) -> Result<crate::schema::server_config::ServerConfig, GameSchemaError> {
        let schema_model = entity::game_schema::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(GameSchemaError::NotFound)?;

        let schema_json: crate::schema::server_config::ServerConfig =
            serde_json::from_value(schema_model.schema_json)?;

        Ok(schema_json)
    }

    pub async fn get_metadata_by_id(
        &self,
        id: i32,
    ) -> Result<crate::dto::game_schema::SchemaMetadata, GameSchemaError> {
        let schema = entity::game_schema::Entity::find_by_id(id)
            .into_model::<SchemaMetadata>()
            .one(&self.db)
            .await?
            .ok_or(GameSchemaError::NotFound)?;

        Ok(schema)
    }
}

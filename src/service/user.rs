use crate::auth;
use crate::dto;
use crate::entity;
use crate::models::user::UserRole;
use crate::utils::error_response;
use argon2::{Argon2, PasswordHash, PasswordVerifier};
use rocket::{
    http::Status,
    request::{FromRequest, Outcome},
    response::Responder,
};
use sea_orm::prelude::*;
use sea_orm::ActiveValue::Set;
use sea_orm::QuerySelect;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("database connection not found")]
    DbNotFound,

    #[error("Failed to hash the provided password")]
    HashError,

    #[error("user with id {0} not found")]
    NotFound(i32),

    #[error("User not found")]
    UsernameNotFound(String),

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("A database error occurred. Please review the logs for more details. .. {0}")]
    DbError(#[from] sea_orm::DbErr),
}

impl<'r> Responder<'r, 'static> for UserError {
    fn respond_to(self, _: &'r rocket::Request<'_>) -> rocket::response::Result<'static> {
        let status = match self {
            UserError::DbNotFound | UserError::DbError(_) | UserError::HashError => {
                Status::InternalServerError
            }
            UserError::NotFound(_) => Status::NotFound,
            UserError::UsernameNotFound(_) | UserError::InvalidCredentials => Status::Unauthorized,
        };
        error_response(self, status)
    }
}

pub struct User {
    db: DatabaseConnection,
    auth_session: Option<auth::guards::AccessTokenGuard>,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for User {
    type Error = UserError;

    async fn from_request(request: &'r rocket::Request<'_>) -> Outcome<Self, Self::Error> {
        let auth_session = auth::guards::AccessTokenGuard::from_request(request)
            .await
            .succeeded();

        match request.rocket().state::<DatabaseConnection>() {
            Some(db) => Outcome::Success(User {
                db: db.clone(),
                auth_session,
            }),
            None => Outcome::Error((
                rocket::http::Status::InternalServerError,
                UserError::DbNotFound,
            )),
        }
    }
}

impl User {
    pub async fn new_user_with_role(
        &self,
        new_user: crate::dto::user::NewWithRole,
    ) -> Result<i32, UserError> {
        let auth_user_id = self.auth_session.as_ref().map(|a| a.user_id);
        let mut active_model = new_user
            .to_active_model()
            .map_err(|_| UserError::HashError)?;

        active_model.created_by = Set(auth_user_id);
        active_model.updated_by = Set(auth_user_id);

        println!("Creating user: {:#?}", active_model);

        let res = active_model.insert(&self.db).await?;

        Ok(res.id)
    }

    pub async fn find_by_id(&self, id: i32) -> Result<entity::user::Model, UserError> {
        entity::user::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(UserError::NotFound(id))
    }

    pub async fn get_user_by_id(&self, id: i32) -> Result<dto::user::Minimum, UserError> {
        let user = self.find_by_id(id).await?;
        Ok(user.into())
    }

    pub async fn find_by_username(&self, username: &str) -> Result<entity::user::Model, UserError> {
        entity::user::Entity::find()
            .filter(entity::user::Column::Name.eq(username))
            .one(&self.db)
            .await?
            .ok_or_else(|| UserError::UsernameNotFound(username.to_string()))
    }

    pub fn verify_password(&self, password: &str, hash: &str) -> Result<(), UserError> {
        let parsed_hash = PasswordHash::new(hash).map_err(|_| UserError::HashError)?;

        Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .map_err(|_| UserError::InvalidCredentials)
    }

    pub async fn has_admin(&self) -> Result<bool, UserError> {
        let admin_count = entity::user::Entity::find()
            .filter(entity::user::Column::Role.eq(UserRole::Admin as i32))
            .limit(1)
            .count(&self.db)
            .await?;
        Ok(admin_count > 0)
    }
}

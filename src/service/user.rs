use crate::dto;
use crate::entity;
use crate::utils::error_response;
use argon2::{Argon2, PasswordHash, PasswordVerifier};
use rocket::{
    http::Status,
    request::{FromRequest, Outcome},
    response::Responder,
};
use sea_orm::prelude::*;
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

    #[error("A database error occurred. Please review the logs for more details.")]
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
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for User {
    type Error = UserError;

    async fn from_request(request: &'r rocket::Request<'_>) -> Outcome<Self, Self::Error> {
        match request.rocket().state::<DatabaseConnection>() {
            Some(db) => Outcome::Success(User { db: db.clone() }),
            None => Outcome::Error((
                rocket::http::Status::InternalServerError,
                UserError::DbNotFound,
            )),
        }
    }
}

impl User {
    pub async fn new_user(&self, new_user: crate::dto::user::New) -> Result<i32, UserError> {
        let active_model = new_user
            .to_active_model()
            .map_err(|_| UserError::HashError)?;

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
        let has_user = entity::user::Entity::find()
            .limit(1)
            .all(&self.db)
            .await?
            .len()
            > 0;
        Ok(has_user)
    }
}

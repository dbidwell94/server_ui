use crate::dto;
use crate::entity;
use crate::utils::error_response;
use rocket::{
    http::Status,
    request::{FromRequest, Outcome},
    response::Responder,
};
use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("database connection not found")]
    DbNotFound,

    #[error("Failed to hash the provided password")]
    HashError,

    #[error("user with id {0} not found")]
    NotFound(i32),

    #[error(transparent)]
    DbError(#[from] sea_orm::DbErr),
}

impl<'r> Responder<'r, 'static> for UserError {
    fn respond_to(self, _: &'r rocket::Request<'_>) -> rocket::response::Result<'static> {
        let status = match self {
            UserError::DbNotFound => Status::InternalServerError,
            UserError::HashError => Status::InternalServerError,
            UserError::NotFound(_) => Status::NotFound,
            UserError::DbError(_) => Status::InternalServerError,
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

    pub async fn get_user_by_id(&self, id: i32) -> Result<dto::user::Minimum, UserError> {
        let user = entity::user::Entity::find_by_id(id).one(&self.db).await?;
        Ok(user.map(Into::into).ok_or(UserError::NotFound(id))?)
    }
}

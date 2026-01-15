use crate::utils::error_response;
use rocket::{
    http::Status,
    request::{FromRequest, Outcome},
    response::Responder,
};
use sea_orm::DatabaseConnection;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("database connection not found")]
    DbNotFound,
}

impl<'r> Responder<'r, 'static> for UserError {
    fn respond_to(self, _: &'r rocket::Request<'_>) -> rocket::response::Result<'static> {
        let status = match self {
            UserError::DbNotFound => Status::InternalServerError,
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
    pub async fn new_user(&self) -> Result<u64, UserError> {
        // Implementation for creating a new user goes here
        Ok(0)
    }
}

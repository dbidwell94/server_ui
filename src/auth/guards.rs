use crate::auth::{verify_token, TokenType};
use crate::dto;
use crate::models::user::UserRole;
use crate::utils::error_response;
use rocket::{
    http::Status,
    request::{FromRequest, Outcome},
    response::Responder,
    Request,
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("Missing authorization token")]
    MissingToken,

    #[error("Invalid token type")]
    InvalidTokenType,

    #[error("Invalid or expired token")]
    InvalidToken,

    #[error("Invalid or expired refresh token")]
    InvalidRefreshToken,

    #[error("User role is invalid")]
    InvalidRole,
}

impl<'r> Responder<'r, 'static> for AuthError {
    fn respond_to(self, _: &'r Request<'_>) -> rocket::response::Result<'static> {
        let status = Status::Unauthorized;
        error_response(self, status)
    }
}

pub struct AccessTokenGuard {
    pub user_id: i32,
    pub username: String,
    pub role: UserRole,
}

impl From<AccessTokenGuard> for dto::user::Minimum {
    fn from(guard: AccessTokenGuard) -> Self {
        dto::user::Minimum {
            id: guard.user_id,
            username: guard.username,
        }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AccessTokenGuard {
    type Error = AuthError;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let token = request
            .headers()
            .get_one("Authorization")
            .and_then(|h| h.strip_prefix("Bearer "))
            .or_else(|| {
                request
                    .uri()
                    .query()
                    .and_then(|q| q.segments().find(|s| s.0 == "token").map(|s| s.1))
            });

        match token {
            None => Outcome::Error((Status::Unauthorized, AuthError::MissingToken)),
            Some(token) => match verify_token(token) {
                Ok(claims) if claims.token_type == TokenType::Access => {
                    Outcome::Success(AccessTokenGuard {
                        user_id: claims.sub,
                        username: claims.username,
                        role: claims.role,
                    })
                }
                Ok(_) => Outcome::Error((Status::Unauthorized, AuthError::InvalidTokenType)),
                Err(_) => Outcome::Error((Status::Unauthorized, AuthError::InvalidToken)),
            },
        }
    }
}

pub struct RefreshTokenGuard {
    pub user_id: i32,
    pub role: UserRole,
    pub username: String,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for RefreshTokenGuard {
    type Error = AuthError;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let refresh_token = request.cookies().get("refreshToken").map(|c| c.value());

        match refresh_token {
            None => Outcome::Error((Status::Unauthorized, AuthError::MissingToken)),
            Some(token) => match verify_token(token) {
                Ok(claims) if claims.token_type == TokenType::Refresh => {
                    Outcome::Success(RefreshTokenGuard {
                        user_id: claims.sub,
                        role: claims.role,
                        username: claims.username,
                    })
                }
                Ok(_) => Outcome::Error((Status::Unauthorized, AuthError::InvalidTokenType)),
                Err(_) => Outcome::Error((Status::Unauthorized, AuthError::InvalidRefreshToken)),
            },
        }
    }
}

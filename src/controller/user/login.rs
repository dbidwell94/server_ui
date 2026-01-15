use rocket::post;

use crate::{auth, dto::user, service};

#[post("/login", data = "<credentials>")]
pub async fn login(
    credentials: rocket::serde::json::Json<user::Login>,
    user_service: service::user::User,
) -> Result<auth::response::AuthResponse, crate::controller::Error> {
    let user_model = user_service.find_by_username(&credentials.username).await?;

    // Verify password
    user_service.verify_password(&credentials.password, &user_model.password_hash)?;

    // Generate tokens
    let token_pair = auth::generate_tokens(user_model.id, user_model.name.clone())
        .map_err(|_| service::user::UserError::HashError)?;

    Ok(auth::response::AuthResponse::new(
        token_pair.access_token,
        user_model.id,
        user_model.name,
        token_pair.refresh_token,
    ))
}

#[post("/refresh")]
pub async fn refresh_token(
    token_guard: auth::guards::RefreshTokenGuard,
    user_service: service::user::User,
) -> Result<auth::response::AuthResponse, auth::guards::AuthError> {
    let user_model = user_service
        .find_by_id(token_guard.user_id)
        .await
        .map_err(|_| auth::guards::AuthError::InvalidToken)?;

    let token_pair = auth::generate_tokens(user_model.id, user_model.name.clone())
        .map_err(|_| auth::guards::AuthError::InvalidToken)?;

    Ok(auth::response::AuthResponse::new(
        token_pair.access_token,
        user_model.id,
        user_model.name,
        token_pair.refresh_token,
    ))
}

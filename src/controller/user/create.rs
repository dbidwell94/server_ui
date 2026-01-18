use crate::{auth, dto::user, models::user::UserRole, service};
use rocket::post;

#[post("/create", data = "<new_user>")]
pub async fn create_user(
    new_user: rocket::serde::json::Json<user::New>,
    user_service: service::user::User,
) -> Result<auth::response::AuthResponse, crate::controller::Error> {
    let created_id = user_service.new_user(new_user.0).await?;

    // Fetch the created user
    let user_model = user_service.find_by_id(created_id).await?;

    // Generate tokens
    let role = UserRole::try_from(user_model.role)?;

    let token_pair = auth::generate_tokens(user_model.id, user_model.name.clone(), role)
        .map_err(|_| service::user::UserError::HashError)?;

    Ok(auth::response::AuthResponse::new(
        token_pair.access_token,
        user_model.id,
        user_model.name,
        token_pair.refresh_token,
    ))
}

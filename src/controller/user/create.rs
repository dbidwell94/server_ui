use rocket::{post, response::status::Created, serde::json::Json};

use crate::{controller, dto::user, service};

#[post("/create", data = "<new_user>")]
pub async fn create_user(
    new_user: Json<user::New>,
    user_service: service::user::User,
) -> Result<Created<()>, controller::Error> {
    let created_id = user_service.new_user(new_user.0).await?;

    let created_route = Created::new(format!("/api/user/{created_id}"));

    Ok(created_route)
}

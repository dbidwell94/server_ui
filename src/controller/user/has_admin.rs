use crate::controller::Error;
use crate::service::user::User;
use rocket::{get, serde::json::Json};

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminStatus {
    has_admin: bool,
}

#[get("/has_admin")]
pub async fn has_admin(user_service: User) -> Result<Json<AdminStatus>, Error> {
    let has_admin = user_service.has_admin().await.unwrap_or(false);
    Ok(Json(AdminStatus { has_admin }))
}

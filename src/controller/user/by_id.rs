use rocket::{get, serde::json::Json};

use crate::{controller, dto, service};

#[get("/<id>")]
pub async fn get_user_by_id(
    id: i32,
    user_service: service::user::User,
) -> Result<Json<dto::user::Minimum>, controller::Error> {
    let user = user_service.get_user_by_id(id).await?;
    Ok(Json(user))
}

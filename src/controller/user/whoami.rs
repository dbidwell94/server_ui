use crate::{auth::guards::AccessTokenGuard, dto};
use rocket::{get, serde::json::Json};

#[get("/whoami")]
pub async fn whoami(auth_guard: AccessTokenGuard) -> Json<dto::user::Minimum> {
    Json(auth_guard.into())
}

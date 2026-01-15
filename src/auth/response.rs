use crate::dto::user::AuthResponse as UserAuthResponse;
use rocket::{
    http::{Cookie, Status},
    response::{self, Responder, Response},
    time::Duration,
    Request,
};
use std::io::Cursor;

/// Response that includes setting a refresh token cookie
pub struct AuthResponse {
    pub access_token: String,
    pub user_id: i32,
    pub username: String,
    pub refresh_token: String,
}

impl AuthResponse {
    pub fn new(
        access_token: String,
        user_id: i32,
        username: String,
        refresh_token: String,
    ) -> Self {
        Self {
            access_token,
            user_id,
            username,
            refresh_token,
        }
    }
}

impl<'r> Responder<'r, 'static> for AuthResponse {
    fn respond_to(self, request: &'r Request<'_>) -> response::Result<'static> {
        let user_auth = UserAuthResponse {
            user: crate::dto::user::Minimum {
                id: self.user_id,
                username: self.username,
            },
            access_token: self.access_token,
        };

        let body = serde_json::to_string(&user_auth).map_err(|_| Status::InternalServerError)?;

        // Create HTTP-only refresh token cookie
        let mut cookie = Cookie::new("refreshToken", self.refresh_token);
        cookie.set_http_only(true);
        // Set secure flag if request is HTTPS (check host header for localhost exception)
        let host = request.headers().get_one("Host").unwrap_or("");
        if !host.starts_with("localhost") && !host.starts_with("127.0.0.1") {
            cookie.set_secure(true);
        }
        cookie.set_same_site(rocket::http::SameSite::Strict);
        cookie.set_path("/");
        cookie.set_max_age(Duration::days(7));

        // Add cookie to response
        request.cookies().add(cookie);

        Response::build()
            .status(Status::Ok)
            .header(rocket::http::ContentType::JSON)
            .sized_body(Some(body.len()), Cursor::new(body))
            .ok()
    }
}

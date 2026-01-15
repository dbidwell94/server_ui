use rocket::http::Status;
use serde_json::json;
use std::io::Cursor;

/// Helper function to create a JSON error response
pub fn error_response<T: std::fmt::Display>(
    error: T,
    status: Status,
) -> rocket::response::Result<'static> {
    let body = json!({
        "error": error.to_string()
    })
    .to_string();

    rocket::response::Response::build()
        .status(status)
        .header(rocket::http::ContentType::JSON)
        .sized_body(body.len(), Cursor::new(body))
        .ok()
}

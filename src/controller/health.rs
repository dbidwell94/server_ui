use crate::service::steamcmd::{SteamCMD, SteamCmdError};
use rocket::serde::json::Json;
use rocket::{get, routes, Route};

#[get("/health")]
fn health(steam_cmd: Result<SteamCMD, SteamCmdError>) -> Json<serde_json::Value> {
    let mut errors = Vec::<String>::new();

    if let Err(e) = steam_cmd {
        errors.push(e.to_string());
    }

    Json(serde_json::json!({
        "status": if errors.is_empty() {"healthy"} else {"error"},
        "message": "Server is running!",
        "errors": errors
    }))
}

pub fn routes() -> Vec<Route> {
    routes![health]
}

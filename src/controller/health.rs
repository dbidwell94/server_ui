use crate::service::steamcmd::{SteamCMD, SteamCmdError};
use rocket::serde::json::Json;
use rocket::{get, routes, Route};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct HealthResponse {
    pub status: String,
    pub message: String,
    pub errors: Vec<String>,
}

#[get("/health")]
fn health(steam_cmd: Result<SteamCMD, SteamCmdError>) -> Json<HealthResponse> {
    let mut errors = Vec::<String>::new();

    if let Err(e) = steam_cmd {
        errors.push(e.to_string());
    }

    Json(HealthResponse {
        status: if errors.is_empty() {
            "healthy".to_string()
        } else {
            "error".to_string()
        },
        message: "Server is running!".to_string(),
        errors,
    })
}

pub fn routes() -> Vec<Route> {
    routes![health]
}

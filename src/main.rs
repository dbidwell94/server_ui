pub mod auth;
mod controller;
pub mod db;
pub mod dto;
pub mod entity;
pub mod schema;
pub mod service;
pub mod state;
pub mod utils;

use dotenvy::dotenv;
use rocket::http::Method;
use rocket::{get, routes};

#[cfg(not(feature = "local-dev"))]
use rocket::http::{ContentType, Status};

#[cfg(not(feature = "local-dev"))]
use rocket::response::Responder;

#[cfg(not(feature = "local-dev"))]
use rocket::{Request, Response};
use rocket_ext::cors::Cors;

#[cfg(not(feature = "local-dev"))]
use std::io::Cursor;

#[cfg(not(feature = "local-dev"))]
use rust_embed::RustEmbed;

#[cfg(not(feature = "local-dev"))]
#[derive(RustEmbed)]
#[folder = "static/"]
struct StaticFiles;

#[cfg(not(feature = "local-dev"))]
// Custom responder for embedded files
struct EmbeddedFile {
    content: Vec<u8>,
    content_type: ContentType,
}

#[cfg(not(feature = "local-dev"))]
impl<'r> Responder<'r, 'static> for EmbeddedFile {
    fn respond_to(self, _: &'r Request<'_>) -> rocket::response::Result<'static> {
        Response::build()
            .header(self.content_type)
            .sized_body(self.content.len(), Cursor::new(self.content))
            .ok()
    }
}

#[cfg(not(feature = "local-dev"))]
// Serve static files with proper content types
fn get_embedded_file(path: &str) -> Option<EmbeddedFile> {
    StaticFiles::get(path).map(|file| {
        let content_type = mime_guess::from_path(path)
            .first()
            .and_then(|mime| ContentType::parse_flexible(mime.as_ref()))
            .unwrap_or(ContentType::Binary);

        EmbeddedFile {
            content: file.data.to_vec(),
            content_type,
        }
    })
}

#[cfg(not(feature = "local-dev"))]
// Serve any static file from the root, or index.html as fallback for SPA routing
#[get("/<path..>", rank = 10)]
fn static_files(path: std::path::PathBuf) -> Result<EmbeddedFile, Status> {
    // Convert path to string, using lossy conversion for non-UTF8 paths
    let path_str = path.to_string_lossy();

    // Try to serve the exact file first
    if let Some(file) = get_embedded_file(&path_str) {
        return Ok(file);
    }

    // If not found, serve index.html for SPA routing
    get_embedded_file("index.html").ok_or(Status::NotFound)
}

#[cfg(feature = "local-dev")]
// In local dev mode, provide a helpful message to use the Vite dev server
#[get("/<_path..>", rank = 10)]
fn dev_mode_fallback(_path: std::path::PathBuf) -> rocket::serde::json::Json<serde_json::Value> {
    rocket::serde::json::Json(serde_json::json!({
        "message": "Running in local development mode. Please use the Vite dev server at http://localhost:5173",
        "api_available": true,
        "api_health": "/api/health"
    }))
}

#[rocket::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    // Initialize database
    #[cfg(feature = "local-dev")]
    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite::memory:".to_string());

    #[cfg(not(feature = "local-dev"))]
    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://data/server_ui.db".to_string());

    let db = db::init(&database_url).await?;
    let mut steamcmd = state::steamcmd::SteamCMD::create(None)?;
    steamcmd.init().await?;

    let mut rocket = rocket::build().manage(db).manage(steamcmd);

    // Mount all API routes with their respective base paths
    for (base_path, routes) in controller::get_all_routes() {
        rocket = rocket.mount(base_path, routes);
    }

    let cors = Cors::builder()
        .with_any_origin()
        .with_methods(&[
            Method::Get,
            Method::Post,
            Method::Put,
            Method::Delete,
            Method::Options,
        ])
        .with_max_age(std::time::Duration::from_secs(3600))
        .with_headers(&["Content-Type", "Authorization"])
        .build()?;

    #[cfg(not(feature = "local-dev"))]
    {
        rocket = rocket.mount("/", routes![static_files]).attach(cors);
        rocket.launch().await?;
    }

    #[cfg(feature = "local-dev")]
    {
        rocket = rocket.mount("/", routes![dev_mode_fallback]).attach(cors);
        rocket.launch().await?;
    }

    Ok(())
}

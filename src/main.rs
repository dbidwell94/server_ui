use rocket::serde::json::Json;
use rocket::{get, routes};

#[cfg(not(feature = "local-dev"))]
use rocket::http::{ContentType, Status};

#[cfg(not(feature = "local-dev"))]
use rocket::response::Responder;

#[cfg(not(feature = "local-dev"))]
use rocket::{Request, Response};

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

// API Routes
#[get("/api/health")]
fn api_health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "healthy",
        "message": "Server is running!"
    }))
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
fn dev_mode_fallback(_path: std::path::PathBuf) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "Running in local development mode. Please use the Vite dev server at http://localhost:5173",
        "api_available": true,
        "api_health": "/api/health"
    }))
}

#[rocket::main]
async fn main() -> Result<(), Box<rocket::Error>> {
    let rocket = rocket::build();

    #[cfg(not(feature = "local-dev"))]
    let rocket = rocket.mount("/", routes![api_health, static_files]);

    #[cfg(feature = "local-dev")]
    let rocket = rocket.mount("/", routes![api_health, dev_mode_fallback]);

    rocket.launch().await.map_err(Box::new)?;

    Ok(())
}

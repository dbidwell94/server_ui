use rocket::http::{ContentType, Status};
use rocket::response::Responder;
use rocket::serde::json::Json;
use rocket::{get, routes, Request, Response};
use rust_embed::RustEmbed;
use std::io::Cursor;

#[derive(RustEmbed)]
#[folder = "static/"]
struct StaticFiles;

// Custom responder for embedded files
struct EmbeddedFile {
    content: Vec<u8>,
    content_type: ContentType,
}

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

// Serve static files with proper content types
fn get_embedded_file(path: &str) -> Option<EmbeddedFile> {
    StaticFiles::get(path).map(|file| {
        let content_type = mime_guess::from_path(path)
            .first()
            .and_then(|mime| ContentType::parse_flexible(&mime.to_string()))
            .unwrap_or(ContentType::Binary);
        
        EmbeddedFile {
            content: file.data.to_vec(),
            content_type,
        }
    })
}

// Serve index.html for all non-API routes (SPA routing)
#[get("/<_path..>", rank = 10)]
fn spa_route(_path: std::path::PathBuf) -> Result<EmbeddedFile, Status> {
    get_embedded_file("index.html").ok_or(Status::NotFound)
}

// Serve static assets
#[get("/assets/<file..>")]
fn assets(file: std::path::PathBuf) -> Result<EmbeddedFile, Status> {
    let path = format!("assets/{}", file.display());
    get_embedded_file(&path).ok_or(Status::NotFound)
}

// Serve vite.svg
#[get("/vite.svg")]
fn vite_svg() -> Result<EmbeddedFile, Status> {
    get_embedded_file("vite.svg").ok_or(Status::NotFound)
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    let _rocket = rocket::build()
        .mount("/", routes![api_health, assets, vite_svg, spa_route])
        .launch()
        .await?;

    Ok(())
}

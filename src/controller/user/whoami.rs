use rocket::get;

#[get("/whoami")]
pub async fn whoami() -> &'static str {
    "whoami"
}

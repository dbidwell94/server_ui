mod health;
mod user;

use rocket::{response::Responder, Route};
use thiserror::Error;

const BASE_PATH: &str = "/api";

pub fn get_all_routes() -> Vec<(&'static str, Vec<Route>)> {
    let mut routes = vec![(BASE_PATH, health::routes())];

    routes.extend(user::get_all_routes());

    routes
}

#[derive(Error, Debug)]
pub enum Error {
    #[error(transparent)]
    User(#[from] crate::service::user::UserError),

    #[error(transparent)]
    SteamCMD(#[from] crate::service::steamcmd::SteamCmdError),
}

impl<'r> Responder<'r, 'static> for Error {
    fn respond_to(self, req: &'r rocket::Request<'_>) -> rocket::response::Result<'static> {
        match self {
            Error::User(e) => e.respond_to(req),
            Error::SteamCMD(e) => e.respond_to(req),
        }
    }
}

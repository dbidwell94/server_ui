use rocket::{
    http::Status,
    outcome::Outcome,
    request::{self, FromRequest},
    Request,
};
use std::{ops::Deref, path::PathBuf};
use thiserror::Error;
use which::which;

#[derive(Error, Debug)]
pub enum SteamCmdError {
    #[error("steamcmd not found")]
    CommandNotFound,
}

pub struct SteamCMD(PathBuf);

impl Deref for SteamCMD {
    type Target = PathBuf;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for SteamCMD {
    type Error = SteamCmdError;

    async fn from_request(_: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let cmd = match which("steamcmd") {
            Err(_) => {
                return Outcome::Error((
                    Status::InternalServerError,
                    SteamCmdError::CommandNotFound,
                ));
            }
            Ok(buf) => buf,
        };

        Outcome::Success(Self(cmd))
    }
}

impl SteamCMD {}

use rocket::{
    http::Status,
    outcome::Outcome,
    request::{self, FromRequest},
    response::Responder,
    Request,
};
use std::{ops::Deref, path::PathBuf};
use thiserror::Error;
use which::which;

use crate::utils::error_response;

#[derive(Error, Debug)]
pub enum SteamCmdError {
    #[error("steamcmd not found")]
    CommandNotFound,
}

impl<'r> Responder<'r, 'static> for SteamCmdError {
    fn respond_to(self, _: &'r Request<'_>) -> rocket::response::Result<'static> {
        let status = match self {
            SteamCmdError::CommandNotFound => Status::InternalServerError,
        };

        error_response(self, status)
    }
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

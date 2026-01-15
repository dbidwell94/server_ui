use rocket::{futures::lock::Mutex, http::Status, response::Responder, Request};
use std::{path::PathBuf, process::Stdio, sync::Arc};
use thiserror::Error;
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    process::{Child, ChildStdin, Command},
    sync::broadcast,
};
use which::which;

use crate::utils::error_response;

#[derive(Error, Debug)]
pub enum SteamCmdError {
    #[error("steamcmd not found")]
    CommandNotFound,

    #[error("Failed to start steamcmd process")]
    FailedToStart,
}

impl<'r> Responder<'r, 'static> for SteamCmdError {
    fn respond_to(self, _: &'r Request<'_>) -> rocket::response::Result<'static> {
        let status = match self {
            Self::CommandNotFound | Self::FailedToStart => Status::InternalServerError,
        };

        error_response(self, status)
    }
}

pub struct SteamCMD {
    path: PathBuf,
    child: Arc<Mutex<Option<Child>>>,
    stdin: Arc<Mutex<Option<ChildStdin>>>,
    stdout_tx: broadcast::Sender<String>,
}

impl Drop for SteamCMD {
    fn drop(&mut self) {
        let child_arc = self.child.clone();

        tokio::spawn(async move {
            let mut guard = child_arc.lock().await;

            if let Some(mut child) = guard.take() {
                let _ = child.start_kill();
                let _ = child.wait().await;
            }
        });
    }
}

impl SteamCMD {
    pub fn create() -> Result<Self, SteamCmdError> {
        let path = which("steamcmd").map_err(|_| SteamCmdError::CommandNotFound)?;

        let (tx, _) = broadcast::channel(200);

        Ok(Self {
            path,
            child: Default::default(),
            stdin: Default::default(),
            stdout_tx: tx,
        })
    }

    pub fn subscribe(&self) -> broadcast::Receiver<String> {
        self.stdout_tx.subscribe()
    }

    pub async fn init(&mut self) -> Result<(), SteamCmdError> {
        let mut cmd = Command::new(self.path.as_path())
            .arg("+login anonymous")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|_| SteamCmdError::FailedToStart)?;

        let stdin = cmd.stdin.take();
        let stdout = cmd.stdout.take();

        let (Some(stdin), Some(stdout)) = (stdin, stdout) else {
            let _ = cmd.kill().await;

            return Err(SteamCmdError::FailedToStart);
        };

        {
            let mut guard = self.stdin.lock().await;
            *guard = Some(stdin);
        }
        {
            let tx_clone = self.stdout_tx.clone();
            tokio::spawn(async move {
                let mut reader = BufReader::new(stdout).lines();

                while let Ok(Some(line)) = reader.next_line().await {
                    let _ = tx_clone.send(line);
                }
            });
        }
        {
            let mut guard = self.child.lock().await;
            *guard = Some(cmd);
        }

        Ok(())
    }
}

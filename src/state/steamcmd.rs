use rocket::{futures::lock::Mutex, http::Status, response::Responder, Request};
use std::{collections::VecDeque, path::PathBuf, process::Stdio, sync::Arc, thread};
use thiserror::Error;
use tokio::{
    io::{AsyncWriteExt, BufReader},
    process::{Child, ChildStdin, Command},
    sync::broadcast,
    task::JoinHandle,
};
use tokio_util::sync::CancellationToken;
use which::which;

use crate::utils::error_response;

fn strip_ansi_codes(s: &str) -> String {
    let mut result = String::new();
    let mut in_escape = false;

    for ch in s.chars() {
        if ch == '\x1b' {
            in_escape = true;
        } else if in_escape {
            if ch == 'm' {
                in_escape = false;
            }
            // Skip everything while in escape sequence
        } else {
            result.push(ch);
        }
    }

    result
}

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
    stdout_task: Arc<Mutex<Option<JoinHandle<()>>>>,
    cancel_token: CancellationToken,
    last_lines: Arc<Mutex<VecDeque<String>>>,
    history_capacity: usize,
}

impl Drop for SteamCMD {
    fn drop(&mut self) {
        self.cancel_token.cancel();

        let child_arc = self.child.clone();
        let stdin_arc = self.stdin.clone();
        let task_arc = self.stdout_task.clone();

        _ = thread::spawn(async move || {
            // Wait for stdout task to finish
            if let Some(handle) = task_arc.lock().await.take() {
                let _ = handle.await;
            }

            let mut child_guard = child_arc.lock().await;
            let mut stdin_guard = stdin_arc.lock().await;

            if let Some(mut stdin) = stdin_guard.take() {
                _ = stdin.write_all(b"quit\n").await;
                _ = stdin.flush().await;
            }

            if let Some(mut child) = child_guard.take() {
                _ = child.kill().await;
            }
        })
        .join();
    }
}

impl SteamCMD {
    /// Default capacity for the history of last lines.
    const DEFAULT_HISTORY_CAPACITY: usize = 200;

    pub fn create(history_capacity: Option<usize>) -> Result<Self, SteamCmdError> {
        let path = which("steamcmd").map_err(|_| SteamCmdError::CommandNotFound)?;
        let capacity = history_capacity.unwrap_or(Self::DEFAULT_HISTORY_CAPACITY);
        let (tx, _) = broadcast::channel(capacity);

        Ok(Self {
            path,
            child: Default::default(),
            stdin: Default::default(),
            stdout_tx: tx,
            stdout_task: Default::default(),
            cancel_token: CancellationToken::new(),
            last_lines: Arc::new(Mutex::new(VecDeque::with_capacity(capacity))),
            history_capacity: capacity,
        })
    }

    pub fn subscribe(&self) -> broadcast::Receiver<String> {
        self.stdout_tx.subscribe()
    }

    pub async fn get_last_lines(&self) -> Vec<String> {
        self.last_lines.lock().await.iter().cloned().collect()
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
            let cancel_token = self.cancel_token.clone();
            let last_lines = self.last_lines.clone();
            let capacity = self.history_capacity;

            let handle = tokio::spawn(async move {
                use tokio::io::AsyncReadExt;

                let mut reader = BufReader::new(stdout);
                let mut buffer = [0u8; 1024];
                let mut line_buffer = String::new();
                let mut flush_interval =
                    tokio::time::interval(tokio::time::Duration::from_millis(500));

                loop {
                    tokio::select! {
                        _ = cancel_token.cancelled() => break,
                        _ = flush_interval.tick() => {
                            // Periodically flush any buffered content (e.g., prompts without newlines)
                            // Send without adding newline since the original output didn't have one
                            if !line_buffer.trim().is_empty() {
                                let clean_line = strip_ansi_codes(&line_buffer);
                                if !clean_line.trim().is_empty() {
                                    let mut cache = last_lines.lock().await;
                                    cache.push_back(clean_line.clone());
                                    if cache.len() > capacity {
                                        cache.pop_front();
                                    }
                                    _ = tx_clone.send(clean_line);
                                }
                                line_buffer.clear();
                            }
                        }
                        result = reader.read(&mut buffer) => {
                            match result {
                                Ok(0) => break, // EOF
                                Ok(n) => {
                                    // Reset the flush interval timer on data arrival
                                    flush_interval.reset();

                                    let chunk = String::from_utf8_lossy(&buffer[..n]);

                                    for ch in chunk.chars() {
                                        if ch == '\n' {
                                            let clean_line = strip_ansi_codes(&line_buffer);
                                            if !clean_line.trim().is_empty() {
                                                let line_with_newline = format!("{}\n", clean_line);
                                                let mut cache = last_lines.lock().await;
                                                cache.push_back(line_with_newline.clone());
                                                if cache.len() > capacity {
                                                    cache.pop_front();
                                                }
                                                _ = tx_clone.send(line_with_newline);
                                            }
                                            line_buffer.clear();
                                        } else {
                                            line_buffer.push(ch);
                                        }
                                    }
                                }
                                Err(_) => break,
                            }
                        }
                    }
                }

                // Send any remaining content in the buffer (e.g., the prompt without newline)
                // Send without adding newline since the original output didn't have one
                let clean_line = strip_ansi_codes(&line_buffer);
                if !clean_line.trim().is_empty() {
                    let mut cache = last_lines.lock().await;
                    cache.push_back(clean_line.clone());
                    if cache.len() > capacity {
                        cache.pop_front();
                    }
                    _ = tx_clone.send(clean_line);
                }
            });

            let mut guard = self.stdout_task.lock().await;
            *guard = Some(handle);
        }
        {
            let mut guard = self.child.lock().await;
            *guard = Some(cmd);
        }

        Ok(())
    }
}

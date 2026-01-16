use crate::{auth::guards::AccessTokenGuard, state::steamcmd::SteamCMD};
use rocket::{
    get,
    response::stream::{Event, EventStream},
    Shutdown, State,
};

#[get("/stdout")]
pub async fn stdout(
    steamcmd: &State<SteamCMD>,
    mut shutdown: Shutdown,
    _auth_guard: AccessTokenGuard,
) -> EventStream![] {
    let mut rx = steamcmd.subscribe();
    let last_lines = steamcmd.get_last_lines().await;

    EventStream! {
        // Send all cached lines from history
        for line in last_lines {
            yield Event::data(line);
        }

        loop {
            tokio::select! {
                _ = &mut shutdown => {
                    break;
                },
                msg = rx.recv() => {
                    match msg {
                        Ok(msg) => {
                            yield Event::data(msg)
                        },
                        Err(e) => {
                            println!("Error receiving stdout message: {}", e);
                            break
                        },
                    }
                }
            }
        }
    }
}

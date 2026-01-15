use crate::state::steamcmd::SteamCMD;
use rocket::{
    get,
    response::stream::{Event, EventStream},
    State,
};

#[get("/stdout")]
pub async fn stdout(steamcmd: &State<SteamCMD>) -> EventStream![] {
    let mut rx = steamcmd.subscribe();

    EventStream! {
        loop {
            if let Ok(msg) = rx.recv().await {
                yield Event::data(msg)
            }
        }
    }
}

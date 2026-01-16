mod create;
mod get_by_id;
mod json_by_id;

use rocket::{routes, Route};

const BASE_PATH: &str = "/api/game_schema";

pub fn get_all_routes() -> Vec<(&'static str, Vec<Route>)> {
    vec![(
        BASE_PATH,
        routes![
            create::create,
            get_by_id::get_schema_metadata_by_id,
            json_by_id::get_schema_json_by_id
        ],
    )]
}

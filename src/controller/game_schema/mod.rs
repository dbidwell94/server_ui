mod create;
mod get_by_id;
mod json_by_id;
mod list;
mod update_schema;
mod validate;
mod validate_game_config;

use rocket::{routes, Route};

const BASE_PATH: &str = "/api/game_schema";

pub fn get_all_routes() -> Vec<(&'static str, Vec<Route>)> {
    vec![(
        BASE_PATH,
        routes![
            create::create,
            get_by_id::get_schema_metadata_by_id,
            json_by_id::get_schema_json_by_id,
            list::get_server_schemas,
            update_schema::update_schema,
            validate::validate_schema,
            validate_game_config::validate_game_config
        ],
    )]
}

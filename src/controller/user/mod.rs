mod by_id;
mod create;
mod has_admin;
mod whoami;

use rocket::{routes, Route};

const BASE_PATH: &str = "/api/user";

pub fn get_all_routes() -> Vec<(&'static str, Vec<Route>)> {
    vec![(
        BASE_PATH,
        routes![
            has_admin::has_admin,
            create::create_user,
            whoami::whoami,
            by_id::get_user_by_id
        ],
    )]
}

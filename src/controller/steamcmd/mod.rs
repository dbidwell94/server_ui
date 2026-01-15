mod stdout;

use rocket::{routes, Route};

const BASE_PATH: &str = "/api/steamcmd";

pub fn get_all_routes() -> Vec<(&'static str, Vec<Route>)> {
    vec![(BASE_PATH, routes![stdout::stdout])]
}

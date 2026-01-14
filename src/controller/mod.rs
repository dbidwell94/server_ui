mod health;

use rocket::Route;

const BASE_PATH: &str = "/api";

pub fn get_all_routes() -> Vec<(&'static str, Vec<Route>)> {
    vec![(BASE_PATH, health::routes())]
}

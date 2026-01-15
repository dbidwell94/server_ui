use rocket::{
    http::{Cookie, CookieJar},
    post,
};

#[post("/logout")]
pub fn logout(cookies: &CookieJar) {
    // Create an expired cookie to delete the refresh token
    let mut cookie = Cookie::new("refreshToken", "");
    cookie.set_path("/");

    cookies.remove(cookie);
}

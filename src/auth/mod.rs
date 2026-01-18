use crate::models::user::UserRole;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

pub mod guards;
pub mod response;

static JWT_SECRET: OnceLock<String> = OnceLock::new();

pub fn set_jwt_secret(secret: String) {
    let _ = JWT_SECRET.set(secret);
}

fn get_secret() -> String {
    JWT_SECRET
        .get()
        .cloned()
        .unwrap_or_else(|| "dev-secret-change-in-production".to_string())
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TokenClaims {
    pub sub: i32, // user id
    pub username: String,
    pub role: UserRole,
    pub exp: i64, // expiration time
    pub iat: i64, // issued at
    pub token_type: TokenType,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TokenType {
    Access,
    Refresh,
}

impl TokenClaims {
    pub fn access_token(user_id: i32, username: String, role: UserRole) -> Self {
        let iat = Utc::now();
        let exp = iat + Duration::minutes(15);

        Self {
            sub: user_id,
            username,
            role,
            exp: exp.timestamp(),
            iat: iat.timestamp(),
            token_type: TokenType::Access,
        }
    }

    pub fn refresh_token(user_id: i32, username: String, role: UserRole) -> Self {
        let iat = Utc::now();
        let exp = iat + Duration::days(7);

        Self {
            sub: user_id,
            username,
            role,
            exp: exp.timestamp(),
            iat: iat.timestamp(),
            token_type: TokenType::Refresh,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
}

pub fn generate_tokens(
    user_id: i32,
    username: String,
    role: UserRole,
) -> Result<TokenPair, jsonwebtoken::errors::Error> {
    let access_claims = TokenClaims::access_token(user_id, username.clone(), role);
    let refresh_claims = TokenClaims::refresh_token(user_id, username, role);

    let secret = get_secret();
    let encoding_key = EncodingKey::from_secret(secret.as_bytes());

    let access_token = encode(&Header::default(), &access_claims, &encoding_key)?;
    let refresh_token = encode(&Header::default(), &refresh_claims, &encoding_key)?;

    Ok(TokenPair {
        access_token,
        refresh_token,
    })
}

pub fn verify_token(token: &str) -> Result<TokenClaims, jsonwebtoken::errors::Error> {
    let secret = get_secret();
    let decoding_key = DecodingKey::from_secret(secret.as_bytes());

    let token_data = decode::<TokenClaims>(token, &decoding_key, &Validation::default())?;
    Ok(token_data.claims)
}

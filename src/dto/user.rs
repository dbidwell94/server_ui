use crate::entity::user::ActiveModel;
use crate::models::user::UserRole;
use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHasher};
use rand::thread_rng;
use ts_rs::TS;

#[derive(serde::Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct New {
    pub username: String,
    pub password: String,
}

impl New {
    pub fn to_active_model(self) -> Result<ActiveModel, argon2::password_hash::Error> {
        let salt = SaltString::generate(thread_rng());
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(self.password.as_bytes(), &salt)?
            .to_string();

        Ok(ActiveModel {
            name: sea_orm::ActiveValue::Set(self.username),
            password_hash: sea_orm::ActiveValue::Set(password_hash),
            role: sea_orm::ActiveValue::Set(2), // Default to Moderator
            active: sea_orm::ActiveValue::Set(true),
            ..Default::default()
        })
    }
}

#[derive(serde::Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct NewWithRole {
    pub username: String,
    pub password: String,
    pub role: UserRole,
}

impl NewWithRole {
    pub fn to_active_model(self) -> Result<ActiveModel, argon2::password_hash::Error> {
        let salt = SaltString::generate(thread_rng());
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(self.password.as_bytes(), &salt)?
            .to_string();

        let now = chrono::Utc::now();

        Ok(ActiveModel {
            name: sea_orm::ActiveValue::Set(self.username),
            password_hash: sea_orm::ActiveValue::Set(password_hash),
            role: sea_orm::ActiveValue::Set(self.role as i32),
            active: sea_orm::ActiveValue::Set(true),
            created_at: sea_orm::ActiveValue::Set(now),
            updated_at: sea_orm::ActiveValue::Set(now),
            ..Default::default()
        })
    }
}

#[derive(serde::Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Login {
    pub username: String,
    pub password: String,
}

#[derive(serde::Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Minimum {
    pub id: i32,
    pub username: String,
}

impl From<crate::entity::user::Model> for Minimum {
    fn from(model: crate::entity::user::Model) -> Self {
        Minimum {
            id: model.id,
            username: model.name,
        }
    }
}

#[derive(serde::Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct AuthResponse {
    pub user: Minimum,
    pub access_token: String,
}

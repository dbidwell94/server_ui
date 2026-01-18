use crate::{auth, entity::user::Model as UserModel};
use sea_orm::{FromQueryResult, TryGetable};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(FromQueryResult, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: i32,
    pub name: String,
    #[serde(skip)]
    pub password_hash: String,
    pub role: UserRole,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl TryFrom<UserModel> for User {
    type Error = auth::guards::AuthError;

    fn try_from(model: UserModel) -> Result<Self, Self::Error> {
        Ok(User {
            id: model.id,
            name: model.name,
            password_hash: model.password_hash,
            role: UserRole::try_from(model.role)?,
            created_at: model.created_at,
            updated_at: model.updated_at,
        })
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum UserRole {
    Admin = 1,
    Moderator = 2,
}

impl TryGetable for UserRole {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        index: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: i32 = res.try_get_by(index)?;
        UserRole::try_from(value).map_err(|_| {
            sea_orm::TryGetError::DbErr(sea_orm::DbErr::Custom(String::from(format!(
                "Invalid UserRole value: {}",
                value
            ))))
        })
    }
}

impl TryFrom<i32> for UserRole {
    type Error = auth::guards::AuthError;

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        match value {
            1 => Ok(UserRole::Admin),
            2 => Ok(UserRole::Moderator),
            _ => Err(auth::guards::AuthError::InvalidRole),
        }
    }
}

use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::schema;

#[derive(Serialize, Deserialize, Debug, Clone, TS, FromQueryResult)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SchemaMetadata {
    pub id: i32,
    pub name: String,
    pub schema_version: String,
    pub steam_app_id: i32,
}

#[derive(Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct GameConfig {
    pub schema_id: i32,
    #[ts(type = "Record<string, any>")]
    pub config: schema::GameConfig,
}

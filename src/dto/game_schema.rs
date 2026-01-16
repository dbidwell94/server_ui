use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS, FromQueryResult)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SchemaMetadata {
    pub id: i32,
    pub name: String,
    pub schema_version: String,
    pub steam_app_id: i32,
}

use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(GameSchema::Table)
                    .col(pk_auto(GameSchema::Id))
                    .col(string(GameSchema::Name).not_null())
                    .col(string(GameSchema::SchemaVersion).not_null())
                    .col(integer(GameSchema::SteamAppId).not_null())
                    .col(json(GameSchema::SchemaJson).not_null())
                    .index(
                        Index::create()
                            .unique()
                            .col(GameSchema::Name)
                            .col(GameSchema::SteamAppId),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(
                Table::drop()
                    .table(GameSchema::Table)
                    .if_exists()
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
pub enum GameSchema {
    Table,
    Id,
    Name,
    SchemaVersion,
    SteamAppId,
    SchemaJson,
}

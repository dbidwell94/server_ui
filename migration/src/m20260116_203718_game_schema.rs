use sea_orm_migration::{prelude::*, schema::*};

use crate::m20220101_000001_create_table::User;

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
                    .col(
                        timestamp(GameSchema::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        timestamp(GameSchema::UpdatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(integer(GameSchema::CreatedBy).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .from(GameSchema::Table, GameSchema::CreatedBy)
                            .to(User::Table, User::Id),
                    )
                    .col(integer(GameSchema::UpdatedBy).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .from(GameSchema::Table, GameSchema::UpdatedBy)
                            .to(User::Table, User::Id),
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
    CreatedAt,
    UpdatedAt,
    CreatedBy,
    UpdatedBy,
}

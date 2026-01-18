use crate::{m20220101_000001_create_table::User, m20260116_203718_game_schema::GameSchema};
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(GameConfig::Table)
                    .if_not_exists()
                    .col(pk_auto(GameConfig::Id))
                    .col(string(GameConfig::InstanceName).not_null())
                    .col(integer(GameConfig::SchemaId).not_null())
                    .col(json(GameConfig::ConfigJson).not_null())
                    .col(integer(GameConfig::RestartInterval))
                    .col(integer(GameConfig::BackupInterval))
                    .col(integer(GameConfig::MaxBackupCount).not_null().default(20))
                    .col(integer(GameConfig::Status).not_null().default(0))
                    .col(
                        timestamp(GameConfig::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(integer(GameConfig::CreatedBy).not_null())
                    .col(
                        timestamp(GameConfig::UpdatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(integer(GameConfig::UpdatedBy).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .from(GameConfig::Table, GameConfig::CreatedBy)
                            .to(User::Table, User::Id),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from(GameConfig::Table, GameConfig::UpdatedBy)
                            .to(User::Table, User::Id),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from(GameConfig::Table, GameConfig::SchemaId)
                            .to(GameSchema::Table, GameSchema::Id)
                            .on_update(ForeignKeyAction::Cascade)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .index(
                        Index::create()
                            .unique()
                            .col(GameConfig::InstanceName)
                            .col(GameConfig::SchemaId),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(
                Table::drop()
                    .table(GameConfig::Table)
                    .if_exists()
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum GameConfig {
    Table,
    Id,
    InstanceName,
    SchemaId,
    RestartInterval,
    BackupInterval,
    MaxBackupCount,
    Status,
    ConfigJson,
    CreatedAt,
    UpdatedAt,
    CreatedBy,
    UpdatedBy,
}

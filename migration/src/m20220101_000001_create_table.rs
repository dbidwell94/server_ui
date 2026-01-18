use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(User::Table)
                    .if_not_exists()
                    .col(pk_auto(User::Id))
                    .col(string(User::Name).unique_key().not_null())
                    .col(string(User::PasswordHash).not_null())
                    .col(boolean(User::Active).not_null().default(true))
                    .col(integer(User::Role).not_null())
                    .col(
                        timestamp(User::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(integer_null(User::CreatedBy))
                    .foreign_key(
                        ForeignKey::create()
                            .from(User::Table, User::CreatedBy)
                            .to(User::Table, User::Id),
                    )
                    .col(
                        timestamp(User::UpdatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(integer_null(User::UpdatedBy))
                    .foreign_key(
                        ForeignKey::create()
                            .from(User::Table, User::UpdatedBy)
                            .to(User::Table, User::Id),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(User::Table).if_exists().to_owned())
            .await
    }
}

#[derive(DeriveIden)]
pub enum User {
    Table,
    Id,
    Name,
    PasswordHash,
    Role,
    Active,
    CreatedBy,
    CreatedAt,
    UpdatedBy,
    UpdatedAt,
}

use sea_orm_migration::{
    prelude::*,
    schema::*,
    sea_orm::{DeriveActiveEnum, EnumIter, Iterable},
};

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
                    .col(
                        integer(User::Role)
                            .not_null()
                            .check(Expr::tuple(UserRole::iter().map(|e| Expr::value(e)))),
                    )
                    .col(
                        timestamp(User::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        timestamp(User::UpdatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
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

#[derive(EnumIter, DeriveActiveEnum)]
#[sea_orm(rs_type = "i32", db_type = "Integer")]
pub enum UserRole {
    Admin = 1,
    Moderator = 2,
}

#[derive(DeriveIden)]
enum User {
    Table,
    Id,
    Name,
    PasswordHash,
    Role,
    CreatedAt,
    UpdatedAt,
}

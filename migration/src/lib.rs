pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_table;
mod m20260116_203718_game_schema;
mod m20260118_003246_game_config;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_create_table::Migration),
            Box::new(m20260116_203718_game_schema::Migration),
            Box::new(m20260118_003246_game_config::Migration),
        ]
    }
}

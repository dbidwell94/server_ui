use anyhow::Result;
use migration::MigratorTrait;
use sea_orm::DatabaseConnection;
use std::path::Path;

/// Initialize the database connection and run migrations
pub async fn init(database_url: &str) -> Result<DatabaseConnection> {
    // Extract the database path and create the directory
    let db_path = if let Some(path) = database_url.strip_prefix("sqlite://") {
        path.split('?').next().unwrap_or(path)
    } else {
        database_url
    };

    // Create parent directories if they don't exist
    if let Some(parent) = Path::new(db_path).parent() {
        let parent_str = parent.to_string_lossy();
        if !parent_str.is_empty() && parent_str != "." {
            std::fs::create_dir_all(parent)?;
        }
    }

    // Ensure the connection string has the proper SQLite flags for creation
    let connection_url = if database_url.contains('?') {
        database_url.to_string()
    } else {
        format!("{}?mode=rwc", database_url)
    };

    // Connect to the database
    let db = sea_orm::Database::connect(&connection_url).await?;

    // Run migrations
    run_migrations(&db).await?;

    Ok(db)
}

/// Run database migrations
async fn run_migrations(db: &DatabaseConnection) -> Result<()> {
    migration::Migrator::up(db, None).await?;
    Ok(())
}

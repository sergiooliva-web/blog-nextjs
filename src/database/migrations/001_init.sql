BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS _migration_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_migration_history_version
        UNIQUE (version)
);

COMMIT;
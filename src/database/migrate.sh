#!/bin/sh

DB_PATH=${DB_PATH:-/app/data/dev.db}

mkdir -p /app/data

# Требуется для нормальной работы бд
sqlite3 "$DB_PATH" <<EOF
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 30000;
EOF

# Миграции
for file in /app/migrations/*.sql; do
    filename=$(basename "$file")
    
    applied=$(sqlite3 "$DB_PATH" "SELECT 1 FROM _migration_history WHERE version = '$filename';")

    if [ -z "$applied" ]; then
        echo "Applying migration: $filename"
        
        sqlite3 "$DB_PATH" < "$file"
        
        if [ $? -eq 0 ]; then
            sqlite3 "$DB_PATH" "INSERT INTO _migration_history (version) VALUES ('$filename');"
            echo "Successfully applied: $filename"
        else
            echo "Error applying: $filename"
            exit 1
        fi
    fi
done
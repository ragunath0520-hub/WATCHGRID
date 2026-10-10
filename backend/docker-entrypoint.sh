#!/bin/sh
set -e

echo "[WATCHGRID] Starting backend container entrypoint..."

# Ensure SQLite storage directory exists
mkdir -p /app/data

# Run database seeder if AUTO_SEED is enabled (defaults to true)
if [ "$AUTO_SEED" = "true" ] || [ "$AUTO_SEED" = "1" ]; then
    echo "[WATCHGRID] Running database initialization and seed checks..."
    python seed.py || echo "[!] Database seeding completed with warnings."
fi

echo "[WATCHGRID] Launching application command: $@"
exec "$@"

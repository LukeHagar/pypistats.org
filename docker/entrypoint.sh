#!/usr/bin/env bash
set -euo pipefail

# Wait for Postgres if DATABASE_URL is provided
if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "Waiting for database..."
  ATTEMPTS=0
  until node -e "const { Client } = require('pg'); (async () => { try { const c=new Client({ connectionString: process.env.DATABASE_URL }); await c.connect(); await c.end(); process.exit(0);} catch(e){ process.exit(1);} })()" >/dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS+1))
    if [[ $ATTEMPTS -gt 60 ]]; then
      echo "Database did not become ready in time" >&2
      exit 1
    fi
    sleep 1
  done
fi

# Run Prisma migrations (safe for prod) with retry
if [[ "${RUN_DB_MIGRATIONS:-1}" == "1" ]]; then
  echo "Running prisma migrate deploy..."
  ATTEMPTS=0
  until pnpm prisma migrate deploy; do
    ATTEMPTS=$((ATTEMPTS+1))
    if [[ $ATTEMPTS -gt 10 ]]; then
      echo "Prisma migrate failed after retries" >&2
      exit 1
    fi
    echo "Retrying migrations in 3s..."
    sleep 3
  done
fi

# Start the app (SvelteKit Node adapter)
exec node build/index.js

#!/usr/bin/env bash
set -euo pipefail

# Wait for Postgres if DATABASE_URL is provided
if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "Waiting for database..."
  ATTEMPTS=0
  until node -e "const { Client } = require('pg'); (async () => { try { const c=new Client({ connectionString: process.env.DATABASE_URL }); await c.connect(); await c.end(); process.exit(0);} catch(e){ process.exit(1);} })()" >/dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS+1))
    if [[ $ATTEMPTS -gt 60 ]]; then
      echo "Database did not become ready in time" >&2
      exit 1
    fi
    sleep 1
  done
fi

# Run Prisma migrations (safe for prod) with retry
if [[ "${RUN_DB_MIGRATIONS:-1}" == "1" ]]; then
  echo "Running prisma migrate deploy..."
  ATTEMPTS=0
  until pnpm prisma migrate deploy; do
    ATTEMPTS=$((ATTEMPTS+1))
    if [[ $ATTEMPTS -gt 10 ]]; then
      echo "Prisma migrate failed after retries" >&2
      exit 1
    fi
    echo "Retrying migrations in 3s..."
    sleep 3
  done
fi

# Start the app (SvelteKit Node adapter)
exec node build/index.js



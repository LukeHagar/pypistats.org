### Running locally with Docker

Prerequisites: Docker and Docker Compose.

1. Build and start the full stack (Postgres, Redis, Web):

```
docker compose up --build
```

2. Configure BigQuery credentials via environment variables (e.g., export `GOOGLE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS_JSON`). For local compose, you can add them under the `web.environment` section in `docker-compose.yml`.

3. The app runs on `http://localhost:3000`.

Environment variables of interest:
- `DATABASE_URL`: Postgres connection string.
- `REDIS_URL`: Redis URL.
- `ENABLE_CRON`: Set to `true` to run the daily ETL.
- `CRON_SCHEDULE`: Cron string (default 2 AM UTC daily).
- `GOOGLE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` for BigQuery.

The container entrypoint waits for Postgres, applies Prisma migrations, then starts the app.



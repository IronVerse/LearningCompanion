# AI Tutor Database (Postgres + Flyway)

## Quickstart
1) Ensure Docker is installed and running.
2) In this folder, run:

   ```bash
   docker compose up -d postgres
   docker compose run --rm flyway info
   docker compose run --rm flyway migrate
   ```

To reset the database (dangerous; deletes data):

```bash
docker compose down -v
rm -rf pgdata
```

## Structure
- `docker-compose.yml` - launches Postgres and a Flyway client container
- `.env` - DB credentials (shared by Postgres and Flyway)
- `flyway/conf/flyway.conf` - Flyway connection/config
- `flyway/sql/` - versioned migrations
- `pgdata/` - local Postgres data directory (mounted volume)

## Useful Flyway commands
- `docker compose run --rm flyway info`     # show migration status
- `docker compose run --rm flyway migrate`  # apply pending migrations
- `docker compose run --rm flyway repair`   # fix checksums if you edited applied migrations (avoid in prod)

## Notes
- Migration filenames use the pattern `V<version>__<description>.sql` (double underscore).
- Edit `.env` to change DB name, user, or password.

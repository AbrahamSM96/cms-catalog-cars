# Runbook — applying a migration in production

Render's `free` plan runs no `preDeployCommand` and gives no Shell access, so
migrations are run by hand from your machine against each client's Neon
database. Each Blueprint instance has its own database, so steps 0–5 are
repeated per client; step 6 is done once.

`psql` does not need to be installed: the local Postgres container
(`cms-cars-db`, from `docker-compose.yml`) already ships the client, and
`docker exec` only borrows it — the connection goes wherever `$URI` points.
Start it with `bun run db:up`.

```bash
# 0 · the client's Neon connection string (with ?sslmode=require)
export URI='postgresql://user:password@host.neon.tech/db?sslmode=require'
```

```bash
# 1 · confirm you are pointing at production and not at the local database
docker exec cms-cars-db psql "$URI" -c "select count(*) as cars from cars;"
```

```bash
# 2 · city spellings: if the same city shows up twice, merge it in the admin BEFORE going on
docker exec cms-cars-db psql "$URI" -c \
  "select address_city, address_state, count(*) from dealerships group by 1,2 order by 1;"
```

```bash
# 3 · dealerships with no city: must come back empty
docker exec cms-cars-db psql "$URI" -c \
  "select id, name from dealerships where coalesce(btrim(address_city),'') = '';"
```

If step 3 returns rows, stop: the migration aborts on purpose. Fill those cities
in the admin and run it again.

```bash
# 4 · migrate
DATABASE_URI="$URI" PAYLOAD_SECRET='x' bun run migrate
```

It should not ask anything. If it asks *"It looks like you've run Payload in dev
mode…"*, cancel with Ctrl-C: that prompt only appears on databases created with
schema push, which means you are pointing at the local one.

The log prints the three summary lines: cities created, cars linked, and cars
left without a dealership.

```bash
# 5 · verify
docker exec cms-cars-db psql "$URI" -c "select id, name, slug, state from cities order by slug;"
docker exec cms-cars-db psql "$URI" -c "select count(*) from dealerships where address_city_id is null;"  -- 0
docker exec cms-cars-db psql "$URI" -c "select count(*) from cars where dealership_id is null;"
```

```bash
# 6 · deploy the code, with the database already migrated
git add -A && git commit -m "feat: landings de seminuevos por ciudad"
git push origin main
```

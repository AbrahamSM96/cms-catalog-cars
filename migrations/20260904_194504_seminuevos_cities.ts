import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * City becomes a document instead of free text.
 *
 * The schema half is generated; the data half is not, and the order matters:
 * the old `dealerships.address_city` text is the only place the city names
 * exist, so the `cities` rows have to be built from it before those columns are
 * dropped. `address_city_id` is therefore added nullable, backfilled, and only
 * then promoted to NOT NULL — adding it NOT NULL outright fails on the first
 * existing row.
 */

/**
 * SQL slugifier matching `lib/slugify.ts`, so a city inserted here lands on the
 * same URL the app would have generated for it. Spanish accents are folded with
 * `translate` rather than the `unaccent` extension, which is not installed.
 */
const slugOf = (column: string): ReturnType<typeof sql.raw> =>
  sql.raw(
    `regexp_replace(regexp_replace(lower(translate(btrim(${column}), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')), '[^a-z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g')`
  )

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Schema: the new collection, plus the relation column as NULLABLE.
  await db.execute(sql`
   CREATE TABLE "cities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"state" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"intro" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "dealerships" ADD COLUMN "address_city_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cities_id" integer;
  CREATE UNIQUE INDEX "cities_name_idx" ON "cities" USING btree ("name");
  CREATE UNIQUE INDEX "cities_slug_idx" ON "cities" USING btree ("slug");
  CREATE INDEX "cities_updated_at_idx" ON "cities" USING btree ("updated_at");
  CREATE INDEX "cities_created_at_idx" ON "cities" USING btree ("created_at");
  ALTER TABLE "dealerships" ADD CONSTRAINT "dealerships_address_city_id_cities_id_fk" FOREIGN KEY ("address_city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cities_fk" FOREIGN KEY ("cities_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "dealerships_address_address_city_idx" ON "dealerships" USING btree ("address_city_id");
  CREATE INDEX "payload_locked_documents_rels_cities_id_idx" ON "payload_locked_documents_rels" USING btree ("cities_id");`)

  // 2. One city per distinct slug. Grouping by the slug and not by the raw text
  //    is what merges "Pachuca", "pachuca" and "Pachuca " into a single row —
  //    two rows would split that city's inventory across two landing pages.
  //    Genuinely different spellings ("Pachuca de Soto") stay separate and have
  //    to be merged by hand in the admin; the log below is where you see them.
  await db.execute(sql`
    INSERT INTO "cities" ("name", "state", "slug")
    SELECT DISTINCT ON (slug) name, state, slug
    FROM (
      SELECT
        btrim("address_city") AS name,
        COALESCE(NULLIF(btrim("address_state"), ''), 'Sin estado') AS state,
        ${slugOf('"address_city"')} AS slug
      FROM "dealerships"
      WHERE COALESCE(btrim("address_city"), '') <> ''
    ) source
    WHERE slug <> ''
    ORDER BY slug, name`)

  await db.execute(sql`
    UPDATE "dealerships" d
    SET "address_city_id" = c."id"
    FROM "cities" c
    WHERE c."slug" = ${slugOf('d."address_city"')}`)

  // 3. A dealership with no city cannot be invented, and the column is about to
  //    become NOT NULL. Fail loudly with the names to fix rather than let the
  //    ALTER blow up with a constraint error nobody can act on.
  const orphanDealerships = await db.execute(sql`
    SELECT "id", "name" FROM "dealerships" WHERE "address_city_id" IS NULL`)

  if (orphanDealerships.rows.length > 0) {
    const names = orphanDealerships.rows
      .map((row) => `#${String(row.id)} ${String(row.name)}`)
      .join(', ')
    throw new Error(
      `Cannot make the dealership city required: ${orphanDealerships.rows.length} dealership(s) have no city. Fill "address_city" on ${names} and run the migration again.`
    )
  }

  // 4. Best-effort backfill of the car → dealership relation from the manual
  //    location about to be dropped. Only where the city has exactly one
  //    dealership: with two, the text says nothing about which lot holds the
  //    car, and guessing would put it on the wrong map.
  const assigned = await db.execute(sql`
    UPDATE "cars" ca
    SET "dealership_id" = single."dealership_id"
    FROM (
      SELECT
        d."address_city_id" AS city_id,
        min(d."id") AS dealership_id,
        count(*) AS lots
      FROM "dealerships" d
      GROUP BY d."address_city_id"
    ) single
    JOIN "cities" c ON c."id" = single."city_id"
    WHERE ca."dealership_id" IS NULL
      AND single.lots = 1
      AND ${slugOf('ca."location_city"')} = c."slug"`)

  // 5. Now the column can carry the constraint, and the old text can go.
  await db.execute(sql`
  ALTER TABLE "dealerships" ALTER COLUMN "address_city_id" SET NOT NULL;
  ALTER TABLE "cars" DROP COLUMN "location_dealership";
  ALTER TABLE "cars" DROP COLUMN "location_city";
  ALTER TABLE "cars" DROP COLUMN "location_state";
  ALTER TABLE "dealerships" DROP COLUMN "address_city";
  ALTER TABLE "dealerships" DROP COLUMN "address_state";`)

  // 6. Report. `cities` is what the client should review for near-duplicates,
  //    and the orphan count is the gate for making `cars.dealership` required.
  const cities = await db.execute(sql`
    SELECT "name", "state", "slug" FROM "cities" ORDER BY "slug"`)
  const orphanCars = await db.execute(sql`
    SELECT count(*)::int AS total FROM "cars" WHERE "dealership_id" IS NULL`)

  payload.logger.info(
    `cities created: ${cities.rows
      .map((row) => `${String(row.name)} (${String(row.slug)})`)
      .join(', ')}`
  )
  payload.logger.info(
    `cars assigned a dealership from their manual location: ${String(assigned.rowCount ?? 0)}`
  )
  payload.logger.info(
    `cars still without a dealership: ${String(orphanCars.rows[0]?.total ?? 0)} — must be 0 before making the field required`
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Restore the text columns first and copy the city back into them, so rolling
  // back keeps the data instead of only the shape.
  await db.execute(sql`
   ALTER TABLE "cars" ADD COLUMN "location_dealership" varchar;
  ALTER TABLE "cars" ADD COLUMN "location_city" varchar;
  ALTER TABLE "cars" ADD COLUMN "location_state" varchar;
  ALTER TABLE "dealerships" ADD COLUMN "address_city" varchar;
  ALTER TABLE "dealerships" ADD COLUMN "address_state" varchar;`)

  await db.execute(sql`
    UPDATE "dealerships" d
    SET "address_city" = c."name", "address_state" = c."state"
    FROM "cities" c
    WHERE c."id" = d."address_city_id"`)

  await db.execute(sql`
   ALTER TABLE "cities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "dealerships" DROP CONSTRAINT "dealerships_address_city_id_cities_id_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cities_fk";

  DROP INDEX "dealerships_address_address_city_idx";
  DROP INDEX "payload_locked_documents_rels_cities_id_idx";
  DROP TABLE "cities" CASCADE;
  ALTER TABLE "dealerships" DROP COLUMN "address_city_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cities_id";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "vin_decodes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"squish" varchar NOT NULL,
  	"sample_vin" varchar,
  	"fetched_at" timestamp(3) with time zone,
  	"decoded" jsonb,
  	"raw" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "cars" ADD COLUMN "vin" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vin_decodes_id" integer;
  CREATE UNIQUE INDEX "vin_decodes_squish_idx" ON "vin_decodes" USING btree ("squish");
  CREATE INDEX "vin_decodes_updated_at_idx" ON "vin_decodes" USING btree ("updated_at");
  CREATE INDEX "vin_decodes_created_at_idx" ON "vin_decodes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vin_decodes_fk" FOREIGN KEY ("vin_decodes_id") REFERENCES "public"."vin_decodes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_vin_decodes_id_idx" ON "payload_locked_documents_rels" USING btree ("vin_decodes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vin_decodes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "vin_decodes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vin_decodes_fk";
  
  DROP INDEX "payload_locked_documents_rels_vin_decodes_id_idx";
  ALTER TABLE "cars" DROP COLUMN "vin";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vin_decodes_id";`)
}

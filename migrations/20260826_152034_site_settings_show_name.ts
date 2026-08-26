import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "brand_show_name" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "media_logo_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_media_logo_id_media_id_fk" FOREIGN KEY ("media_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_media_media_logo_idx" ON "site_settings" USING btree ("media_logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_media_logo_id_media_id_fk";
  
  DROP INDEX "site_settings_media_media_logo_idx";
  ALTER TABLE "site_settings" DROP COLUMN "brand_show_name";
  ALTER TABLE "site_settings" DROP COLUMN "media_logo_id";`)
}

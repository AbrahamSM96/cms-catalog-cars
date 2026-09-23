import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cars" ADD COLUMN "show_reserve" boolean DEFAULT true;
  ALTER TABLE "cars" ADD COLUMN "reserve_amount" numeric;
  ALTER TABLE "cars" ADD COLUMN "reserve_title" varchar;
  ALTER TABLE "cars" ADD COLUMN "reserve_description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cars" DROP COLUMN "show_reserve";
  ALTER TABLE "cars" DROP COLUMN "reserve_amount";
  ALTER TABLE "cars" DROP COLUMN "reserve_title";
  ALTER TABLE "cars" DROP COLUMN "reserve_description";`)
}

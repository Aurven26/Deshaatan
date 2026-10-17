import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "private_files" ADD COLUMN "prefix" varchar DEFAULT 'private';
  ALTER TABLE "private_files" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "leads" ADD COLUMN "legacy_id" varchar;
  ALTER TABLE "applications" ADD COLUMN "legacy_id" varchar;
  ALTER TABLE "reviews" ADD COLUMN "legacy_id" varchar;
  CREATE UNIQUE INDEX "leads_legacy_id_idx" ON "leads" USING btree ("legacy_id");
  CREATE UNIQUE INDEX "applications_legacy_id_idx" ON "applications" USING btree ("legacy_id");
  CREATE UNIQUE INDEX "reviews_legacy_id_idx" ON "reviews" USING btree ("legacy_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "leads_legacy_id_idx";
  DROP INDEX "applications_legacy_id_idx";
  DROP INDEX "reviews_legacy_id_idx";
  ALTER TABLE "private_files" DROP COLUMN "prefix";
  ALTER TABLE "private_files" DROP COLUMN "_objectkey";
  ALTER TABLE "leads" DROP COLUMN "legacy_id";
  ALTER TABLE "applications" DROP COLUMN "legacy_id";
  ALTER TABLE "reviews" DROP COLUMN "legacy_id";`)
}

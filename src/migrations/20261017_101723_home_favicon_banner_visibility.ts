import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page_hero_banners" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "header_favicon_id" integer;
  ALTER TABLE "_home_page_v_version_hero_banners" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "_home_page_v" ADD COLUMN "version_header_favicon_id" integer;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_header_favicon_id_media_id_fk" FOREIGN KEY ("header_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_header_favicon_id_media_id_fk" FOREIGN KEY ("version_header_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_page_header_header_favicon_idx" ON "home_page" USING btree ("header_favicon_id");
  CREATE INDEX "_home_page_v_version_header_version_header_favicon_idx" ON "_home_page_v" USING btree ("version_header_favicon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page" DROP CONSTRAINT "home_page_header_favicon_id_media_id_fk";
  
  ALTER TABLE "_home_page_v" DROP CONSTRAINT "_home_page_v_version_header_favicon_id_media_id_fk";
  
  DROP INDEX "home_page_header_header_favicon_idx";
  DROP INDEX "_home_page_v_version_header_version_header_favicon_idx";
  ALTER TABLE "home_page_hero_banners" DROP COLUMN "visible";
  ALTER TABLE "home_page" DROP COLUMN "header_favicon_id";
  ALTER TABLE "_home_page_v_version_hero_banners" DROP COLUMN "visible";
  ALTER TABLE "_home_page_v" DROP COLUMN "version_header_favicon_id";`)
}

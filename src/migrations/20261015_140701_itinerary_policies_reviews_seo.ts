import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_itineraries_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'index-nofollow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__itineraries_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'index-nofollow', 'noindex-nofollow');
  CREATE TABLE "itineraries_policies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" varchar
  );
  
  CREATE TABLE "itineraries_seo_hreflang" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "_itineraries_v_version_policies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_itineraries_v_version_seo_hreflang" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "reviews" ALTER COLUMN "itinerary_id" DROP NOT NULL;
  ALTER TABLE "itineraries" ADD COLUMN "seo_keywords" varchar;
  ALTER TABLE "itineraries" ADD COLUMN "seo_robots" "enum_itineraries_seo_robots";
  ALTER TABLE "itineraries" ADD COLUMN "seo_canonical_u_r_l" varchar;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_seo_keywords" varchar;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_seo_robots" "enum__itineraries_v_version_seo_robots";
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_seo_canonical_u_r_l" varchar;
  ALTER TABLE "reviews" ADD COLUMN "shared" boolean DEFAULT false;
  ALTER TABLE "reviews" ADD COLUMN "display_date" varchar;
  ALTER TABLE "reviews" ADD COLUMN "display_order" numeric DEFAULT 100;
  ALTER TABLE "itineraries_policies" ADD CONSTRAINT "itineraries_policies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itineraries_seo_hreflang" ADD CONSTRAINT "itineraries_seo_hreflang_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_itineraries_v_version_policies" ADD CONSTRAINT "_itineraries_v_version_policies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_itineraries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_itineraries_v_version_seo_hreflang" ADD CONSTRAINT "_itineraries_v_version_seo_hreflang_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_itineraries_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "itineraries_policies_order_idx" ON "itineraries_policies" USING btree ("_order");
  CREATE INDEX "itineraries_policies_parent_id_idx" ON "itineraries_policies" USING btree ("_parent_id");
  CREATE INDEX "itineraries_seo_hreflang_order_idx" ON "itineraries_seo_hreflang" USING btree ("_order");
  CREATE INDEX "itineraries_seo_hreflang_parent_id_idx" ON "itineraries_seo_hreflang" USING btree ("_parent_id");
  CREATE INDEX "_itineraries_v_version_policies_order_idx" ON "_itineraries_v_version_policies" USING btree ("_order");
  CREATE INDEX "_itineraries_v_version_policies_parent_id_idx" ON "_itineraries_v_version_policies" USING btree ("_parent_id");
  CREATE INDEX "_itineraries_v_version_seo_hreflang_order_idx" ON "_itineraries_v_version_seo_hreflang" USING btree ("_order");
  CREATE INDEX "_itineraries_v_version_seo_hreflang_parent_id_idx" ON "_itineraries_v_version_seo_hreflang" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "itineraries_policies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "itineraries_seo_hreflang" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_itineraries_v_version_policies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_itineraries_v_version_seo_hreflang" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "itineraries_policies" CASCADE;
  DROP TABLE "itineraries_seo_hreflang" CASCADE;
  DROP TABLE "_itineraries_v_version_policies" CASCADE;
  DROP TABLE "_itineraries_v_version_seo_hreflang" CASCADE;
  ALTER TABLE "reviews" ALTER COLUMN "itinerary_id" SET NOT NULL;
  ALTER TABLE "itineraries" DROP COLUMN "seo_keywords";
  ALTER TABLE "itineraries" DROP COLUMN "seo_robots";
  ALTER TABLE "itineraries" DROP COLUMN "seo_canonical_u_r_l";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_seo_keywords";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_seo_robots";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_seo_canonical_u_r_l";
  ALTER TABLE "reviews" DROP COLUMN "shared";
  ALTER TABLE "reviews" DROP COLUMN "display_date";
  ALTER TABLE "reviews" DROP COLUMN "display_order";
  DROP TYPE "public"."enum_itineraries_seo_robots";
  DROP TYPE "public"."enum__itineraries_v_version_seo_robots";`)
}

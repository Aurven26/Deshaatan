import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "itineraries_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "itineraries_tour_f_a_qs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "itineraries_attractions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "itineraries_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "_itineraries_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_itineraries_v_version_tour_f_a_qs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_itineraries_v_version_attractions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_itineraries_v_version_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "itineraries" ADD COLUMN "start_city" varchar;
  ALTER TABLE "itineraries" ADD COLUMN "end_city" varchar;
  ALTER TABLE "itineraries" ADD COLUMN "attractions_title" varchar;
  ALTER TABLE "itineraries" ADD COLUMN "activities_title" varchar;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_start_city" varchar;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_end_city" varchar;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_attractions_title" varchar;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_activities_title" varchar;
  ALTER TABLE "itineraries_gallery" ADD CONSTRAINT "itineraries_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "itineraries_gallery" ADD CONSTRAINT "itineraries_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itineraries_tour_f_a_qs" ADD CONSTRAINT "itineraries_tour_f_a_qs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itineraries_attractions" ADD CONSTRAINT "itineraries_attractions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itineraries_activities" ADD CONSTRAINT "itineraries_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_itineraries_v_version_gallery" ADD CONSTRAINT "_itineraries_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_itineraries_v_version_gallery" ADD CONSTRAINT "_itineraries_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_itineraries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_itineraries_v_version_tour_f_a_qs" ADD CONSTRAINT "_itineraries_v_version_tour_f_a_qs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_itineraries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_itineraries_v_version_attractions" ADD CONSTRAINT "_itineraries_v_version_attractions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_itineraries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_itineraries_v_version_activities" ADD CONSTRAINT "_itineraries_v_version_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_itineraries_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "itineraries_gallery_order_idx" ON "itineraries_gallery" USING btree ("_order");
  CREATE INDEX "itineraries_gallery_parent_id_idx" ON "itineraries_gallery" USING btree ("_parent_id");
  CREATE INDEX "itineraries_gallery_image_idx" ON "itineraries_gallery" USING btree ("image_id");
  CREATE INDEX "itineraries_tour_f_a_qs_order_idx" ON "itineraries_tour_f_a_qs" USING btree ("_order");
  CREATE INDEX "itineraries_tour_f_a_qs_parent_id_idx" ON "itineraries_tour_f_a_qs" USING btree ("_parent_id");
  CREATE INDEX "itineraries_attractions_order_idx" ON "itineraries_attractions" USING btree ("_order");
  CREATE INDEX "itineraries_attractions_parent_id_idx" ON "itineraries_attractions" USING btree ("_parent_id");
  CREATE INDEX "itineraries_activities_order_idx" ON "itineraries_activities" USING btree ("_order");
  CREATE INDEX "itineraries_activities_parent_id_idx" ON "itineraries_activities" USING btree ("_parent_id");
  CREATE INDEX "_itineraries_v_version_gallery_order_idx" ON "_itineraries_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_itineraries_v_version_gallery_parent_id_idx" ON "_itineraries_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_itineraries_v_version_gallery_image_idx" ON "_itineraries_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_itineraries_v_version_tour_f_a_qs_order_idx" ON "_itineraries_v_version_tour_f_a_qs" USING btree ("_order");
  CREATE INDEX "_itineraries_v_version_tour_f_a_qs_parent_id_idx" ON "_itineraries_v_version_tour_f_a_qs" USING btree ("_parent_id");
  CREATE INDEX "_itineraries_v_version_attractions_order_idx" ON "_itineraries_v_version_attractions" USING btree ("_order");
  CREATE INDEX "_itineraries_v_version_attractions_parent_id_idx" ON "_itineraries_v_version_attractions" USING btree ("_parent_id");
  CREATE INDEX "_itineraries_v_version_activities_order_idx" ON "_itineraries_v_version_activities" USING btree ("_order");
  CREATE INDEX "_itineraries_v_version_activities_parent_id_idx" ON "_itineraries_v_version_activities" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "itineraries_gallery" CASCADE;
  DROP TABLE "itineraries_tour_f_a_qs" CASCADE;
  DROP TABLE "itineraries_attractions" CASCADE;
  DROP TABLE "itineraries_activities" CASCADE;
  DROP TABLE "_itineraries_v_version_gallery" CASCADE;
  DROP TABLE "_itineraries_v_version_tour_f_a_qs" CASCADE;
  DROP TABLE "_itineraries_v_version_attractions" CASCADE;
  DROP TABLE "_itineraries_v_version_activities" CASCADE;
  ALTER TABLE "itineraries" DROP COLUMN "start_city";
  ALTER TABLE "itineraries" DROP COLUMN "end_city";
  ALTER TABLE "itineraries" DROP COLUMN "attractions_title";
  ALTER TABLE "itineraries" DROP COLUMN "activities_title";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_start_city";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_end_city";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_attractions_title";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_activities_title";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import {importHomepage} from '../cms/import-homepage';
import {backfillPageSections} from '../cms/page-content';
import {backfillThumbnails} from '../cms/backfill-thumbnails';
import {seedSharedReviews} from '../cms/seed-shared-reviews';
import {backfillPolicies} from '../cms/backfill-policies';
import {backfillItineraryFields} from '../cms/backfill-itinerary';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "section_visibility" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"shared_header" boolean DEFAULT true,
  	"shared_footer" boolean DEFAULT true,
  	"itinerary_introduction" boolean DEFAULT true,
  	"itinerary_gallery" boolean DEFAULT true,
  	"itinerary_enquiry" boolean DEFAULT true,
  	"itinerary_navigation" boolean DEFAULT true,
  	"itinerary_overview" boolean DEFAULT true,
  	"itinerary_highlights" boolean DEFAULT true,
  	"itinerary_itinerary" boolean DEFAULT true,
  	"itinerary_inclusions" boolean DEFAULT true,
  	"itinerary_exclusions" boolean DEFAULT true,
  	"itinerary_faqs" boolean DEFAULT true,
  	"itinerary_reviews" boolean DEFAULT true,
  	"itinerary_featured_review" boolean DEFAULT true,
  	"itinerary_signup" boolean DEFAULT true,
  	"itinerary_policies" boolean DEFAULT true,
  	"itinerary_related" boolean DEFAULT true,
  	"itinerary_attractions" boolean DEFAULT true,
  	"itinerary_activities" boolean DEFAULT true,
  	"itinerary_floating_enquiry" boolean DEFAULT true,
  	"packages_introduction" boolean DEFAULT true,
  	"packages_search" boolean DEFAULT true,
  	"packages_types" boolean DEFAULT true,
  	"packages_filters" boolean DEFAULT true,
  	"packages_help" boolean DEFAULT true,
  	"packages_results" boolean DEFAULT true,
  	"packages_custom_trip" boolean DEFAULT true,
  	"packages_why" boolean DEFAULT true,
  	"packages_faqs" boolean DEFAULT true,
  	"faq_introduction" boolean DEFAULT true,
  	"faq_categories" boolean DEFAULT true,
  	"faq_questions" boolean DEFAULT true,
  	"faq_help" boolean DEFAULT true,
  	"contact_introduction" boolean DEFAULT true,
  	"contact_email" boolean DEFAULT true,
  	"contact_social" boolean DEFAULT true,
  	"contact_location" boolean DEFAULT true,
  	"contact_phone" boolean DEFAULT true,
  	"contact_map" boolean DEFAULT true,
  	"pages_navigation" boolean DEFAULT true,
  	"pages_introduction" boolean DEFAULT true,
  	"pages_sections" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "itineraries" ADD COLUMN "thumbnail_id" integer;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_introduction" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_gallery" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_enquiry" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_navigation" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_overview" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_highlights" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_itinerary" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_inclusions" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_exclusions" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_faqs" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_reviews" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_featured_review" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_signup" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_policies" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_related" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_attractions" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_activities" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD COLUMN "section_visibility_floating_enquiry" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_thumbnail_id" integer;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_introduction" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_gallery" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_enquiry" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_navigation" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_overview" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_highlights" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_itinerary" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_inclusions" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_exclusions" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_faqs" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_reviews" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_featured_review" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_signup" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_policies" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_related" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_attractions" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_activities" boolean DEFAULT true;
  ALTER TABLE "_itineraries_v" ADD COLUMN "version_section_visibility_floating_enquiry" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_heading" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_text" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_list" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_table" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_divider" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_image" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "visibility_navigation" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "visibility_introduction" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "visibility_sections" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_heading" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_text" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_list" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_table" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_divider" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_image" ADD COLUMN "visible" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_visibility_navigation" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_visibility_introduction" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_visibility_sections" boolean DEFAULT true;
  ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_itineraries_v" ADD CONSTRAINT "_itineraries_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "itineraries_thumbnail_idx" ON "itineraries" USING btree ("thumbnail_id");
  CREATE INDEX "_itineraries_v_version_version_thumbnail_idx" ON "_itineraries_v" USING btree ("version_thumbnail_id");`)
  await seedSharedReviews(payload,req);
  await backfillPolicies(payload,req);
  await backfillItineraryFields(payload,req);
  await importHomepage(payload,req);
  await backfillPageSections(payload,req);
  await backfillThumbnails(payload,req);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "section_visibility" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "section_visibility" CASCADE;
  ALTER TABLE "itineraries" DROP CONSTRAINT "itineraries_thumbnail_id_media_id_fk";
  
  ALTER TABLE "_itineraries_v" DROP CONSTRAINT "_itineraries_v_version_thumbnail_id_media_id_fk";
  
  DROP INDEX "itineraries_thumbnail_idx";
  DROP INDEX "_itineraries_v_version_version_thumbnail_idx";
  ALTER TABLE "itineraries" DROP COLUMN "thumbnail_id";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_introduction";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_gallery";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_enquiry";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_navigation";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_overview";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_highlights";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_itinerary";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_inclusions";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_exclusions";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_faqs";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_reviews";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_featured_review";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_signup";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_policies";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_related";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_attractions";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_activities";
  ALTER TABLE "itineraries" DROP COLUMN "section_visibility_floating_enquiry";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_thumbnail_id";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_introduction";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_gallery";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_enquiry";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_navigation";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_overview";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_highlights";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_itinerary";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_inclusions";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_exclusions";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_faqs";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_reviews";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_featured_review";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_signup";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_policies";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_related";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_attractions";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_activities";
  ALTER TABLE "_itineraries_v" DROP COLUMN "version_section_visibility_floating_enquiry";
  ALTER TABLE "pages_blocks_heading" DROP COLUMN "visible";
  ALTER TABLE "pages_blocks_text" DROP COLUMN "visible";
  ALTER TABLE "pages_blocks_list" DROP COLUMN "visible";
  ALTER TABLE "pages_blocks_table" DROP COLUMN "visible";
  ALTER TABLE "pages_blocks_divider" DROP COLUMN "visible";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "visible";
  ALTER TABLE "pages_blocks_image" DROP COLUMN "visible";
  ALTER TABLE "pages" DROP COLUMN "visibility_navigation";
  ALTER TABLE "pages" DROP COLUMN "visibility_introduction";
  ALTER TABLE "pages" DROP COLUMN "visibility_sections";
  ALTER TABLE "_pages_v_blocks_heading" DROP COLUMN "visible";
  ALTER TABLE "_pages_v_blocks_text" DROP COLUMN "visible";
  ALTER TABLE "_pages_v_blocks_list" DROP COLUMN "visible";
  ALTER TABLE "_pages_v_blocks_table" DROP COLUMN "visible";
  ALTER TABLE "_pages_v_blocks_divider" DROP COLUMN "visible";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "visible";
  ALTER TABLE "_pages_v_blocks_image" DROP COLUMN "visible";
  ALTER TABLE "_pages_v" DROP COLUMN "version_visibility_navigation";
  ALTER TABLE "_pages_v" DROP COLUMN "version_visibility_introduction";
  ALTER TABLE "_pages_v" DROP COLUMN "version_visibility_sections";`)
}

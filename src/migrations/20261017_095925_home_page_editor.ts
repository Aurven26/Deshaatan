import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_page_footer_main_links_action" AS ENUM('link', 'corporate', 'car-rental', 'hiring', 'partner', 'info');
  CREATE TYPE "public"."enum_home_page_footer_quick_links_action" AS ENUM('link', 'corporate', 'car-rental', 'hiring', 'partner', 'info');
  CREATE TYPE "public"."enum_home_page_footer_legal_links_action" AS ENUM('link', 'corporate', 'car-rental', 'hiring', 'partner', 'info');
  CREATE TYPE "public"."enum_home_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'index-nofollow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__home_page_v_version_footer_main_links_action" AS ENUM('link', 'corporate', 'car-rental', 'hiring', 'partner', 'info');
  CREATE TYPE "public"."enum__home_page_v_version_footer_quick_links_action" AS ENUM('link', 'corporate', 'car-rental', 'hiring', 'partner', 'info');
  CREATE TYPE "public"."enum__home_page_v_version_footer_legal_links_action" AS ENUM('link', 'corporate', 'car-rental', 'hiring', 'partner', 'info');
  CREATE TYPE "public"."enum__home_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'index-nofollow', 'noindex-nofollow');
  CREATE TABLE "home_page_hero_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar DEFAULT '',
  	"title" varchar DEFAULT '',
  	"image_id" integer,
  	"alt" varchar DEFAULT '',
  	"badge" varchar DEFAULT '',
  	"tagline" varchar DEFAULT '',
  	"action" varchar DEFAULT '',
  	"destination" varchar DEFAULT '',
  	"href" varchar DEFAULT '',
  	"artwork_only" boolean DEFAULT false,
  	"width" numeric DEFAULT 100,
  	"height" numeric DEFAULT 100,
  	"left" numeric DEFAULT 0,
  	"top" numeric DEFAULT 0
  );
  
  CREATE TABLE "home_page_categories_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT '',
  	"image_id" integer,
  	"enquiry_title" varchar DEFAULT ''
  );
  
  CREATE TABLE "home_page_popular_duration_labels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_religious_duration_labels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_enquiry_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_enquiry_durations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_enquiry_styles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_about_link_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT '',
  	"href" varchar DEFAULT ''
  );
  
  CREATE TABLE "home_page_about_link_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT ''
  );
  
  CREATE TABLE "home_page_footer_main_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar,
  	"action" "enum_home_page_footer_main_links_action" DEFAULT 'link'
  );
  
  CREATE TABLE "home_page_footer_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar,
  	"action" "enum_home_page_footer_quick_links_action" DEFAULT 'link'
  );
  
  CREATE TABLE "home_page_footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar,
  	"action" "enum_home_page_footer_legal_links_action" DEFAULT 'link'
  );
  
  CREATE TABLE "home_page_seo_hreflang" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_promotion_visible" boolean DEFAULT true,
  	"header_promotion_title" varchar DEFAULT 'Explore India',
  	"header_promotion_text" varchar DEFAULT 'Handpicked tour packages',
  	"header_promotion_button" varchar DEFAULT 'Plan your trip',
  	"header_promotion_u_r_l" varchar DEFAULT '/tour-packages',
  	"header_logo_alt" varchar DEFAULT 'Deshaatan home',
  	"header_currency" varchar DEFAULT 'INR ₹',
  	"header_contact_label" varchar DEFAULT 'Contact Us',
  	"header_contact_u_r_l" varchar DEFAULT '/contact-us',
  	"header_desktop_logo_id" integer,
  	"header_mobile_logo_id" integer,
  	"header_show_guides" boolean DEFAULT false,
  	"header_show_login" boolean DEFAULT false,
  	"header_show_search" boolean DEFAULT true,
  	"header_show_currency" boolean DEFAULT true,
  	"hero_enabled" boolean DEFAULT true,
  	"hero_autoplay" boolean DEFAULT false,
  	"hero_interval" numeric DEFAULT 6,
  	"categories_enabled" boolean DEFAULT false,
  	"popular_enabled" boolean DEFAULT true,
  	"popular_title" varchar DEFAULT 'Popular Destinations in India',
  	"popular_callback_label" varchar DEFAULT 'Request Callback',
  	"popular_per_person" varchar DEFAULT 'per person',
  	"popular_rating_scale" varchar DEFAULT '/5',
  	"popular_empty_text" varchar DEFAULT 'No trips match this duration and category.',
  	"popular_clear_label" varchar DEFAULT 'Clear category filter',
  	"popular_use_all" boolean DEFAULT true,
  	"popular_rating" numeric DEFAULT 4.5,
  	"guides_enabled" boolean DEFAULT true,
  	"guides_title" varchar DEFAULT 'The Ultimate India Travel Guide',
  	"guides_explore_label" varchar DEFAULT 'Explore',
  	"guides_use_all" boolean DEFAULT true,
  	"religious_enabled" boolean DEFAULT true,
  	"religious_title" varchar DEFAULT 'Explore Religious packages',
  	"religious_featured_title" varchar DEFAULT 'Char Dham Yatra',
  	"religious_featured_subtitle" varchar DEFAULT 'Package 2024',
  	"religious_featured_enquiry" varchar DEFAULT 'Char Dham Yatra Package 2024',
  	"religious_featured_slug" varchar DEFAULT 'char-dham',
  	"religious_featured_button" varchar DEFAULT 'Request Callback',
  	"religious_empty_text" varchar DEFAULT 'No religious packages match this duration.',
  	"religious_clear_label" varchar DEFAULT 'Clear duration filter',
  	"religious_use_all" boolean DEFAULT true,
  	"religious_background_image_id" integer,
  	"religious_featured_image_id" integer,
  	"testimonials_enabled" boolean DEFAULT true,
  	"testimonials_eyebrow" varchar DEFAULT 'TESTIMONIALS',
  	"testimonials_mobile_title" varchar DEFAULT 'What people say about us.',
  	"testimonials_title" varchar DEFAULT 'What People Say
  About Us.',
  	"testimonials_use_all" boolean DEFAULT true,
  	"testimonials_interval" numeric DEFAULT 7,
  	"testimonials_default_avatar_id" integer,
  	"enquiry_enabled" boolean DEFAULT true,
  	"enquiry_title_before" varchar DEFAULT 'Get a Custom',
  	"enquiry_title_highlight" varchar DEFAULT 'Deshaatan',
  	"enquiry_title_after" varchar DEFAULT 'Itinerary',
  	"enquiry_description" varchar DEFAULT 'Tell us the basics and our team can take it from there.',
  	"enquiry_button" varchar DEFAULT 'Request My Itinerary',
  	"enquiry_pending_label" varchar DEFAULT 'Submitting…',
  	"enquiry_success_message" varchar DEFAULT 'Your itinerary request has been submitted successfully.',
  	"enquiry_whatsapp_label" varchar DEFAULT 'Chat on WhatsApp',
  	"enquiry_whatsapp_u_r_l" varchar DEFAULT 'https://wa.me/?text=Hello%20Deshaatan%2C%20I%20would%20like%20to%20plan%20a%20trip.',
  	"enquiry_name_label" varchar DEFAULT 'PASSENGER NAME',
  	"enquiry_name_placeholder" varchar DEFAULT 'Passenger name',
  	"enquiry_phone_label" varchar DEFAULT 'PHONE NUMBER',
  	"enquiry_phone_placeholder" varchar DEFAULT 'Phone number',
  	"enquiry_origin_label" varchar DEFAULT 'ORIGIN CITY',
  	"enquiry_origin_placeholder" varchar DEFAULT 'Starting city',
  	"enquiry_destination_label" varchar DEFAULT 'DESTINATION',
  	"enquiry_destination_placeholder" varchar DEFAULT 'Where would you like to go?',
  	"enquiry_duration_label" varchar DEFAULT 'TRIP DURATION',
  	"enquiry_duration_placeholder" varchar DEFAULT 'Trip duration',
  	"enquiry_style_label" varchar DEFAULT 'TRAVEL STYLE',
  	"enquiry_style_placeholder" varchar DEFAULT 'Travel style',
  	"enquiry_travellers_label" varchar DEFAULT 'NUMBER OF TRAVELLERS',
  	"enquiry_travellers_placeholder" varchar DEFAULT 'Traveller count',
  	"about_enabled" boolean DEFAULT true,
  	"about_title" varchar DEFAULT 'Who We Are?',
  	"about_read_more" varchar DEFAULT 'Read more',
  	"about_read_less" varchar DEFAULT 'Read less',
  	"about_preview" varchar DEFAULT 'Obsessed with empowering travellers with better vacation deals, Deshaatan connects people with trusted local travel experts. With 650+ specialists, we have helped more than 10 Lac travellers plan international holidays and memorable journeys across India.',
  	"about_full" varchar DEFAULT 'Obsessed with the idea of empowering travellers with the best vacation deals, Deshaatan is a product of Holiday Triangle Travel Pvt. Ltd. We are an online marketplace that connects travellers with multiple local travel agents. With the help of 650+ local travel experts, Deshaatan has catered to more than 10 Lac travellers across international holidays and domestic tours in India.',
  	"airport_enabled" boolean DEFAULT true,
  	"airport_title" varchar DEFAULT 'Book airport transfers. Across India.',
  	"airport_description" varchar DEFAULT 'Relax with easy pick-up and drop-off at the airport or your hotel.',
  	"airport_button" varchar DEFAULT 'Book Now',
  	"airport_enquiry_title" varchar DEFAULT 'Airport transfer',
  	"airport_car_alt" varchar DEFAULT 'Airport transfer car',
  	"airport_decoration_image_id" integer,
  	"airport_car_image_id" integer,
  	"footer_enabled" boolean DEFAULT true,
  	"footer_description" varchar DEFAULT 'Deshaatan helps travellers discover India through thoughtful itineraries, trusted local expertise, memorable stays, iconic landmarks, and authentic hidden gems.',
  	"footer_read_more" varchar DEFAULT 'Read more',
  	"footer_about_u_r_l" varchar DEFAULT '/about-us',
  	"footer_main_title" varchar DEFAULT 'IN THE MAIN SECTION',
  	"footer_quick_title" varchar DEFAULT 'QUICK LINKS',
  	"footer_social_title" varchar DEFAULT 'FOLLOW US',
  	"footer_copyright" varchar DEFAULT '© 2026 Deshaatan.com All rights reserved.',
  	"footer_mobile_copyright" varchar DEFAULT 'Copyright © Deshaatan. All Rights Reserved.',
  	"footer_logo_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"seo_robots" "enum_home_page_seo_robots",
  	"seo_canonical_u_r_l" varchar,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"itineraries_id" integer,
  	"guides_id" integer,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "_home_page_v_version_hero_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar DEFAULT '',
  	"title" varchar DEFAULT '',
  	"image_id" integer,
  	"alt" varchar DEFAULT '',
  	"badge" varchar DEFAULT '',
  	"tagline" varchar DEFAULT '',
  	"action" varchar DEFAULT '',
  	"destination" varchar DEFAULT '',
  	"href" varchar DEFAULT '',
  	"artwork_only" boolean DEFAULT false,
  	"width" numeric DEFAULT 100,
  	"height" numeric DEFAULT 100,
  	"left" numeric DEFAULT 0,
  	"top" numeric DEFAULT 0,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_categories_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT '',
  	"image_id" integer,
  	"enquiry_title" varchar DEFAULT '',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_popular_duration_labels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_religious_duration_labels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_enquiry_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_enquiry_durations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_enquiry_styles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_about_link_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT '',
  	"href" varchar DEFAULT '',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_about_link_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT '',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_footer_main_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar,
  	"action" "enum__home_page_v_version_footer_main_links_action" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_footer_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar,
  	"action" "enum__home_page_v_version_footer_quick_links_action" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar,
  	"action" "enum__home_page_v_version_footer_legal_links_action" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_seo_hreflang" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_header_promotion_visible" boolean DEFAULT true,
  	"version_header_promotion_title" varchar DEFAULT 'Explore India',
  	"version_header_promotion_text" varchar DEFAULT 'Handpicked tour packages',
  	"version_header_promotion_button" varchar DEFAULT 'Plan your trip',
  	"version_header_promotion_u_r_l" varchar DEFAULT '/tour-packages',
  	"version_header_logo_alt" varchar DEFAULT 'Deshaatan home',
  	"version_header_currency" varchar DEFAULT 'INR ₹',
  	"version_header_contact_label" varchar DEFAULT 'Contact Us',
  	"version_header_contact_u_r_l" varchar DEFAULT '/contact-us',
  	"version_header_desktop_logo_id" integer,
  	"version_header_mobile_logo_id" integer,
  	"version_header_show_guides" boolean DEFAULT false,
  	"version_header_show_login" boolean DEFAULT false,
  	"version_header_show_search" boolean DEFAULT true,
  	"version_header_show_currency" boolean DEFAULT true,
  	"version_hero_enabled" boolean DEFAULT true,
  	"version_hero_autoplay" boolean DEFAULT false,
  	"version_hero_interval" numeric DEFAULT 6,
  	"version_categories_enabled" boolean DEFAULT false,
  	"version_popular_enabled" boolean DEFAULT true,
  	"version_popular_title" varchar DEFAULT 'Popular Destinations in India',
  	"version_popular_callback_label" varchar DEFAULT 'Request Callback',
  	"version_popular_per_person" varchar DEFAULT 'per person',
  	"version_popular_rating_scale" varchar DEFAULT '/5',
  	"version_popular_empty_text" varchar DEFAULT 'No trips match this duration and category.',
  	"version_popular_clear_label" varchar DEFAULT 'Clear category filter',
  	"version_popular_use_all" boolean DEFAULT true,
  	"version_popular_rating" numeric DEFAULT 4.5,
  	"version_guides_enabled" boolean DEFAULT true,
  	"version_guides_title" varchar DEFAULT 'The Ultimate India Travel Guide',
  	"version_guides_explore_label" varchar DEFAULT 'Explore',
  	"version_guides_use_all" boolean DEFAULT true,
  	"version_religious_enabled" boolean DEFAULT true,
  	"version_religious_title" varchar DEFAULT 'Explore Religious packages',
  	"version_religious_featured_title" varchar DEFAULT 'Char Dham Yatra',
  	"version_religious_featured_subtitle" varchar DEFAULT 'Package 2024',
  	"version_religious_featured_enquiry" varchar DEFAULT 'Char Dham Yatra Package 2024',
  	"version_religious_featured_slug" varchar DEFAULT 'char-dham',
  	"version_religious_featured_button" varchar DEFAULT 'Request Callback',
  	"version_religious_empty_text" varchar DEFAULT 'No religious packages match this duration.',
  	"version_religious_clear_label" varchar DEFAULT 'Clear duration filter',
  	"version_religious_use_all" boolean DEFAULT true,
  	"version_religious_background_image_id" integer,
  	"version_religious_featured_image_id" integer,
  	"version_testimonials_enabled" boolean DEFAULT true,
  	"version_testimonials_eyebrow" varchar DEFAULT 'TESTIMONIALS',
  	"version_testimonials_mobile_title" varchar DEFAULT 'What people say about us.',
  	"version_testimonials_title" varchar DEFAULT 'What People Say
  About Us.',
  	"version_testimonials_use_all" boolean DEFAULT true,
  	"version_testimonials_interval" numeric DEFAULT 7,
  	"version_testimonials_default_avatar_id" integer,
  	"version_enquiry_enabled" boolean DEFAULT true,
  	"version_enquiry_title_before" varchar DEFAULT 'Get a Custom',
  	"version_enquiry_title_highlight" varchar DEFAULT 'Deshaatan',
  	"version_enquiry_title_after" varchar DEFAULT 'Itinerary',
  	"version_enquiry_description" varchar DEFAULT 'Tell us the basics and our team can take it from there.',
  	"version_enquiry_button" varchar DEFAULT 'Request My Itinerary',
  	"version_enquiry_pending_label" varchar DEFAULT 'Submitting…',
  	"version_enquiry_success_message" varchar DEFAULT 'Your itinerary request has been submitted successfully.',
  	"version_enquiry_whatsapp_label" varchar DEFAULT 'Chat on WhatsApp',
  	"version_enquiry_whatsapp_u_r_l" varchar DEFAULT 'https://wa.me/?text=Hello%20Deshaatan%2C%20I%20would%20like%20to%20plan%20a%20trip.',
  	"version_enquiry_name_label" varchar DEFAULT 'PASSENGER NAME',
  	"version_enquiry_name_placeholder" varchar DEFAULT 'Passenger name',
  	"version_enquiry_phone_label" varchar DEFAULT 'PHONE NUMBER',
  	"version_enquiry_phone_placeholder" varchar DEFAULT 'Phone number',
  	"version_enquiry_origin_label" varchar DEFAULT 'ORIGIN CITY',
  	"version_enquiry_origin_placeholder" varchar DEFAULT 'Starting city',
  	"version_enquiry_destination_label" varchar DEFAULT 'DESTINATION',
  	"version_enquiry_destination_placeholder" varchar DEFAULT 'Where would you like to go?',
  	"version_enquiry_duration_label" varchar DEFAULT 'TRIP DURATION',
  	"version_enquiry_duration_placeholder" varchar DEFAULT 'Trip duration',
  	"version_enquiry_style_label" varchar DEFAULT 'TRAVEL STYLE',
  	"version_enquiry_style_placeholder" varchar DEFAULT 'Travel style',
  	"version_enquiry_travellers_label" varchar DEFAULT 'NUMBER OF TRAVELLERS',
  	"version_enquiry_travellers_placeholder" varchar DEFAULT 'Traveller count',
  	"version_about_enabled" boolean DEFAULT true,
  	"version_about_title" varchar DEFAULT 'Who We Are?',
  	"version_about_read_more" varchar DEFAULT 'Read more',
  	"version_about_read_less" varchar DEFAULT 'Read less',
  	"version_about_preview" varchar DEFAULT 'Obsessed with empowering travellers with better vacation deals, Deshaatan connects people with trusted local travel experts. With 650+ specialists, we have helped more than 10 Lac travellers plan international holidays and memorable journeys across India.',
  	"version_about_full" varchar DEFAULT 'Obsessed with the idea of empowering travellers with the best vacation deals, Deshaatan is a product of Holiday Triangle Travel Pvt. Ltd. We are an online marketplace that connects travellers with multiple local travel agents. With the help of 650+ local travel experts, Deshaatan has catered to more than 10 Lac travellers across international holidays and domestic tours in India.',
  	"version_airport_enabled" boolean DEFAULT true,
  	"version_airport_title" varchar DEFAULT 'Book airport transfers. Across India.',
  	"version_airport_description" varchar DEFAULT 'Relax with easy pick-up and drop-off at the airport or your hotel.',
  	"version_airport_button" varchar DEFAULT 'Book Now',
  	"version_airport_enquiry_title" varchar DEFAULT 'Airport transfer',
  	"version_airport_car_alt" varchar DEFAULT 'Airport transfer car',
  	"version_airport_decoration_image_id" integer,
  	"version_airport_car_image_id" integer,
  	"version_footer_enabled" boolean DEFAULT true,
  	"version_footer_description" varchar DEFAULT 'Deshaatan helps travellers discover India through thoughtful itineraries, trusted local expertise, memorable stays, iconic landmarks, and authentic hidden gems.',
  	"version_footer_read_more" varchar DEFAULT 'Read more',
  	"version_footer_about_u_r_l" varchar DEFAULT '/about-us',
  	"version_footer_main_title" varchar DEFAULT 'IN THE MAIN SECTION',
  	"version_footer_quick_title" varchar DEFAULT 'QUICK LINKS',
  	"version_footer_social_title" varchar DEFAULT 'FOLLOW US',
  	"version_footer_copyright" varchar DEFAULT '© 2026 Deshaatan.com All rights reserved.',
  	"version_footer_mobile_copyright" varchar DEFAULT 'Copyright © Deshaatan. All Rights Reserved.',
  	"version_footer_logo_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"version_seo_robots" "enum__home_page_v_version_seo_robots",
  	"version_seo_canonical_u_r_l" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_home_page_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"itineraries_id" integer,
  	"guides_id" integer,
  	"testimonials_id" integer
  );
  
  ALTER TABLE "home_page_hero_banners" ADD CONSTRAINT "home_page_hero_banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_hero_banners" ADD CONSTRAINT "home_page_hero_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_categories_items" ADD CONSTRAINT "home_page_categories_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_categories_items" ADD CONSTRAINT "home_page_categories_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_popular_duration_labels" ADD CONSTRAINT "home_page_popular_duration_labels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_religious_duration_labels" ADD CONSTRAINT "home_page_religious_duration_labels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_enquiry_promises" ADD CONSTRAINT "home_page_enquiry_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_enquiry_durations" ADD CONSTRAINT "home_page_enquiry_durations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_enquiry_styles" ADD CONSTRAINT "home_page_enquiry_styles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_about_link_groups_links" ADD CONSTRAINT "home_page_about_link_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_about_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_about_link_groups" ADD CONSTRAINT "home_page_about_link_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_footer_main_links" ADD CONSTRAINT "home_page_footer_main_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_footer_quick_links" ADD CONSTRAINT "home_page_footer_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_footer_legal_links" ADD CONSTRAINT "home_page_footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_seo_hreflang" ADD CONSTRAINT "home_page_seo_hreflang_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_header_desktop_logo_id_media_id_fk" FOREIGN KEY ("header_desktop_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_header_mobile_logo_id_media_id_fk" FOREIGN KEY ("header_mobile_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_religious_background_image_id_media_id_fk" FOREIGN KEY ("religious_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_religious_featured_image_id_media_id_fk" FOREIGN KEY ("religious_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_testimonials_default_avatar_id_media_id_fk" FOREIGN KEY ("testimonials_default_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_airport_decoration_image_id_media_id_fk" FOREIGN KEY ("airport_decoration_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_airport_car_image_id_media_id_fk" FOREIGN KEY ("airport_car_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_footer_logo_id_media_id_fk" FOREIGN KEY ("footer_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_itineraries_fk" FOREIGN KEY ("itineraries_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_hero_banners" ADD CONSTRAINT "_home_page_v_version_hero_banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_hero_banners" ADD CONSTRAINT "_home_page_v_version_hero_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_categories_items" ADD CONSTRAINT "_home_page_v_version_categories_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_categories_items" ADD CONSTRAINT "_home_page_v_version_categories_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_popular_duration_labels" ADD CONSTRAINT "_home_page_v_version_popular_duration_labels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_religious_duration_labels" ADD CONSTRAINT "_home_page_v_version_religious_duration_labels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_enquiry_promises" ADD CONSTRAINT "_home_page_v_version_enquiry_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_enquiry_durations" ADD CONSTRAINT "_home_page_v_version_enquiry_durations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_enquiry_styles" ADD CONSTRAINT "_home_page_v_version_enquiry_styles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_about_link_groups_links" ADD CONSTRAINT "_home_page_v_version_about_link_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_version_about_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_about_link_groups" ADD CONSTRAINT "_home_page_v_version_about_link_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_footer_main_links" ADD CONSTRAINT "_home_page_v_version_footer_main_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_footer_quick_links" ADD CONSTRAINT "_home_page_v_version_footer_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_footer_legal_links" ADD CONSTRAINT "_home_page_v_version_footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_seo_hreflang" ADD CONSTRAINT "_home_page_v_version_seo_hreflang_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_header_desktop_logo_id_media_id_fk" FOREIGN KEY ("version_header_desktop_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_header_mobile_logo_id_media_id_fk" FOREIGN KEY ("version_header_mobile_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_religious_background_image_id_media_id_fk" FOREIGN KEY ("version_religious_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_religious_featured_image_id_media_id_fk" FOREIGN KEY ("version_religious_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_testimonials_default_avatar_id_media_id_fk" FOREIGN KEY ("version_testimonials_default_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_airport_decoration_image_id_media_id_fk" FOREIGN KEY ("version_airport_decoration_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_airport_car_image_id_media_id_fk" FOREIGN KEY ("version_airport_car_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_footer_logo_id_media_id_fk" FOREIGN KEY ("version_footer_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_rels" ADD CONSTRAINT "_home_page_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_rels" ADD CONSTRAINT "_home_page_v_rels_itineraries_fk" FOREIGN KEY ("itineraries_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_rels" ADD CONSTRAINT "_home_page_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_rels" ADD CONSTRAINT "_home_page_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_hero_banners_order_idx" ON "home_page_hero_banners" USING btree ("_order");
  CREATE INDEX "home_page_hero_banners_parent_id_idx" ON "home_page_hero_banners" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_banners_image_idx" ON "home_page_hero_banners" USING btree ("image_id");
  CREATE INDEX "home_page_categories_items_order_idx" ON "home_page_categories_items" USING btree ("_order");
  CREATE INDEX "home_page_categories_items_parent_id_idx" ON "home_page_categories_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_categories_items_image_idx" ON "home_page_categories_items" USING btree ("image_id");
  CREATE INDEX "home_page_popular_duration_labels_order_idx" ON "home_page_popular_duration_labels" USING btree ("_order");
  CREATE INDEX "home_page_popular_duration_labels_parent_id_idx" ON "home_page_popular_duration_labels" USING btree ("_parent_id");
  CREATE INDEX "home_page_religious_duration_labels_order_idx" ON "home_page_religious_duration_labels" USING btree ("_order");
  CREATE INDEX "home_page_religious_duration_labels_parent_id_idx" ON "home_page_religious_duration_labels" USING btree ("_parent_id");
  CREATE INDEX "home_page_enquiry_promises_order_idx" ON "home_page_enquiry_promises" USING btree ("_order");
  CREATE INDEX "home_page_enquiry_promises_parent_id_idx" ON "home_page_enquiry_promises" USING btree ("_parent_id");
  CREATE INDEX "home_page_enquiry_durations_order_idx" ON "home_page_enquiry_durations" USING btree ("_order");
  CREATE INDEX "home_page_enquiry_durations_parent_id_idx" ON "home_page_enquiry_durations" USING btree ("_parent_id");
  CREATE INDEX "home_page_enquiry_styles_order_idx" ON "home_page_enquiry_styles" USING btree ("_order");
  CREATE INDEX "home_page_enquiry_styles_parent_id_idx" ON "home_page_enquiry_styles" USING btree ("_parent_id");
  CREATE INDEX "home_page_about_link_groups_links_order_idx" ON "home_page_about_link_groups_links" USING btree ("_order");
  CREATE INDEX "home_page_about_link_groups_links_parent_id_idx" ON "home_page_about_link_groups_links" USING btree ("_parent_id");
  CREATE INDEX "home_page_about_link_groups_order_idx" ON "home_page_about_link_groups" USING btree ("_order");
  CREATE INDEX "home_page_about_link_groups_parent_id_idx" ON "home_page_about_link_groups" USING btree ("_parent_id");
  CREATE INDEX "home_page_footer_main_links_order_idx" ON "home_page_footer_main_links" USING btree ("_order");
  CREATE INDEX "home_page_footer_main_links_parent_id_idx" ON "home_page_footer_main_links" USING btree ("_parent_id");
  CREATE INDEX "home_page_footer_quick_links_order_idx" ON "home_page_footer_quick_links" USING btree ("_order");
  CREATE INDEX "home_page_footer_quick_links_parent_id_idx" ON "home_page_footer_quick_links" USING btree ("_parent_id");
  CREATE INDEX "home_page_footer_legal_links_order_idx" ON "home_page_footer_legal_links" USING btree ("_order");
  CREATE INDEX "home_page_footer_legal_links_parent_id_idx" ON "home_page_footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "home_page_seo_hreflang_order_idx" ON "home_page_seo_hreflang" USING btree ("_order");
  CREATE INDEX "home_page_seo_hreflang_parent_id_idx" ON "home_page_seo_hreflang" USING btree ("_parent_id");
  CREATE INDEX "home_page_header_header_desktop_logo_idx" ON "home_page" USING btree ("header_desktop_logo_id");
  CREATE INDEX "home_page_header_header_mobile_logo_idx" ON "home_page" USING btree ("header_mobile_logo_id");
  CREATE INDEX "home_page_religious_religious_background_image_idx" ON "home_page" USING btree ("religious_background_image_id");
  CREATE INDEX "home_page_religious_religious_featured_image_idx" ON "home_page" USING btree ("religious_featured_image_id");
  CREATE INDEX "home_page_testimonials_testimonials_default_avatar_idx" ON "home_page" USING btree ("testimonials_default_avatar_id");
  CREATE INDEX "home_page_airport_airport_decoration_image_idx" ON "home_page" USING btree ("airport_decoration_image_id");
  CREATE INDEX "home_page_airport_airport_car_image_idx" ON "home_page" USING btree ("airport_car_image_id");
  CREATE INDEX "home_page_footer_footer_logo_idx" ON "home_page" USING btree ("footer_logo_id");
  CREATE INDEX "home_page_seo_seo_image_idx" ON "home_page" USING btree ("seo_image_id");
  CREATE INDEX "home_page_rels_order_idx" ON "home_page_rels" USING btree ("order");
  CREATE INDEX "home_page_rels_parent_idx" ON "home_page_rels" USING btree ("parent_id");
  CREATE INDEX "home_page_rels_path_idx" ON "home_page_rels" USING btree ("path");
  CREATE INDEX "home_page_rels_itineraries_id_idx" ON "home_page_rels" USING btree ("itineraries_id");
  CREATE INDEX "home_page_rels_guides_id_idx" ON "home_page_rels" USING btree ("guides_id");
  CREATE INDEX "home_page_rels_testimonials_id_idx" ON "home_page_rels" USING btree ("testimonials_id");
  CREATE INDEX "_home_page_v_version_hero_banners_order_idx" ON "_home_page_v_version_hero_banners" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_hero_banners_parent_id_idx" ON "_home_page_v_version_hero_banners" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_hero_banners_image_idx" ON "_home_page_v_version_hero_banners" USING btree ("image_id");
  CREATE INDEX "_home_page_v_version_categories_items_order_idx" ON "_home_page_v_version_categories_items" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_categories_items_parent_id_idx" ON "_home_page_v_version_categories_items" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_categories_items_image_idx" ON "_home_page_v_version_categories_items" USING btree ("image_id");
  CREATE INDEX "_home_page_v_version_popular_duration_labels_order_idx" ON "_home_page_v_version_popular_duration_labels" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_popular_duration_labels_parent_id_idx" ON "_home_page_v_version_popular_duration_labels" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_religious_duration_labels_order_idx" ON "_home_page_v_version_religious_duration_labels" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_religious_duration_labels_parent_id_idx" ON "_home_page_v_version_religious_duration_labels" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_enquiry_promises_order_idx" ON "_home_page_v_version_enquiry_promises" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_enquiry_promises_parent_id_idx" ON "_home_page_v_version_enquiry_promises" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_enquiry_durations_order_idx" ON "_home_page_v_version_enquiry_durations" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_enquiry_durations_parent_id_idx" ON "_home_page_v_version_enquiry_durations" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_enquiry_styles_order_idx" ON "_home_page_v_version_enquiry_styles" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_enquiry_styles_parent_id_idx" ON "_home_page_v_version_enquiry_styles" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_about_link_groups_links_order_idx" ON "_home_page_v_version_about_link_groups_links" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_about_link_groups_links_parent_id_idx" ON "_home_page_v_version_about_link_groups_links" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_about_link_groups_order_idx" ON "_home_page_v_version_about_link_groups" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_about_link_groups_parent_id_idx" ON "_home_page_v_version_about_link_groups" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_footer_main_links_order_idx" ON "_home_page_v_version_footer_main_links" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_footer_main_links_parent_id_idx" ON "_home_page_v_version_footer_main_links" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_footer_quick_links_order_idx" ON "_home_page_v_version_footer_quick_links" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_footer_quick_links_parent_id_idx" ON "_home_page_v_version_footer_quick_links" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_footer_legal_links_order_idx" ON "_home_page_v_version_footer_legal_links" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_footer_legal_links_parent_id_idx" ON "_home_page_v_version_footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_seo_hreflang_order_idx" ON "_home_page_v_version_seo_hreflang" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_seo_hreflang_parent_id_idx" ON "_home_page_v_version_seo_hreflang" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_header_version_header_desktop_logo_idx" ON "_home_page_v" USING btree ("version_header_desktop_logo_id");
  CREATE INDEX "_home_page_v_version_header_version_header_mobile_logo_idx" ON "_home_page_v" USING btree ("version_header_mobile_logo_id");
  CREATE INDEX "_home_page_v_version_religious_version_religious_backgro_idx" ON "_home_page_v" USING btree ("version_religious_background_image_id");
  CREATE INDEX "_home_page_v_version_religious_version_religious_feature_idx" ON "_home_page_v" USING btree ("version_religious_featured_image_id");
  CREATE INDEX "_home_page_v_version_testimonials_version_testimonials_d_idx" ON "_home_page_v" USING btree ("version_testimonials_default_avatar_id");
  CREATE INDEX "_home_page_v_version_airport_version_airport_decoration__idx" ON "_home_page_v" USING btree ("version_airport_decoration_image_id");
  CREATE INDEX "_home_page_v_version_airport_version_airport_car_image_idx" ON "_home_page_v" USING btree ("version_airport_car_image_id");
  CREATE INDEX "_home_page_v_version_footer_version_footer_logo_idx" ON "_home_page_v" USING btree ("version_footer_logo_id");
  CREATE INDEX "_home_page_v_version_seo_version_seo_image_idx" ON "_home_page_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_home_page_v_created_at_idx" ON "_home_page_v" USING btree ("created_at");
  CREATE INDEX "_home_page_v_updated_at_idx" ON "_home_page_v" USING btree ("updated_at");
  CREATE INDEX "_home_page_v_rels_order_idx" ON "_home_page_v_rels" USING btree ("order");
  CREATE INDEX "_home_page_v_rels_parent_idx" ON "_home_page_v_rels" USING btree ("parent_id");
  CREATE INDEX "_home_page_v_rels_path_idx" ON "_home_page_v_rels" USING btree ("path");
  CREATE INDEX "_home_page_v_rels_itineraries_id_idx" ON "_home_page_v_rels" USING btree ("itineraries_id");
  CREATE INDEX "_home_page_v_rels_guides_id_idx" ON "_home_page_v_rels" USING btree ("guides_id");
  CREATE INDEX "_home_page_v_rels_testimonials_id_idx" ON "_home_page_v_rels" USING btree ("testimonials_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_page_hero_banners" CASCADE;
  DROP TABLE "home_page_categories_items" CASCADE;
  DROP TABLE "home_page_popular_duration_labels" CASCADE;
  DROP TABLE "home_page_religious_duration_labels" CASCADE;
  DROP TABLE "home_page_enquiry_promises" CASCADE;
  DROP TABLE "home_page_enquiry_durations" CASCADE;
  DROP TABLE "home_page_enquiry_styles" CASCADE;
  DROP TABLE "home_page_about_link_groups_links" CASCADE;
  DROP TABLE "home_page_about_link_groups" CASCADE;
  DROP TABLE "home_page_footer_main_links" CASCADE;
  DROP TABLE "home_page_footer_quick_links" CASCADE;
  DROP TABLE "home_page_footer_legal_links" CASCADE;
  DROP TABLE "home_page_seo_hreflang" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_rels" CASCADE;
  DROP TABLE "_home_page_v_version_hero_banners" CASCADE;
  DROP TABLE "_home_page_v_version_categories_items" CASCADE;
  DROP TABLE "_home_page_v_version_popular_duration_labels" CASCADE;
  DROP TABLE "_home_page_v_version_religious_duration_labels" CASCADE;
  DROP TABLE "_home_page_v_version_enquiry_promises" CASCADE;
  DROP TABLE "_home_page_v_version_enquiry_durations" CASCADE;
  DROP TABLE "_home_page_v_version_enquiry_styles" CASCADE;
  DROP TABLE "_home_page_v_version_about_link_groups_links" CASCADE;
  DROP TABLE "_home_page_v_version_about_link_groups" CASCADE;
  DROP TABLE "_home_page_v_version_footer_main_links" CASCADE;
  DROP TABLE "_home_page_v_version_footer_quick_links" CASCADE;
  DROP TABLE "_home_page_v_version_footer_legal_links" CASCADE;
  DROP TABLE "_home_page_v_version_seo_hreflang" CASCADE;
  DROP TABLE "_home_page_v" CASCADE;
  DROP TABLE "_home_page_v_rels" CASCADE;
  DROP TYPE "public"."enum_home_page_footer_main_links_action";
  DROP TYPE "public"."enum_home_page_footer_quick_links_action";
  DROP TYPE "public"."enum_home_page_footer_legal_links_action";
  DROP TYPE "public"."enum_home_page_seo_robots";
  DROP TYPE "public"."enum__home_page_v_version_footer_main_links_action";
  DROP TYPE "public"."enum__home_page_v_version_footer_quick_links_action";
  DROP TYPE "public"."enum__home_page_v_version_footer_legal_links_action";
  DROP TYPE "public"."enum__home_page_v_version_seo_robots";`)
}

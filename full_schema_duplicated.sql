

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."days_id" AS ENUM (
    'day-1',
    'day-2',
    'day-3',
    'day-4'
);


ALTER TYPE "public"."days_id" OWNER TO "postgres";


CREATE TYPE "public"."plan_id" AS ENUM (
    'planId-0',
    'planId-1',
    'planId-2',
    'planId-3',
    'planId-4',
    'planId-5',
    'planId-6',
    'planId-7'
);


ALTER TYPE "public"."plan_id" OWNER TO "postgres";


CREATE TYPE "public"."plan_type_enum" AS ENUM (
    'free',
    'member',
    'participant'
);


ALTER TYPE "public"."plan_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."routes_zones" AS ENUM (
    'NORTH',
    'SOUTH',
    'EAST',
    'WEST'
);


ALTER TYPE "public"."routes_zones" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."about_carousel" (
    "id" "text" DEFAULT 'about-carousel'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "single_carousel" CHECK (("id" = 'about-carousel'::"text"))
);


ALTER TABLE "public"."about_carousel" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_carousel_slides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "carousel_id" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "image_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."about_carousel_slides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_citizens" (
    "id" "text" NOT NULL,
    "section_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "description" "text" NOT NULL,
    "year" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "image_name" "text"
);


ALTER TABLE "public"."about_citizens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_citizens_section" (
    "id" "text" DEFAULT 'about-citizens-section'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "single_about_citizens_section" CHECK (("id" = 'about-citizens-section'::"text"))
);


ALTER TABLE "public"."about_citizens_section" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_curated" (
    "id" "text" DEFAULT 'about-curated'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."about_curated" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_info" (
    "id" "text" DEFAULT 'about-info'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."about_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_info_items" (
    "id" "text" NOT NULL,
    "info_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "image_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."about_info_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_international" (
    "id" "text" DEFAULT 'about-international-section'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text" NOT NULL,
    "button_text" "text" NOT NULL,
    "website" "text" NOT NULL,
    "button_color" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "about_international_button_color_check" CHECK (("button_color" ~ '^#(?:[0-9a-fA-F]{3}){1,2}$'::"text")),
    CONSTRAINT "single_about_international_section" CHECK (("id" = 'about-international-section'::"text"))
);


ALTER TABLE "public"."about_international" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_participants" (
    "id" "text" DEFAULT 'about-participants'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."about_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_press" (
    "id" "text" DEFAULT 'about-press'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "single_about_press" CHECK (("id" = 'about-press'::"text"))
);


ALTER TABLE "public"."about_press" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_press_items" (
    "id" "text" NOT NULL,
    "press_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "is_visible" boolean NOT NULL
);


ALTER TABLE "public"."about_press_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_sponsors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "website" "text" NOT NULL,
    "sponsor_type" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."about_sponsors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."about_sponsors_header" (
    "id" "text" DEFAULT 'about-sponsors-header-section'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "sponsors_types" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "check_sponsors_types_structure" CHECK (("jsonb_typeof"("sponsors_types") = 'array'::"text")),
    CONSTRAINT "single_about_sponsors_header_section" CHECK (("id" = 'about-sponsors-header-section'::"text"))
);


ALTER TABLE "public"."about_sponsors_header" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_url" "text",
    "organizer_id" "uuid",
    "start_time" "text",
    "end_time" "text",
    "type" "text",
    "description" "text",
    "rsvp" boolean DEFAULT false,
    "rsvp_message" "text",
    "rsvp_link" "text",
    "co_organizers" "uuid"[],
    "title" "text" NOT NULL,
    "dayId" "public"."days_id" NOT NULL
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events_days" (
    "dayId" "public"."days_id" NOT NULL,
    "date" timestamp with time zone NOT NULL,
    "label" "text" NOT NULL
);


ALTER TABLE "public"."events_days" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hub_participants" (
    "hub_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."hub_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hubs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text",
    "hub_host_id" "uuid"
);


ALTER TABLE "public"."hubs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "invoice_company_name" "text" NOT NULL,
    "invoice_zip_code" "text" NOT NULL,
    "invoice_address" "text" NOT NULL,
    "invoice_country" "text" NOT NULL,
    "invoice_city" "text" NOT NULL,
    "invoice_extra" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_data_invoice_address_check" CHECK (("length"("invoice_address") >= 3)),
    CONSTRAINT "invoice_data_invoice_city_check" CHECK (("length"("invoice_city") >= 3)),
    CONSTRAINT "invoice_data_invoice_company_name_check" CHECK (("length"("invoice_company_name") >= 3)),
    CONSTRAINT "invoice_data_invoice_country_check" CHECK (("length"("invoice_country") >= 3))
);


ALTER TABLE "public"."invoice_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."main_colors" (
    "id" bigint NOT NULL,
    "box1" "text" NOT NULL,
    "box2" "text" NOT NULL,
    "box3" "text" NOT NULL,
    "box4" "text" NOT NULL,
    "triangle" "text" NOT NULL
);


ALTER TABLE "public"."main_colors" OWNER TO "postgres";


ALTER TABLE "public"."main_colors" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."main_colors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."main_links" (
    "id" bigint NOT NULL,
    "platform" "text" NOT NULL,
    "link" "text" NOT NULL
);


ALTER TABLE "public"."main_links" OWNER TO "postgres";


ALTER TABLE "public"."main_links" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."main_links_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."main_menu" (
    "label" "text" NOT NULL,
    "section" "text" NOT NULL,
    "className" "text" NOT NULL,
    "menu_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subItems" "jsonb"
);


ALTER TABLE "public"."main_menu" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."map_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "formatted_address" "text",
    "latitude" numeric,
    "longitude" numeric,
    "no_address" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."map_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."participant_details" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "short_description" "text" NOT NULL,
    "description" "text",
    "slug" "text" NOT NULL,
    "is_sticky" boolean DEFAULT false,
    "year" integer,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."participant_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."participant_image" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "user_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL
);


ALTER TABLE "public"."participant_image" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "plan_id" "public"."plan_id" NOT NULL,
    "plan_label" "text" NOT NULL,
    "plan_price" "text" NOT NULL,
    "plan_type" "public"."plan_type_enum" NOT NULL,
    "plan_currency" "text" NOT NULL,
    "currency_logo" "text" NOT NULL,
    "plan_description" "text" NOT NULL,
    "plan_items" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."route_dots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "route_id" "uuid" NOT NULL,
    "map_info_id" "uuid" NOT NULL,
    "route_step" smallint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."route_dots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text",
    "description" "text",
    "zone" "public"."routes_zones",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."routes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_name" "text" NOT NULL,
    "is_mod" boolean DEFAULT false,
    "plan_id" "text" NOT NULL,
    "plan_type" "text" NOT NULL,
    "phone_numbers" "text"[],
    "social_media" "jsonb",
    "visible_emails" "text"[],
    "visible_websites" "text"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."user_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visiting_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "user_id" "uuid" NOT NULL,
    "hours" "jsonb"
);


ALTER TABLE "public"."visiting_hours" OWNER TO "postgres";


ALTER TABLE ONLY "public"."about_press"
    ADD CONSTRAINT "about_about_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_carousel"
    ADD CONSTRAINT "about_carousel_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_carousel_slides"
    ADD CONSTRAINT "about_carousel_slides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_citizens"
    ADD CONSTRAINT "about_citizens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_citizens_section"
    ADD CONSTRAINT "about_citizens_section_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_curated"
    ADD CONSTRAINT "about_curated_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_info_items"
    ADD CONSTRAINT "about_info_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_info"
    ADD CONSTRAINT "about_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_international"
    ADD CONSTRAINT "about_international_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_participants"
    ADD CONSTRAINT "about_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_press_items"
    ADD CONSTRAINT "about_press_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_sponsors"
    ADD CONSTRAINT "about_sponsors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events_days"
    ADD CONSTRAINT "events_days_pkey" PRIMARY KEY ("dayId");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hub_participants"
    ADD CONSTRAINT "hub_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hubs"
    ADD CONSTRAINT "hubs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_data"
    ADD CONSTRAINT "invoice_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."main_colors"
    ADD CONSTRAINT "main_colors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."main_links"
    ADD CONSTRAINT "main_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."main_menu"
    ADD CONSTRAINT "main_menu_pkey" PRIMARY KEY ("menu_id");



ALTER TABLE ONLY "public"."map_info"
    ADD CONSTRAINT "map_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."participant_details"
    ADD CONSTRAINT "participant_details_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."participant_details"
    ADD CONSTRAINT "participant_details_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."participant_image"
    ADD CONSTRAINT "participant_image_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("plan_id");



ALTER TABLE ONLY "public"."route_dots"
    ADD CONSTRAINT "route_dots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_sponsors_header"
    ADD CONSTRAINT "sponsors_header_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."about_carousel_slides"
    ADD CONSTRAINT "unique_carousel_image" UNIQUE ("carousel_id", "image_url");



ALTER TABLE ONLY "public"."user_info"
    ADD CONSTRAINT "user_info_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."visiting_hours"
    ADD CONSTRAINT "visiting_hours_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_citizens_year" ON "public"."about_citizens" USING "btree" ("year");



CREATE INDEX "idx_events_type" ON "public"."events" USING "btree" ("type");



CREATE INDEX "idx_invoice_data_user_id" ON "public"."invoice_data" USING "btree" ("user_id");



CREATE INDEX "idx_participant_details_slug" ON "public"."participant_details" USING "btree" ("slug");



CREATE INDEX "idx_user_info_plan_type" ON "public"."user_info" USING "btree" ("plan_type");



CREATE INDEX "idx_user_info_user_id" ON "public"."user_info" USING "btree" ("user_id");



CREATE INDEX "idx_visiting_hours_hours" ON "public"."visiting_hours" USING "gin" ("hours");



CREATE INDEX "idx_visiting_hours_user" ON "public"."visiting_hours" USING "btree" ("user_id");



CREATE INDEX "plans_plan_price_idx" ON "public"."plans" USING "btree" ((("plan_price")::numeric));



CREATE INDEX "plans_plan_type_idx" ON "public"."plans" USING "btree" ("plan_type");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_dayid_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."events_days"("dayId");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."about_carousel_slides"
    ADD CONSTRAINT "fk_carousel" FOREIGN KEY ("carousel_id") REFERENCES "public"."about_carousel"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."about_press_items"
    ADD CONSTRAINT "fk_info" FOREIGN KEY ("press_id") REFERENCES "public"."about_press"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."about_info_items"
    ADD CONSTRAINT "fk_info" FOREIGN KEY ("info_id") REFERENCES "public"."about_info"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."about_citizens"
    ADD CONSTRAINT "fk_section" FOREIGN KEY ("section_id") REFERENCES "public"."about_citizens_section"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hub_participants"
    ADD CONSTRAINT "hub_participants_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "public"."hubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hub_participants"
    ADD CONSTRAINT "hub_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hubs"
    ADD CONSTRAINT "hubs_hub_host_id_fkey" FOREIGN KEY ("hub_host_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_data"
    ADD CONSTRAINT "invoice_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."map_info"
    ADD CONSTRAINT "map_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."participant_details"
    ADD CONSTRAINT "participant_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."participant_image"
    ADD CONSTRAINT "participant_image_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."route_dots"
    ADD CONSTRAINT "route_dots_map_info_id_fkey" FOREIGN KEY ("map_info_id") REFERENCES "public"."map_info"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."route_dots"
    ADD CONSTRAINT "route_dots_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_info"
    ADD CONSTRAINT "user_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."visiting_hours"
    ADD CONSTRAINT "visiting_hours_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



CREATE POLICY "Allow delete by auth and mod" ON "public"."participant_image" FOR DELETE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow delete for owners and mod" ON "public"."events" FOR DELETE USING ((("auth"."uid"() = "organizer_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow delete for owners and mod" ON "public"."invoice_data" FOR DELETE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow delete for owners and mod" ON "public"."participant_details" FOR DELETE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow delete for owners and mod" ON "public"."user_info" FOR DELETE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow delete for owners and mod" ON "public"."visiting_hours" FOR DELETE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow for everyone" ON "public"."about_carousel" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_carousel_slides" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_citizens" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_citizens_section" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_curated" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_info" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_info_items" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_international" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_participants" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_press" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_press_items" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_sponsors" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."about_sponsors_header" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."events_days" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."hub_participants" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."hubs" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."main_colors" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."main_links" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."main_menu" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."map_info" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."plans" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."route_dots" USING (true);



CREATE POLICY "Allow for everyone" ON "public"."routes" USING (true);



CREATE POLICY "Allow insert for everyone" ON "public"."participant_image" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert to everyone" ON "public"."user_info" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow select for everyone" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Allow select for everyone" ON "public"."invoice_data" FOR SELECT USING (true);



CREATE POLICY "Allow select for everyone" ON "public"."participant_details" FOR SELECT USING (true);



CREATE POLICY "Allow select for everyone" ON "public"."participant_image" FOR SELECT USING (true);



CREATE POLICY "Allow select for everyone" ON "public"."visiting_hours" FOR SELECT USING (true);



CREATE POLICY "Allow select to everyone" ON "public"."user_info" FOR SELECT USING (true);



CREATE POLICY "Allow update by owner or mod" ON "public"."invoice_data" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow update by owner or mod" ON "public"."participant_details" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow update by owner or mod" ON "public"."user_info" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow update for auth and mod" ON "public"."participant_image" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow update to auth and mod" ON "public"."events" FOR UPDATE USING ((("auth"."uid"() = "organizer_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow update to auth and mod" ON "public"."visiting_hours" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Enable insert for everyone" ON "public"."invoice_data" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for everyone" ON "public"."participant_details" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for everyone" ON "public"."visiting_hours" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert to auth and mods" ON "public"."events" FOR INSERT WITH CHECK ((("auth"."uid"() = "organizer_id") OR ( SELECT "user_info_1"."is_mod"
   FROM "public"."user_info" "user_info_1"
  WHERE ("user_info_1"."user_id" = "auth"."uid"())
 LIMIT 1)));



ALTER TABLE "public"."about_carousel" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_carousel_slides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_citizens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_citizens_section" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_curated" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_info_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_international" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_press" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_press_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_sponsors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."about_sponsors_header" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events_days" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hub_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hubs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."main_colors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."main_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."main_menu" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."map_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."participant_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."participant_image" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."route_dots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."routes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visiting_hours" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



































































































































































































GRANT ALL ON TABLE "public"."about_carousel" TO "anon";
GRANT ALL ON TABLE "public"."about_carousel" TO "authenticated";
GRANT ALL ON TABLE "public"."about_carousel" TO "service_role";



GRANT ALL ON TABLE "public"."about_carousel_slides" TO "anon";
GRANT ALL ON TABLE "public"."about_carousel_slides" TO "authenticated";
GRANT ALL ON TABLE "public"."about_carousel_slides" TO "service_role";



GRANT ALL ON TABLE "public"."about_citizens" TO "anon";
GRANT ALL ON TABLE "public"."about_citizens" TO "authenticated";
GRANT ALL ON TABLE "public"."about_citizens" TO "service_role";



GRANT ALL ON TABLE "public"."about_citizens_section" TO "anon";
GRANT ALL ON TABLE "public"."about_citizens_section" TO "authenticated";
GRANT ALL ON TABLE "public"."about_citizens_section" TO "service_role";



GRANT ALL ON TABLE "public"."about_curated" TO "anon";
GRANT ALL ON TABLE "public"."about_curated" TO "authenticated";
GRANT ALL ON TABLE "public"."about_curated" TO "service_role";



GRANT ALL ON TABLE "public"."about_info" TO "anon";
GRANT ALL ON TABLE "public"."about_info" TO "authenticated";
GRANT ALL ON TABLE "public"."about_info" TO "service_role";



GRANT ALL ON TABLE "public"."about_info_items" TO "anon";
GRANT ALL ON TABLE "public"."about_info_items" TO "authenticated";
GRANT ALL ON TABLE "public"."about_info_items" TO "service_role";



GRANT ALL ON TABLE "public"."about_international" TO "anon";
GRANT ALL ON TABLE "public"."about_international" TO "authenticated";
GRANT ALL ON TABLE "public"."about_international" TO "service_role";



GRANT ALL ON TABLE "public"."about_participants" TO "anon";
GRANT ALL ON TABLE "public"."about_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."about_participants" TO "service_role";



GRANT ALL ON TABLE "public"."about_press" TO "anon";
GRANT ALL ON TABLE "public"."about_press" TO "authenticated";
GRANT ALL ON TABLE "public"."about_press" TO "service_role";



GRANT ALL ON TABLE "public"."about_press_items" TO "anon";
GRANT ALL ON TABLE "public"."about_press_items" TO "authenticated";
GRANT ALL ON TABLE "public"."about_press_items" TO "service_role";



GRANT ALL ON TABLE "public"."about_sponsors" TO "anon";
GRANT ALL ON TABLE "public"."about_sponsors" TO "authenticated";
GRANT ALL ON TABLE "public"."about_sponsors" TO "service_role";



GRANT ALL ON TABLE "public"."about_sponsors_header" TO "anon";
GRANT ALL ON TABLE "public"."about_sponsors_header" TO "authenticated";
GRANT ALL ON TABLE "public"."about_sponsors_header" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."events_days" TO "anon";
GRANT ALL ON TABLE "public"."events_days" TO "authenticated";
GRANT ALL ON TABLE "public"."events_days" TO "service_role";



GRANT ALL ON TABLE "public"."hub_participants" TO "anon";
GRANT ALL ON TABLE "public"."hub_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."hub_participants" TO "service_role";



GRANT ALL ON TABLE "public"."hubs" TO "anon";
GRANT ALL ON TABLE "public"."hubs" TO "authenticated";
GRANT ALL ON TABLE "public"."hubs" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_data" TO "anon";
GRANT ALL ON TABLE "public"."invoice_data" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_data" TO "service_role";



GRANT ALL ON TABLE "public"."main_colors" TO "anon";
GRANT ALL ON TABLE "public"."main_colors" TO "authenticated";
GRANT ALL ON TABLE "public"."main_colors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."main_colors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."main_colors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."main_colors_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."main_links" TO "anon";
GRANT ALL ON TABLE "public"."main_links" TO "authenticated";
GRANT ALL ON TABLE "public"."main_links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."main_links_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."main_links_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."main_links_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."main_menu" TO "anon";
GRANT ALL ON TABLE "public"."main_menu" TO "authenticated";
GRANT ALL ON TABLE "public"."main_menu" TO "service_role";



GRANT ALL ON TABLE "public"."map_info" TO "anon";
GRANT ALL ON TABLE "public"."map_info" TO "authenticated";
GRANT ALL ON TABLE "public"."map_info" TO "service_role";



GRANT ALL ON TABLE "public"."participant_details" TO "anon";
GRANT ALL ON TABLE "public"."participant_details" TO "authenticated";
GRANT ALL ON TABLE "public"."participant_details" TO "service_role";



GRANT ALL ON TABLE "public"."participant_image" TO "anon";
GRANT ALL ON TABLE "public"."participant_image" TO "authenticated";
GRANT ALL ON TABLE "public"."participant_image" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON TABLE "public"."route_dots" TO "anon";
GRANT ALL ON TABLE "public"."route_dots" TO "authenticated";
GRANT ALL ON TABLE "public"."route_dots" TO "service_role";



GRANT ALL ON TABLE "public"."routes" TO "anon";
GRANT ALL ON TABLE "public"."routes" TO "authenticated";
GRANT ALL ON TABLE "public"."routes" TO "service_role";



GRANT ALL ON TABLE "public"."user_info" TO "anon";
GRANT ALL ON TABLE "public"."user_info" TO "authenticated";
GRANT ALL ON TABLE "public"."user_info" TO "service_role";



GRANT ALL ON TABLE "public"."visiting_hours" TO "anon";
GRANT ALL ON TABLE "public"."visiting_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."visiting_hours" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

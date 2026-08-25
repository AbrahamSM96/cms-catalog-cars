import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cars_transmission" AS ENUM('automatic', 'manual');
  CREATE TYPE "public"."enum_cars_fuel_type" AS ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'plug-in-hybrid');
  CREATE TYPE "public"."enum_cars_status" AS ENUM('available', 'reserved', 'sold');
  CREATE TYPE "public"."enum_cars_vehicle_type" AS ENUM('car', 'truck');
  CREATE TYPE "public"."enum_cars_body_type" AS ENUM('coupe', 'truck', 'sedan', 'hatchback', 'suv', 'convertible', 'wagon', 'minivan', 'small-car');
  CREATE TYPE "public"."enum_cars_condition" AS ENUM('excellent', 'very-good', 'good', 'fair', 'poor');
  CREATE TYPE "public"."enum_cars_history_owner_history" AS ENUM('single', 'two', 'multiple');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor', 'user');
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "car_models" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "car_versions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"model_id" integer NOT NULL,
  	"description" varchar NOT NULL,
  	"clave" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "car_versions_numbers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" numeric,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL
  );
  
  CREATE TABLE "cars_financing_available_loan_terms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"months" numeric NOT NULL
  );
  
  CREATE TABLE "cars_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL
  );
  
  CREATE TABLE "cars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"brand_id" integer NOT NULL,
  	"model" varchar NOT NULL,
  	"year" numeric NOT NULL,
  	"version" varchar NOT NULL,
  	"transmission" "enum_cars_transmission" DEFAULT 'manual' NOT NULL,
  	"fuel_type" "enum_cars_fuel_type",
  	"status" "enum_cars_status" DEFAULT 'available' NOT NULL,
  	"featured" boolean,
  	"description" varchar,
  	"featured_image_id" integer,
  	"price" numeric NOT NULL,
  	"has_v_a_t" boolean DEFAULT false,
  	"show_financing" boolean DEFAULT true,
  	"financing_min_down_payment_percentage" numeric DEFAULT 20,
  	"financing_max_down_payment_percentage" numeric DEFAULT 80,
  	"financing_default_down_payment_percentage" numeric DEFAULT 20,
  	"financing_default_loan_term" numeric DEFAULT 36,
  	"financing_interest_rate" numeric DEFAULT 8.5,
  	"engine" varchar,
  	"horsepower" numeric,
  	"cylinders" numeric,
  	"vehicle_type" "enum_cars_vehicle_type",
  	"body_type" "enum_cars_body_type",
  	"doors" numeric,
  	"passengers" numeric,
  	"mileage" numeric,
  	"condition" "enum_cars_condition",
  	"exterior_color_id" integer,
  	"interior_color_id" integer,
  	"history_inspection_points" numeric DEFAULT 150,
  	"history_owner_history" "enum_cars_history_owner_history" DEFAULT 'single',
  	"history_duplicate_keys" boolean DEFAULT false,
  	"history_plates" boolean DEFAULT false,
  	"history_manuals" boolean DEFAULT false,
  	"history_conditioning" boolean DEFAULT false,
  	"dealership_id" integer,
  	"location_dealership" varchar,
  	"location_city" varchar,
  	"location_state" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cars_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "colors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"hex" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "dealerships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"image_id" integer,
  	"phone" varchar,
  	"whatsapp" varchar,
  	"address_line1" varchar,
  	"address_neighborhood" varchar,
  	"address_postal_code" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_country" varchar DEFAULT 'México',
  	"coordinates_latitude" numeric,
  	"coordinates_longitude" numeric,
  	"google_maps_url" varchar,
  	"hours_monday_closed" boolean DEFAULT false,
  	"hours_monday_open" varchar,
  	"hours_monday_close" varchar,
  	"hours_tuesday_closed" boolean DEFAULT false,
  	"hours_tuesday_open" varchar,
  	"hours_tuesday_close" varchar,
  	"hours_wednesday_closed" boolean DEFAULT false,
  	"hours_wednesday_open" varchar,
  	"hours_wednesday_close" varchar,
  	"hours_thursday_closed" boolean DEFAULT false,
  	"hours_thursday_open" varchar,
  	"hours_thursday_close" varchar,
  	"hours_friday_closed" boolean DEFAULT false,
  	"hours_friday_open" varchar,
  	"hours_friday_close" varchar,
  	"hours_saturday_closed" boolean DEFAULT false,
  	"hours_saturday_open" varchar,
  	"hours_saturday_close" varchar,
  	"hours_sunday_closed" boolean DEFAULT false,
  	"hours_sunday_open" varchar,
  	"hours_sunday_close" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"prefix" varchar DEFAULT 'cms-cars',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"brands_id" integer,
  	"car_models_id" integer,
  	"car_versions_id" integer,
  	"cars_id" integer,
  	"colors_id" integer,
  	"dealerships_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar DEFAULT 'Nuevos modelos disponibles',
  	"hero_heading" varchar DEFAULT 'Encuentra Tu Auto',
  	"hero_heading_highlight" varchar DEFAULT 'Seminuevo Ideal',
  	"hero_subheading" varchar DEFAULT 'La mejor selección de autos premium con garantía de calidad. Financiamiento disponible y facilidades de pago.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"whatsapp" varchar,
  	"email" varchar,
  	"address_line1" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_postal_code" varchar,
  	"address_country" varchar DEFAULT 'México',
  	"address_google_maps_url" varchar,
  	"hours_note" varchar,
  	"social_facebook" varchar,
  	"social_instagram" varchar,
  	"social_tiktok" varchar,
  	"social_youtube" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar NOT NULL,
  	"brand_tagline" varchar,
  	"brand_description" varchar,
  	"seo_title_default" varchar,
  	"seo_title_template" varchar,
  	"seo_description" varchar,
  	"seo_og_description" varchar,
  	"media_favicon_id" integer,
  	"media_og_image_id" integer,
  	"theme_accent" varchar,
  	"theme_accent_strong" varchar,
  	"theme_primary" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "car_models" ADD CONSTRAINT "car_models_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "car_versions" ADD CONSTRAINT "car_versions_model_id_car_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."car_models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "car_versions_numbers" ADD CONSTRAINT "car_versions_numbers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."car_versions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cars_financing_available_loan_terms" ADD CONSTRAINT "cars_financing_available_loan_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cars_features" ADD CONSTRAINT "cars_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cars" ADD CONSTRAINT "cars_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cars" ADD CONSTRAINT "cars_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cars" ADD CONSTRAINT "cars_exterior_color_id_colors_id_fk" FOREIGN KEY ("exterior_color_id") REFERENCES "public"."colors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cars" ADD CONSTRAINT "cars_interior_color_id_colors_id_fk" FOREIGN KEY ("interior_color_id") REFERENCES "public"."colors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cars" ADD CONSTRAINT "cars_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cars_rels" ADD CONSTRAINT "cars_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cars_rels" ADD CONSTRAINT "cars_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "dealerships" ADD CONSTRAINT "dealerships_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_car_models_fk" FOREIGN KEY ("car_models_id") REFERENCES "public"."car_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_car_versions_fk" FOREIGN KEY ("car_versions_id") REFERENCES "public"."car_versions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cars_fk" FOREIGN KEY ("cars_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_colors_fk" FOREIGN KEY ("colors_id") REFERENCES "public"."colors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dealerships_fk" FOREIGN KEY ("dealerships_id") REFERENCES "public"."dealerships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_hero_slides" ADD CONSTRAINT "homepage_hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_slides" ADD CONSTRAINT "homepage_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_seo_keywords" ADD CONSTRAINT "site_settings_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_media_favicon_id_media_id_fk" FOREIGN KEY ("media_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_media_og_image_id_media_id_fk" FOREIGN KEY ("media_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "brands_name_idx" ON "brands" USING btree ("name");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "car_models_brand_idx" ON "car_models" USING btree ("brand_id");
  CREATE INDEX "car_models_updated_at_idx" ON "car_models" USING btree ("updated_at");
  CREATE INDEX "car_models_created_at_idx" ON "car_models" USING btree ("created_at");
  CREATE INDEX "car_versions_model_idx" ON "car_versions" USING btree ("model_id");
  CREATE UNIQUE INDEX "car_versions_clave_idx" ON "car_versions" USING btree ("clave");
  CREATE INDEX "car_versions_updated_at_idx" ON "car_versions" USING btree ("updated_at");
  CREATE INDEX "car_versions_created_at_idx" ON "car_versions" USING btree ("created_at");
  CREATE INDEX "car_versions_numbers_order_parent_idx" ON "car_versions_numbers" USING btree ("order","parent_id");
  CREATE INDEX "cars_financing_available_loan_terms_order_idx" ON "cars_financing_available_loan_terms" USING btree ("_order");
  CREATE INDEX "cars_financing_available_loan_terms_parent_id_idx" ON "cars_financing_available_loan_terms" USING btree ("_parent_id");
  CREATE INDEX "cars_features_order_idx" ON "cars_features" USING btree ("_order");
  CREATE INDEX "cars_features_parent_id_idx" ON "cars_features" USING btree ("_parent_id");
  CREATE INDEX "cars_brand_idx" ON "cars" USING btree ("brand_id");
  CREATE INDEX "cars_featured_image_idx" ON "cars" USING btree ("featured_image_id");
  CREATE INDEX "cars_exterior_color_idx" ON "cars" USING btree ("exterior_color_id");
  CREATE INDEX "cars_interior_color_idx" ON "cars" USING btree ("interior_color_id");
  CREATE INDEX "cars_dealership_idx" ON "cars" USING btree ("dealership_id");
  CREATE INDEX "cars_updated_at_idx" ON "cars" USING btree ("updated_at");
  CREATE INDEX "cars_created_at_idx" ON "cars" USING btree ("created_at");
  CREATE INDEX "cars_rels_order_idx" ON "cars_rels" USING btree ("order");
  CREATE INDEX "cars_rels_parent_idx" ON "cars_rels" USING btree ("parent_id");
  CREATE INDEX "cars_rels_path_idx" ON "cars_rels" USING btree ("path");
  CREATE INDEX "cars_rels_media_id_idx" ON "cars_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "colors_name_idx" ON "colors" USING btree ("name");
  CREATE INDEX "colors_updated_at_idx" ON "colors" USING btree ("updated_at");
  CREATE INDEX "colors_created_at_idx" ON "colors" USING btree ("created_at");
  CREATE INDEX "dealerships_image_idx" ON "dealerships" USING btree ("image_id");
  CREATE INDEX "dealerships_updated_at_idx" ON "dealerships" USING btree ("updated_at");
  CREATE INDEX "dealerships_created_at_idx" ON "dealerships" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_car_models_id_idx" ON "payload_locked_documents_rels" USING btree ("car_models_id");
  CREATE INDEX "payload_locked_documents_rels_car_versions_id_idx" ON "payload_locked_documents_rels" USING btree ("car_versions_id");
  CREATE INDEX "payload_locked_documents_rels_cars_id_idx" ON "payload_locked_documents_rels" USING btree ("cars_id");
  CREATE INDEX "payload_locked_documents_rels_colors_id_idx" ON "payload_locked_documents_rels" USING btree ("colors_id");
  CREATE INDEX "payload_locked_documents_rels_dealerships_id_idx" ON "payload_locked_documents_rels" USING btree ("dealerships_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_hero_slides_order_idx" ON "homepage_hero_slides" USING btree ("_order");
  CREATE INDEX "homepage_hero_slides_parent_id_idx" ON "homepage_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_slides_image_idx" ON "homepage_hero_slides" USING btree ("image_id");
  CREATE INDEX "site_settings_seo_keywords_order_idx" ON "site_settings_seo_keywords" USING btree ("_order");
  CREATE INDEX "site_settings_seo_keywords_parent_id_idx" ON "site_settings_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "site_settings_media_media_favicon_idx" ON "site_settings" USING btree ("media_favicon_id");
  CREATE INDEX "site_settings_media_media_og_image_idx" ON "site_settings" USING btree ("media_og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "brands" CASCADE;
  DROP TABLE "car_models" CASCADE;
  DROP TABLE "car_versions" CASCADE;
  DROP TABLE "car_versions_numbers" CASCADE;
  DROP TABLE "cars_financing_available_loan_terms" CASCADE;
  DROP TABLE "cars_features" CASCADE;
  DROP TABLE "cars" CASCADE;
  DROP TABLE "cars_rels" CASCADE;
  DROP TABLE "colors" CASCADE;
  DROP TABLE "dealerships" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage_hero_slides" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "site_settings_seo_keywords" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_cars_transmission";
  DROP TYPE "public"."enum_cars_fuel_type";
  DROP TYPE "public"."enum_cars_status";
  DROP TYPE "public"."enum_cars_vehicle_type";
  DROP TYPE "public"."enum_cars_body_type";
  DROP TYPE "public"."enum_cars_condition";
  DROP TYPE "public"."enum_cars_history_owner_history";
  DROP TYPE "public"."enum_users_roles";`)
}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260516094228 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "bike_rack" drop constraint if exists "bike_rack_catalog_number_unique";`);
    this.addSql(`create table if not exists "bike_rack" ("id" text not null, "catalog_number" text not null, "name" text not null, "manufacturer" text not null, "max_bikes" integer not null, "max_bike_weight_kg" integer not null, "max_total_load_kg" integer not null, "power_socket" text not null, "weight_kg" integer not null, "length_cm" integer not null, "has_lockable_attachment" boolean not null, "has_rear_lights" boolean not null, "has_tilt_function" boolean not null, "tool_free_assembly" boolean not null, "warranty_years" integer not null default 2, "description_html" text not null, "short_description" text null, "thumbnail" text not null, "gallery" jsonb not null, "installation_manual_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bike_rack_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_bike_rack_catalog_number_unique" ON "bike_rack" ("catalog_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bike_rack_deleted_at" ON "bike_rack" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bike_rack_manufacturer" ON "bike_rack" ("manufacturer") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bike_rack_max_bikes" ON "bike_rack" ("max_bikes") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bike_rack" cascade;`);
  }

}

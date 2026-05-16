import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260516094422 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "standalone_wiring" drop constraint if exists "standalone_wiring_catalog_number_unique";`);
    this.addSql(`create table if not exists "standalone_wiring" ("id" text not null, "catalog_number" text not null, "name" text not null, "manufacturer" text not null, "type" text check ("type" in ('harness', 'module')) not null, "pin_count" integer not null, "weight_kg" integer not null, "has_fog_lights" boolean not null, "has_reverse_lights" boolean not null, "has_stop_lights" boolean not null, "has_indicators" boolean not null, "homologation" text not null, "warranty_years" integer not null default 2, "fits_all_vehicles" boolean not null, "description_html" text not null, "short_description" text null, "thumbnail" text not null, "gallery" jsonb not null, "installation_manual_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "standalone_wiring_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_standalone_wiring_catalog_number_unique" ON "standalone_wiring" ("catalog_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_standalone_wiring_deleted_at" ON "standalone_wiring" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_standalone_wiring_fits_all_vehicles" ON "standalone_wiring" ("fits_all_vehicles") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_standalone_wiring_type_pin_count" ON "standalone_wiring" ("type", "pin_count") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_standalone_wiring_manufacturer" ON "standalone_wiring" ("manufacturer") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "standalone_wiring" cascade;`);
  }

}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260516093604 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "hook" drop constraint if exists "hook_catalog_number_unique";`);
    this.addSql(`create table if not exists "hook" ("id" text not null, "catalog_number" text not null, "name" text not null, "manufacturer" text not null, "manufacturer_catalog_number" text null, "pulling_capacity_kg" integer not null, "vertical_load_kg" integer not null, "homologation" text not null, "ball_type" text not null, "requires_bumper_cutting" boolean not null default false, "warranty_years" integer not null default 2, "weight_kg" integer not null, "description_html" text not null, "short_description" text null, "thumbnail" text not null, "gallery" jsonb not null, "installation_manual_url" text null, "certificate_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "hook_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_hook_catalog_number_unique" ON "hook" ("catalog_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hook_deleted_at" ON "hook" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hook_manufacturer" ON "hook" ("manufacturer") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hook_pulling_capacity_kg" ON "hook" ("pulling_capacity_kg") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hook_ball_type" ON "hook" ("ball_type") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "hook" cascade;`);
  }

}

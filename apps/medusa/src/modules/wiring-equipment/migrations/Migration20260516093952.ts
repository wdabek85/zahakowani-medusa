import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260516093952 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "wiring_equipment" drop constraint if exists "wiring_equipment_code_unique";`);
    this.addSql(`create table if not exists "wiring_equipment" ("id" text not null, "code" text not null, "type" text check ("type" in ('harness', 'module')) not null, "pin_count" integer not null, "name" text not null, "weight_kg" integer not null, "description_html" text not null, "has_fog_lights" boolean not null, "has_reverse_lights" boolean not null, "has_stop_lights" boolean not null, "has_indicators" boolean not null, "homologation" text not null, "gallery" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "wiring_equipment_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_wiring_equipment_code_unique" ON "wiring_equipment" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_wiring_equipment_deleted_at" ON "wiring_equipment" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "wiring_equipment" cascade;`);
  }

}

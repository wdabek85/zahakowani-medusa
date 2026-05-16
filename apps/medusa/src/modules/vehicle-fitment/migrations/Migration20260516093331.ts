import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260516093331 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "generation" drop constraint if exists "generation_vehicle_model_id_code_unique";`);
    this.addSql(`alter table if exists "vehicle_model" drop constraint if exists "vehicle_model_brand_id_code_unique";`);
    this.addSql(`alter table if exists "brand" drop constraint if exists "brand_code_unique";`);
    this.addSql(`create table if not exists "brand" ("id" text not null, "code" text not null, "name" text not null, "logo_url" text null, "display_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "brand_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_brand_code_unique" ON "brand" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_brand_deleted_at" ON "brand" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vehicle_model" ("id" text not null, "code" text not null, "name" text not null, "display_order" integer not null default 0, "brand_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vehicle_model_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vehicle_model_brand_id" ON "vehicle_model" ("brand_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vehicle_model_deleted_at" ON "vehicle_model" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vehicle_model_brand_id_code_unique" ON "vehicle_model" ("brand_id", "code") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "generation" ("id" text not null, "code" text not null, "name" text not null, "year_from" integer not null, "year_to" integer null, "body_type" text null, "vehicle_model_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "generation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_generation_vehicle_model_id" ON "generation" ("vehicle_model_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_generation_deleted_at" ON "generation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_generation_vehicle_model_id_code_unique" ON "generation" ("vehicle_model_id", "code") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vehicle_model" add constraint "vehicle_model_brand_id_foreign" foreign key ("brand_id") references "brand" ("id") on update cascade;`);

    this.addSql(`alter table if exists "generation" add constraint "generation_vehicle_model_id_foreign" foreign key ("vehicle_model_id") references "vehicle_model" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vehicle_model" drop constraint if exists "vehicle_model_brand_id_foreign";`);

    this.addSql(`alter table if exists "generation" drop constraint if exists "generation_vehicle_model_id_foreign";`);

    this.addSql(`drop table if exists "brand" cascade;`);

    this.addSql(`drop table if exists "vehicle_model" cascade;`);

    this.addSql(`drop table if exists "generation" cascade;`);
  }

}

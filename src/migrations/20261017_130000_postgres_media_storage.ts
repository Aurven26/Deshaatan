import {MigrateDownArgs,MigrateUpArgs,sql} from '@payloadcms/db-postgres';

export async function up({db}:MigrateUpArgs):Promise<void>{
  await db.execute(sql`
    CREATE TABLE "cms_media_blobs" (
      "collection_slug" varchar(64) NOT NULL,
      "storage_path" text NOT NULL,
      "filename" text NOT NULL,
      "mime_type" varchar(255) NOT NULL,
      "size_bytes" bigint NOT NULL,
      "data" bytea NOT NULL,
      "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
      PRIMARY KEY ("collection_slug", "storage_path")
    );
    CREATE INDEX "cms_media_blobs_filename_idx" ON "cms_media_blobs" USING btree ("collection_slug", "filename");
  `);
}

export async function down({db}:MigrateDownArgs):Promise<void>{
  await db.execute(sql`DROP TABLE "cms_media_blobs";`);
}

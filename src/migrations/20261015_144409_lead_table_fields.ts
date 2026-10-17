import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import {backfillLeadColumns} from '../cms/backfill-lead-columns';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" ADD COLUMN "trip_duration" varchar;
  ALTER TABLE "leads" ADD COLUMN "travel_style" varchar;
  ALTER TABLE "leads" ADD COLUMN "enquiry_source" varchar;`)
  await backfillLeadColumns(payload, req);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" DROP COLUMN "trip_duration";
  ALTER TABLE "leads" DROP COLUMN "travel_style";
  ALTER TABLE "leads" DROP COLUMN "enquiry_source";`)
}

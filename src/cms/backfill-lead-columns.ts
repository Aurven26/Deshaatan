import type {Payload, PayloadRequest} from 'payload';
import {leadColumns} from './lead-fields';

export async function backfillLeadColumns(payload: Payload, req?: PayloadRequest) {
  let page = 1;
  while (true) {
    const result = await payload.find({collection: 'leads', page, limit: 100, depth: 0, req});
    for (const doc of result.docs) {
      await payload.db.updateOne({collection: 'leads', id: doc.id, req, data: leadColumns(doc as unknown as Record<string, unknown>)});
    }
    if (!result.hasNextPage) break;
    page++;
  }
}

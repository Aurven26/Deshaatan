import type {Payload, PayloadRequest} from 'payload';
import {randomUUID} from 'node:crypto';

export async function backfillPolicies(payload: Payload, req?: PayloadRequest) {
  const result = await payload.find({collection: 'itineraries', pagination: false, depth: 0, req});
  for (const itinerary of result.docs) {
    const policies = itinerary.policies?.length ? itinerary.policies : [
      {title: 'Confirmation Policy', content: ''}, {title: 'Refund Policy', content: ''},
      {title: 'Cancellation Policy', content: ''},
      {title: 'Payment Terms Policy', content: '100.0% of total tour cost will have to be paid 0 days before the date of booking'},
    ].map(policy => ({...policy, id: randomUUID()}));
    // Fill the new fields without publishing or merging other editor draft changes.
    if (!itinerary.policies?.length) await payload.db.updateOne({collection: 'itineraries', id: itinerary.id, req, data: {policies}});
    const versions = await payload.findVersions({collection: 'itineraries', where: {parent: {equals: itinerary.id}}, sort: '-updatedAt', limit: 1, req});
    const latest = versions.docs[0];
    if (latest && !latest.version.policies?.length) {
      await payload.db.updateVersion({collection: 'itineraries', id: latest.id, req, versionData: {version: {policies}}});
    }
  }
}

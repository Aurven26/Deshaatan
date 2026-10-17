import type {Payload, PayloadRequest} from 'payload';
import {goldenTriangle, goldenTriangleFeaturedReview} from '../data/golden-triangle';

export async function seedSharedReviews(payload: Payload, req?: PayloadRequest) {
  const itinerary = await payload.find({collection: 'itineraries', where: {slug: {equals: goldenTriangle.slug}}, limit: 1, req});
  for (const [index, review] of [goldenTriangleFeaturedReview, ...goldenTriangle.reviews].entries()) {
    const legacyId = `shared-original-review-${index}`;
    const existing = await payload.find({collection: 'reviews', where: {legacyId: {equals: legacyId}}, limit: 1, req});
    if (existing.totalDocs) continue;
    await payload.create({collection: 'reviews', req, context: {skipRevalidation: true}, data: {
      legacyId, itinerary: itinerary.docs[0]?.id, shared: true, status: 'published',
      name: review.name, title: `Review by ${review.name}`, review: review.text,
      rating: review.rating, displayDate: review.date, displayOrder: index,
    }});
  }
}

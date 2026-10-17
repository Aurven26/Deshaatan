import type {Payload, PayloadRequest} from 'payload';
import path from 'node:path';
import {isTourDetail} from './tour';

/** Preserve the existing Golden Triangle content in the new editable fields. */
export async function backfillItineraryFields(payload: Payload, req?: PayloadRequest) {
  const result = await payload.find({collection: 'itineraries', where: {slug: {equals: 'golden-triangle-12-days'}}, limit: 1, req});
  const doc = result.docs[0];
  if (!doc || !isTourDetail(doc.detailData)) return;
  const links = ['Delhi', 'Pune', 'Chennai', 'Mumbai', 'Kolkata', 'Hyderabad', 'Banagalore', 'Chennai', 'Ahmedabad']
    .map(city => ({label: `Rajasthan Packages From ${city}`}));
  const gallery = doc.gallery?.length ? doc.gallery : [];
  if (!gallery.length) {
    for (const [filename, alt] of [
      ['2032-4185-imgRectangle4661.png', 'Taj Mahal gardens in Agra'],
      ['2032-4167-imgListItem.png', 'Humayun’s Tomb in New Delhi'],
    ]) {
      const existing = await payload.find({collection: 'media', where: {filename: {equals: filename}}, limit: 1, req});
      const image = existing.docs[0] || await payload.create({collection: 'media', data: {alt}, filePath: path.resolve('public/figma/itinerary', filename), req});
      gallery.push({image: image.id});
    }
  }
  await payload.update({collection: 'itineraries', id: doc.id, req, context: {skipRevalidation: true}, data: {
    _status: doc._status,
    schedule: doc.schedule || [],
    gallery,
    startCity: doc.startCity ?? 'New Delhi', endCity: doc.endCity ?? 'New Delhi',
    tourFAQs: doc.tourFAQs?.length ? doc.tourFAQs : doc.detailData.faqs.map(faq => ({question: faq.question, answer: faq.answer || 'Contact our travel expert for details.'})),
    attractionsTitle: doc.attractionsTitle ?? 'More Rajasthan Attractions',
    attractions: doc.attractions?.length ? doc.attractions : links,
    activitiesTitle: doc.activitiesTitle ?? 'More Things to do in Rajasthan',
    activities: doc.activities?.length ? doc.activities : links,
  }});
}

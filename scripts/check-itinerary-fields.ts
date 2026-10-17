import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../src/payload.config';
import {tourDetail, getPublishedReviews} from '../src/cms/tour';

const payload = await getPayload({config});
let fixtureID: number | undefined;
let reviewID: number | undefined;
try {
  const media = await payload.find({collection: 'media', limit: 2});
  const destinations = await payload.find({collection: 'destinations', limit: 1});
  assert.equal(media.docs.length, 2, 'Two media images are needed for the gallery check.');
  const doc = await payload.create({collection: 'itineraries', draft: true, context: {skipRevalidation: true}, data: {
    title: 'Itinerary fields verification', slug: `itinerary-fields-check-${Date.now()}`,
    destination: destinations.docs[0].id, days: 4, price: 4999,
    startCity: 'Shimla', endCity: 'Chandigarh',
    gallery: media.docs.map(image => ({image: image.id})),
    tourFAQs: [{question: 'What is included?', answer: 'See the confirmed package inclusions.'}],
    attractionsTitle: 'More Shimla Attractions', attractions: [{label: 'The Ridge', href: '/tour-packages'}],
    activitiesTitle: 'More Things to do in Shimla', activities: [{label: 'Explore Mall Road'}],
    policies: [{title: 'Confirmation Policy', content: 'Confirmation after availability is checked.'}],
    seo: {title: 'Itinerary SEO verification', description: 'CMS metadata verification.', keywords: 'Shimla, holiday', robots: 'noindex-nofollow', canonicalURL: 'https://example.com/verified-tour', hreflang: [{language: 'en-IN', url: 'https://example.com/en/tour'}]},
  }});
  fixtureID = doc.id;
  const saved = await payload.findByID({collection: 'itineraries', id: doc.id, draft: true, depth: 1});
  const tour = tourDetail(saved);
  assert.equal(tour.photos?.length, 2);
  assert.equal(tour.startCity, 'Shimla');
  assert.equal(tour.endCity, 'Chandigarh');
  assert.equal(tour.faqs[0].question, 'What is included?');
  assert.equal(tour.linkSections?.[0].links[0].href, '/tour-packages');
  assert.equal(tour.linkSections?.[1].links[0].label, 'Explore Mall Road');
  const publicResult = await payload.find({collection: 'itineraries', overrideAccess: false, where: {id: {equals: doc.id}}});
  assert.equal(publicResult.totalDocs, 0, 'Unpublished itineraries must stay private.');
  assert.equal(tour.policies?.[0].content, 'Confirmation after availability is checked.');
  assert.equal(saved.seo?.robots, 'noindex-nofollow');
  await payload.update({collection: 'itineraries', id: doc.id, data: {_status: 'published'}, context: {skipRevalidation: true}});
  const base = 'http://127.0.0.1:3000';
  const response = await fetch(`${base}/tours/${doc.slug}`);
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const text of ['Itinerary SEO verification', 'noindex, nofollow', 'https://example.com/verified-tour', 'https://example.com/en/tour', 'Confirmation after availability is checked.']) assert.ok(html.includes(text), `Missing rendered value: ${text}`);
  const form = new FormData();
  for (const [key, value] of Object.entries({tour: doc.slug, rating: '5', title: 'Verification review', review: 'This is an automated verification review for the local itinerary workflow.', name: 'Local verification reviewer', travelMonth: '2024-12', companion: 'Solo', consent: 'on', shared: 'true', status: 'published'})) form.set(key, value);
  const submission = await fetch(`${base}/api/reviews`, {method: 'POST', headers: {Origin: base}, body: form});
  const result = await submission.json();
  assert.equal(submission.status, 201, JSON.stringify(result));
  reviewID = result.id;
  const pending = await payload.findByID({collection: 'reviews', id: reviewID!});
  assert.equal(pending.status, 'pending');
  assert.equal(pending.shared, false);
  assert.ok(!(await getPublishedReviews(doc.id)).some(item => item.name === pending.name));
  await payload.update({collection: 'reviews', id: reviewID!, data: {status: 'published'}, context: {skipRevalidation: true}});
  assert.ok((await getPublishedReviews(doc.id)).some(item => item.name === pending.name));
  const other = await payload.find({collection: 'itineraries', where: {slug: {equals: 'himalayan'}}, limit: 1});
  assert.ok(!(await getPublishedReviews(other.docs[0].id)).some(item => item.name === pending.name));
  assert.ok((await getPublishedReviews(other.docs[0].id)).some(item => item.name === 'Paul G.'));
  await payload.update({collection: 'reviews', id: reviewID!, data: {status: 'rejected'}, context: {skipRevalidation: true}});
  assert.ok(!(await getPublishedReviews(doc.id)).some(item => item.name === pending.name));
  console.log('CMS fields, rendered policies and SEO, customer submission, moderation, review isolation, shared reviews and draft privacy passed.');
} finally {
  if (reviewID) await payload.delete({collection: 'reviews', id: reviewID, context: {skipRevalidation: true}});
  if (fixtureID) await payload.delete({collection: 'itineraries', id: fixtureID, context: {skipRevalidation: true}});
  await payload.destroy();
}
process.exit(0);

import {cache} from 'react';
import type {Tour} from '@/data/golden-triangle';
import type {Itinerary, Media} from '@/payload-types';
import {getCMS} from './client';

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');

/** JSON imported from the old layout remains editable, so validate it before rendering. */
export function isTourDetail(value: unknown): value is Tour {
  if (!record(value)) return false;
  return ['title', 'slug', 'price', 'overview'].every(key => typeof value[key] === 'string')
    && ['highlights', 'inclusions', 'exclusions', 'mobileInclusions', 'mobileExclusions'].every(key => strings(value[key]))
    && Array.isArray(value.days) && value.days.every(day => record(day) && typeof day.day === 'number' && typeof day.title === 'string' && (day.description === undefined || typeof day.description === 'string') && (day.mobileTitle === undefined || typeof day.mobileTitle === 'string'))
    && Array.isArray(value.faqs) && value.faqs.every(faq => record(faq) && typeof faq.question === 'string' && (faq.answer === undefined || typeof faq.answer === 'string'))
    && Array.isArray(value.reviews) && value.reviews.every(review => record(review) && typeof review.name === 'string' && typeof review.date === 'string' && typeof review.text === 'string' && Number.isInteger(review.rating) && Number(review.rating) >= 1 && Number(review.rating) <= 5);
}

export function tourDetail(doc: Itinerary): Tour {
  const legacy: Tour = isTourDetail(doc.detailData) ? doc.detailData : {
    title: doc.title, slug: doc.slug, price: '', overview: '', highlights: [],
    days: [], inclusions: [], exclusions: [], mobileInclusions: [], mobileExclusions: [],
    faqs: [], reviews: [],
  };
  const plainText=(node:unknown):string=>{
    if(!record(node))return '';
    if(typeof node.text==='string')return node.text;
    if(Array.isArray(node.children))return node.children.map(plainText).join(node.type==='root'?'\n':'');
    return node.root?plainText(node.root):'';
  };
  const imagePath = (image: number | Media | null | undefined) => image && typeof image === 'object' && image.filename
    ? `/cms-api/media/file/${encodeURIComponent(image.filename)}` : undefined;
  const gallery = (doc.gallery || []).flatMap(item => imagePath(item.image) || []);
  const cover = imagePath(doc.image);
  const photos = [...new Set([...(cover ? [cover] : []), ...gallery])];
  const destination = typeof doc.destination === 'object' ? doc.destination.title : '';
  return {
    ...legacy,sectionVisibility:doc.sectionVisibility || {}, title: doc.title, slug: doc.slug, price: doc.price.toLocaleString('en-IN'),duration:doc.days,
    ...(doc.slug === 'golden-triangle-12-days' ? {startEndCity: 'New Delhi'} : {}),
    startCity: doc.startCity ?? undefined, endCity: doc.endCity ?? undefined,
    faqs: doc.tourFAQs ?? legacy.faqs,
    policies: doc.policies ?? [
      {title: 'Confirmation Policy'}, {title: 'Refund Policy'}, {title: 'Cancellation Policy'},
      {title: 'Payment Terms Policy', content: '100.0% of total tour cost will have to be paid 0 days before the date of booking'},
    ],
    linkSections: [
      {title: doc.attractionsTitle || `More ${destination} Attractions`, links: doc.attractions || []},
      {title: doc.activitiesTitle || `More Things to do in ${destination}`, links: doc.activities || []},
    ],
    ...(!isTourDetail(doc.detailData) && doc.legacyImage ? {
      photos: [doc.legacyImage.startsWith('/') || /^https?:\/\//.test(doc.legacyImage)
        ? doc.legacyImage : `/figma/${doc.legacyImage}`],
    } : {}),
    ...(doc.image && typeof doc.image==='object' && doc.image.filename?{photos:[`/cms-api/media/file/${encodeURIComponent(doc.image.filename)}`]}:{}),
    ...(photos.length ? {photos} : {}),
    ...(doc.overview?{overview:plainText(doc.overview)}:{}),
    ...(doc.highlights?.length?{highlights:doc.highlights.map(item=>item.text)}:{}),
    ...(doc.schedule?.length?{days:doc.schedule.map(item=>({day:item.day,title:item.title,description:plainText(item.description)}))}:{}),
    ...(doc.inclusions?.length?{inclusions:doc.inclusions.map(item=>item.text),mobileInclusions:doc.inclusions.map(item=>item.text)}:{}),
    ...(doc.exclusions?.length?{exclusions:doc.exclusions.map(item=>item.text),mobileExclusions:doc.exclusions.map(item=>item.text)}:{}),
  };
}

export const getPublishedItinerary = cache(async (slug: string) => {
  const payload = await getCMS();
  const result = await payload.find({collection: 'itineraries', overrideAccess: false, where: {slug: {equals: slug}}, limit: 1});
  return result.docs[0] ?? null;
});

export const getPublishedReviews = cache(async (itinerary: number): Promise<Tour['reviews']> => {
  const payload=await getCMS();
  const result=await payload.find({collection:'reviews',overrideAccess:false,where:{and:[{status:{equals:'published'}},{or:[{shared:{equals:true}},{itinerary:{equals:itinerary}}]}]},depth:0,limit:100,sort:['displayOrder','-createdAt']});
  return result.docs.map(review=>({name:review.name,rating:review.rating,text:review.review,date:review.displayDate || review.createdAt.slice(0,10)}));
});

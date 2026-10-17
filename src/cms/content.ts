import {cache} from 'react';
import {getPayload} from 'payload';
import config from '@payload-config';
import type {TourPackage} from '@/data/tour-packages';
import type faq from '@/data/faq.json';
import type {SiteSetting} from '@/payload-types';
import {resolveHomePage,mediaURL,type HomePageContent} from './home-defaults';
import type {SectionVisibility} from './visibility-labels';

export type WebsiteContent={visibility:SectionVisibility;homePage:HomePageContent;homeSelection:{popular:string[];religious:string[];guides:string[];testimonials:string[]};tourPackages:TourPackage[];guides:string[];guideDetails:{title:string;summary:string;image:string|null}[];faq:typeof faq;testimonials:{name:string;role:string;text:string;avatar:string;rating:number}[];settings:SiteSetting;navigation:[string,string][]};
export const getWebsiteContent=cache(async():Promise<WebsiteContent>=>{
  const payload=await getPayload({config});
  const [itineraries,guides,questions,testimonials,settings,navigation,home,visibility]=await Promise.all([
    payload.find({collection:'itineraries',overrideAccess:false,depth:1,limit:100,sort:'createdAt'}),
    payload.find({collection:'guides',overrideAccess:false,depth:1,limit:100,sort:'createdAt'}),
    payload.find({collection:'faqs',overrideAccess:false,depth:0,limit:500,sort:'order'}),
    payload.find({collection:'testimonials',overrideAccess:false,depth:1,limit:50,sort:'order'}),
    payload.findGlobal({slug:'site-settings',overrideAccess:false,depth:0}),
    payload.findGlobal({slug:'navigation',overrideAccess:false,depth:0}),
    payload.findGlobal({slug:'home-page',overrideAccess:false,depth:1}),
    payload.findGlobal({slug:'section-visibility',overrideAccess:false,depth:0}),
  ]);
  const categories=new Map<string,typeof faq[number]>();
  for(const item of questions.docs){
    if(!categories.has(item.category))categories.set(item.category,{id:item.category,title:item.categoryTitle,chip:item.categoryChip,items:[]});
    categories.get(item.category)!.items.push({question:item.question,answer:item.answer});
  }
  return {
    visibility,homePage:resolveHomePage(home),homeSelection:{popular:(home.popular?.items||[]).flatMap(item=>{const doc=itineraries.docs.find(doc=>doc.id===(typeof item==='object'?item.id:item));return doc?[doc.slug]:[];}),religious:(home.religious?.items||[]).flatMap(item=>{const doc=itineraries.docs.find(doc=>doc.id===(typeof item==='object'?item.id:item));return doc?[doc.slug]:[];}),guides:(home.guides?.items||[]).flatMap(item=>{const doc=guides.docs.find(doc=>doc.id===(typeof item==='object'?item.id:item));return doc?[doc.title]:[];}),testimonials:(home.testimonials?.items||[]).flatMap(item=>{const doc=testimonials.docs.find(doc=>doc.id===(typeof item==='object'?item.id:item));return doc?[doc.name]:[];})},
    tourPackages:itineraries.docs.map(trip=>({id:trip.slug,title:trip.title,days:trip.days,price:trip.price,previousPrice:trip.previousPrice ?? trip.price,destination:trip.destination && typeof trip.destination==='object'?trip.destination.title:'',types:(trip.categories || []).flatMap(category=>category && typeof category==='object'?[category.title]:[]),image:mediaURL(trip.thumbnail) || (typeof trip.image==='object' && trip.image?.filename?`/cms-api/media/file/${encodeURIComponent(trip.image.filename)}`:trip.legacyImage || ''),href:`/tours/${trip.slug}`})),
    guides:guides.docs.map(guide=>guide.title),guideDetails:guides.docs.map(guide=>({title:guide.title,summary:guide.summary || '',image:typeof guide.image==='object' && guide.image?.filename ? `/cms-api/media/file/${encodeURIComponent(guide.image.filename)}` : ({Kerala:'/figma/imgImageMunnar.png',Rajasthan:'/figma/imgImageMunnar1.png',Kashmir:'/figma/imgImageMunnar2.png'} as Record<string,string>)[guide.title] || null})),faq:[...categories.values()].sort((a,b)=>a.id.localeCompare(b.id)),
    testimonials:testimonials.docs.map(item=>({name:item.name,role:item.designation,text:item.text,avatar:mediaURL(item.avatar),rating:item.rating??5})),settings,navigation:(navigation.links || []).map(link=>[link.label,link.href]),
  };
});

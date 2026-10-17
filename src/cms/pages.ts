import {cache} from 'react';
import type {Metadata} from 'next';
import {getCMS} from './client';
import {mediaURL} from './home-defaults';
import {getCachedCMS} from '@/lib/remote-cache';
export const getPublishedPage=cache(async(slug:string)=>{
  return getCachedCMS(`page:${slug}`,60,async()=>{
    const payload=await getCMS();
    const result=await payload.find({collection:'pages',overrideAccess:false,where:{slug:{equals:slug}},limit:1,depth:1});
    return result.docs[0]||null;
  });
});
export async function pageMetadata(slug:string):Promise<Metadata>{
  const doc=await getPublishedPage(slug);
  if(!doc)return {};
  const seo=doc.seo;
  const image=mediaURL(seo?.image);
  const robots=seo?.robots||(seo?.noIndex?'noindex-follow':'index-follow');
  return {metadataBase:new URL(process.env.NEXT_PUBLIC_SERVER_URL||'http://127.0.0.1:3000'),title:seo?.title||`${doc.title} | Deshaatan`,description:seo?.description||undefined,keywords:seo?.keywords?.split(',').map(word=>word.trim()).filter(Boolean),robots:{index:robots.startsWith('index-'),follow:robots.endsWith('-follow')},alternates:{canonical:seo?.canonicalURL||`/${doc.slug}`,languages:Object.fromEntries((seo?.hreflang||[]).map(item=>[item.language,item.url]))},...(image?{openGraph:{images:[image]}}:{})};
}

import path from 'node:path';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import type {Payload, PayloadRequest} from 'payload';
import {homeDefaults} from './home-defaults';

/** Idempotent import: fill missing uploads, never replace an editor's image. */
export async function importHomepage(payload:Payload,req?:PayloadRequest) {
  const context={skipRevalidation:true};
  const cache=new Map<string,number>();
  async function upload(source:string,alt:string) {
    if(cache.has(source))return cache.get(source)!;
    const found=await payload.find({collection:'media',where:{credit:{equals:`Original website: ${source}`}},limit:1,req});
    if(found.docs[0]){cache.set(source,found.docs[0].id);return found.docs[0].id;}
    const filename=path.resolve('public',source.replace(/^\//,''));
    const svg=source.endsWith('.svg');
    const data=svg?await sharp(await readFile(filename),{density:192}).png().toBuffer():await readFile(filename);
    const name=source.replace(/^\/figma\//,'').replace(/\//g,'-').replace(/\.svg$/,'.png');
    const doc=await payload.create({collection:'media',req,context,data:{alt:alt.slice(0,200),credit:`Original website: ${source}`},file:{data,name,mimetype:svg||source.endsWith('.png')?'image/png':'image/jpeg',size:data.length}});
    cache.set(source,doc.id);return doc.id;
  }
  async function images(value:unknown,key=''):Promise<unknown> {
    if(key==='favicon' && value==='')return null;
    if(typeof value==='string' && value.startsWith('/figma/') && /\.(png|svg|jpe?g|webp)$/.test(value))return upload(value,key);
    if(Array.isArray(value))return Promise.all(value.map(item=>images(item,key)));
    if(value && typeof value==='object'){
      const result:Record<string,unknown>={};
      for(const [name,item] of Object.entries(value))result[name]=await images(item,typeof (value as {title?:unknown}).title==='string'?(value as {title:string}).title:name);
      return result;
    }
    return value;
  }
  const home=await payload.findGlobal({slug:'home-page',req,depth:0});
  const itineraries=await payload.find({collection:'itineraries',limit:1000,depth:0,req});
  for(const doc of itineraries.docs){
    if(!doc.legacyImage)continue;
    const source=doc.legacyImage.startsWith('/')?doc.legacyImage:`/figma/packages/${doc.legacyImage}`;
    if(!source.startsWith('/figma/'))continue;
    const image=typeof doc.image==="number"?doc.image:await upload(source,doc.title);
    if(!doc.image)await payload.db.updateOne({collection:'itineraries',id:doc.id,data:{image},req});
    const versions=await payload.findVersions({collection:'itineraries',where:{parent:{equals:doc.id}},sort:'-updatedAt',limit:1,req});
    if(versions.docs[0] && !versions.docs[0].version.image)await payload.db.updateVersion({collection:'itineraries',id:versions.docs[0].id,versionData:{version:{image}},req});
  }
  const guides=await payload.find({collection:'guides',limit:1000,depth:0,req});
  const originalGuides:Record<string,string>={Kerala:'imgImageMunnar.png',Rajasthan:'imgImageMunnar1.png',Kashmir:'imgImageMunnar2.png'};
  for(const doc of guides.docs){
    if(!originalGuides[doc.title])continue;
    const image=typeof doc.image==="number"?doc.image:await upload(`/figma/${originalGuides[doc.title]}`,`${doc.title} travel guide`);
    if(!doc.image)await payload.db.updateOne({collection:'guides',id:doc.id,data:{image},req});
    const versions=await payload.findVersions({collection:'guides',where:{parent:{equals:doc.id}},sort:'-updatedAt',limit:1,req});
    if(versions.docs[0] && !versions.docs[0].version.image)await payload.db.updateVersion({collection:'guides',id:versions.docs[0].id,versionData:{version:{image}},req});
  }
  const testimonials=await payload.find({collection:'testimonials',limit:1000,depth:0,req});
  for(const doc of testimonials.docs){
    const avatar=typeof doc.avatar==='number'?doc.avatar:await upload('/figma/imgImage.png','Traveller testimonial portrait');
    if(!doc.avatar)await payload.db.updateOne({collection:'testimonials',id:doc.id,data:{avatar},req});
    const versions=await payload.findVersions({collection:'testimonials',where:{parent:{equals:doc.id}},sort:'-updatedAt',limit:1,req});
    if(versions.docs[0] && !versions.docs[0].version.avatar)await payload.db.updateVersion({collection:'testimonials',id:versions.docs[0].id,versionData:{version:{avatar}},req});
  }
  if(!home.updatedAt){
    const data=await images(homeDefaults) as Record<string,unknown>;
    await payload.updateGlobal({slug:'home-page',req,context,data:{...data,
      popular:{...data.popular as object,items:itineraries.docs.map(doc=>doc.id)},
      guides:{...data.guides as object,items:guides.docs.map(doc=>doc.id)},
      religious:{...data.religious as object,items:itineraries.docs.filter(doc=>doc.religious || ['char-dham','golden-triangle'].includes(doc.slug)).map(doc=>doc.id)},
      testimonials:{...data.testimonials as object,items:testimonials.docs.map(doc=>doc.id)},
      seo:{title:'Deshaatan — Explore India',description:'Discover India with Deshaatan. Explore destinations, curated holiday packages, and a custom itinerary for your next adventure.'}}});
  }
}

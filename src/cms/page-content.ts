import type {Page} from '@/payload-types';
import type {Payload,PayloadRequest} from 'payload';
import {randomUUID} from 'node:crypto';

type Inline={text:string;bold?:boolean};
type LegacyBlock={type:string;space?:number;content?:Inline[];items?:Inline[][];rows?:Inline[][][]};
const plain=(parts:Inline[]=[])=>parts.map(part=>part.text).join('');
const rich=(parts:Inline[]=[]):NonNullable<Page['content']>=>({root:{type:'root',format:'',indent:0,version:1,direction:null,children:[{type:'paragraph',format:'',indent:0,version:1,direction:null,children:parts.map(part=>({type:'text',text:part.text,format:part.bold?1:0,detail:0,mode:'normal',style:'',version:1}))}]}});
export function legacyPageSections(value:unknown):NonNullable<Page['sections']>{
  if(!Array.isArray(value))return [];
  return (value as LegacyBlock[]).map(block=>{
    const base={id:randomUUID(),space:block.space??20};
    if(['h1','h2','h3'].includes(block.type))return {...base,blockType:'heading' as const,text:plain(block.content),level:block.type as 'h1'|'h2'|'h3'};
    if(block.type==='separator')return {...base,blockType:'divider' as const};
    if(block.type==='list')return {...base,blockType:'list' as const,items:(block.items||[]).map(parts=>({id:randomUUID(),body:rich(parts)}))};
    if(block.type==='table')return {...base,blockType:'table' as const,rows:(block.rows||[]).map(cells=>({id:randomUUID(),cells:cells.map(parts=>({id:randomUUID(),body:rich(parts)}))}))};
    if(block.type==='cta')return {...base,blockType:'cta' as const,label:plain(block.content),href:'/contact-us'};
    return {...base,blockType:'text' as const,body:rich(block.content),style: (['updated','tagline'].includes(block.type)?block.type:'paragraph') as 'updated'|'tagline'|'paragraph'};
  });
}
export async function backfillPageSections(payload:Payload,req?:PayloadRequest){
  const result=await payload.find({collection:'pages',pagination:false,depth:0,req});
  for(const page of result.docs){
    if(!page.sections?.length && Array.isArray(page.layoutBlocks))await payload.db.updateOne({collection:'pages',id:page.id,req,data:{sections:legacyPageSections(page.layoutBlocks)}});
    const versions=await payload.findVersions({collection:'pages',where:{parent:{equals:page.id}},sort:'-updatedAt',limit:1,depth:0,req});
    const latest=versions.docs[0];
    if(latest && !latest.version.sections?.length && Array.isArray(latest.version.layoutBlocks))await payload.db.updateVersion({collection:'pages',id:latest.id,req,versionData:{version:{sections:legacyPageSections(latest.version.layoutBlocks)}}});
  }
}

import type {Field, PayloadRequest, CollectionBeforeValidateHook, CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook} from 'payload';
import {revalidatePath} from 'next/cache';

export const slug:Field={name:'slug',type:'text',required:true,unique:true,index:true,validate:(value:string|null|undefined)=>!!value && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Use lowercase words separated by hyphens.'};
export const slugHook:CollectionBeforeValidateHook=({data,operation})=>{
  if(data && operation==='create' && !data.slug && typeof data.title==='string')data.slug=data.title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return data;
};
export const seo:Field={name:'seo',type:'group',fields:[{name:'title',type:'text',maxLength:70},{name:'description',type:'textarea',maxLength:170},{name:'image',type:'upload',relationTo:'media'},{name:'noIndex',type:'checkbox',defaultValue:false}]};
function invalidate(req:PayloadRequest){
  if(!req.context.skipRevalidation){try{revalidatePath('/','layout');}catch{req.payload.logger.info('Content saved outside a Next request; cache expires on its configured interval.');}}
}
export const revalidateContent:CollectionAfterChangeHook=({doc,req})=>{invalidate(req);return doc;};
export const revalidateDeletedContent:CollectionAfterDeleteHook=({doc,req})=>{invalidate(req);return doc;};
export const revalidateGlobal:GlobalAfterChangeHook=({doc,req})=>{invalidate(req);return doc;};

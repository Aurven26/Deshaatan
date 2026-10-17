import {saveLead} from '@/cms/client';
import {requestGuard} from '@/cms/request-security';
import {readRequestText} from '@/cms/request-body';
import {requestInteger} from '@/cms/request-validation';

import {observePublicRoute} from '@/cms/secured-route';
export const POST = observePublicRoute(handlePOST);
async function handlePOST(request: Request) {
  const rejection=await requestGuard(request,'callback');if(rejection)return rejection;
  const raw=await readRequestText(request,8192);
  if(raw instanceof Response)return raw;
  let input:Record<string,unknown>;
  try{const parsed:unknown=JSON.parse(raw);if(!parsed || typeof parsed!=='object' || Array.isArray(parsed))throw new Error();input=parsed as Record<string,unknown>;}catch{return Response.json({error:'Please provide valid details.'},{status:400});}
  const text=(key:string)=>typeof input[key]==='string'?String(input[key]).trim():'';
  const name=text('name'),phone=text('phone'),title=text('title'),adults=requestInteger(input.adults),children=requestInteger(input.children);
  if(['country','date','duration','origin','destination','style'].some(key=>input[key]!==undefined && (typeof input[key]!=='string' || text(key).length>200)))return Response.json({error:'Please provide valid trip details.'},{status:400});
  if(phone.replace(/\D/g,'').length<7 || (text('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('email'))))return Response.json({error:'Please enter a valid phone number and email address.'},{status:400});
  if(!name || name.length>100 || !/^[0-9 ()-]{7,20}$/.test(phone) || !title || title.length>200 || !Number.isInteger(adults) || adults<1 || !Number.isInteger(children) || children<0 || adults+children>99 || text('message').length>3000 || text('email').length>254)return Response.json({error:'Please complete your name, phone number and traveller details.'},{status:400});
  try{const lead=await saveLead('callback',{name,phone,email:text('email') || undefined,title,adults,children,country:text('country'),date:text('date'),message:text('message'),duration:text('duration'),origin:text('origin'),destination:text('destination'),style:text('style')});return Response.json({success:true,id:lead.id},{status:201});}
  catch{return Response.json({error:'We couldn’t save your enquiry. Please try again.'},{status:503});}
}

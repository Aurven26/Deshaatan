import {randomUUID} from "node:crypto";
import {getCMS,saveLead} from '@/cms/client';
import {requestGuard} from '@/cms/request-security';
import {ValidationError} from 'payload';
import {requestInteger} from '@/cms/request-validation';

export const runtime="nodejs";
const limit=2*1024*1024;

import {observePublicRoute} from '@/cms/secured-route';
export const POST = observePublicRoute(handlePOST);
async function handlePOST(request: Request) {
  const rejection=await requestGuard(request,'contact',5);if(rejection)return rejection;
  if(!request.headers.get("content-type")?.startsWith("multipart/form-data"))return Response.json({error:"Please submit the contact form."},{status:400});
  const reader=request.body?.getReader();
  if(!reader)return Response.json({error:"Please complete the form."},{status:400});
  let data:FormData;
  try {
    const chunks:Uint8Array[]=[];
    let size=0;
    while(true){
      const part=await reader.read();
      if(part.done)break;
      size+=part.value.length;
      if(size>limit+32768){await reader.cancel();return Response.json({error:"Please upload a PDF resume smaller than 2 MB."},{status:413});}
      chunks.push(part.value);
    }
    data=await new Response(new Uint8Array(Buffer.concat(chunks)),{headers:{"content-type":request.headers.get("content-type")!}}).formData();
  } catch{return Response.json({error:"Please provide valid form details."},{status:400});}
  const text=(key:string,max:number,required=true)=>{
    const value=data.get(key);
    const result=typeof value==="string"?value.trim():"";
    return result.length<=max && (!required || result.length>0)?result:null;
  };
  const type=text("type",20),name=text("name",100),email=text("email",254),phone=text("phone",25);
  if(!type || !["partner","application","corporate"].includes(type) || !name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !/^[+0-9 ()-]{7,25}$/.test(phone) || phone.replace(/\D/g,"").length<7)return Response.json({error:"Please enter a valid name, email and phone number."},{status:400});
  const details:Record<string,unknown>={type,name,email,phone};
  let resume:Uint8Array|undefined;
  if(type==="application"){
    const position=text("position",100),file=data.get("resume");
    if(!position || !(file instanceof File) || !file.size || file.size>limit || !file.name.toLowerCase().endsWith(".pdf") || file.type!=="application/pdf")return Response.json({error:"Please enter the position and upload a PDF resume up to 2 MB."},{status:400});
    resume=new Uint8Array(await file.arrayBuffer());
    if(Buffer.from(resume.subarray(0,5)).toString()!=="%PDF-")return Response.json({error:"Please upload a valid PDF resume."},{status:400});
    details.position=position;
  } else {
    const company=text("company",150);
    if(!company)return Response.json({error:"Please enter your company or business name."},{status:400});
    details.company=company;
    if(type==="partner"){
      const businessType=text("businessType",100),location=text("location",150),message=text("message",3000),website=text("website",300,false);
      if(!businessType || !["Travel agency","Hotel / accommodation","Transport provider","Tour operator","Individual","Other"].includes(businessType) || !location || !message || website===null)return Response.json({error:"Please complete your business and partnership details."},{status:400});
      if(website){try{if(!["http:","https:"].includes(new URL(website).protocol))throw new Error();}catch{return Response.json({error:"Please enter a valid website URL."},{status:400});}}
      Object.assign(details,{businessType,location,message,website});
    } else {
      const adults=requestInteger(data.get("adults")),children=requestInteger(data.get("children")),travellers=requestInteger(data.get("travellers"));
      if(!Number.isInteger(adults) || adults<1 || !Number.isInteger(children) || children<0 || !Number.isInteger(travellers) || travellers>99 || travellers!==adults+children)return Response.json({error:"Please enter a valid traveller count."},{status:400});
      Object.assign(details,{adults,children,travellers});
    }
  }
  if(process.env.VERCEL && resume && !process.env.PRIVATE_BLOB_READ_WRITE_TOKEN)return Response.json({error:"Resume uploads are not configured yet. Please contact care@deshaatan.com."},{status:503});
  try {
    if(type==='application' && resume){
      const payload=await getCMS();
      const file=await payload.create({collection:'private-files',overrideAccess:true,data:{purpose:'resume'},file:{data:Buffer.from(resume),name:`${randomUUID()}.pdf`,mimetype:'application/pdf',size:resume.byteLength}});
      try {
        const application=await payload.create({collection:'applications',overrideAccess:true,data:{name,email,phone,position:String(details.position),resume:file.id}});
        return Response.json({success:true,id:application.id},{status:201});
      } catch(error) {
        await payload.delete({collection:'private-files',id:file.id,overrideAccess:true}).catch(()=>payload.logger.error('Failed to clean up an unlinked application upload.'));
        throw error;
      }
    }
    const lead=await saveLead(type==='corporate'?'corporate':'partner',{...details,name,email,phone});
    return Response.json({success:true,id:lead.id},{status:201});
  } catch(error){
    if(error instanceof ValidationError)return Response.json({error:'Please check your application details and upload a valid PDF.'},{status:400});
    const payload=await getCMS();
    payload.logger.error({msg:'Contact request persistence failed',timestamp:new Date().toISOString(),route:'/api/contact-requests'});
    return Response.json({error:"We couldn’t save your details. Please try again or contact care@deshaatan.com."},{status:503});
  }
}

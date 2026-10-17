import { randomUUID } from "node:crypto";
import {getCMS} from '@/cms/client';
import {requestGuard} from '@/cms/request-security';
import {APIError,ValidationError} from 'payload';
import {MAX_REVIEW_PHOTO_BYTES, MAX_REVIEW_PHOTOS} from '@/lib/upload-limits';

export const runtime="nodejs";
import {observePublicRoute} from '@/cms/secured-route';
export const POST = observePublicRoute(handlePOST);
async function handlePOST(request: Request) {
  const rejection=await requestGuard(request,'reviews',5);if(rejection)return rejection;
  const limit=MAX_REVIEW_PHOTO_BYTES+32768;
  const reader=request.body?.getReader();
  if(!reader)return Response.json({error:"Please provide review details."},{status:400});
  let data:FormData;
  try{
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();return Response.json({error:"The photos are too large."},{status:413});}chunks.push(value);}
    const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
    data=await new Response(body,{headers:{"Content-Type":request.headers.get("content-type")||""}}).formData();
  }catch{return Response.json({error:"Please provide valid review details."},{status:400});}
  const text=(key:string)=>typeof data.get(key)==="string"?String(data.get(key)).trim():"";
  const rating=Number(text("rating"));
  const details={tour:text("tour"),rating,title:text("title"),review:text("review"),name:text("name"),bookingId:text("bookingId"),travelMonth:text("travelMonth"),companion:text("companion")};
  const month=new Date(`${details.travelMonth}-01T00:00:00Z`);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(details.tour)||details.tour.length>200||!Number.isInteger(rating)||rating<1||rating>5||!details.title||details.title.length>150||details.review.length<50||details.review.length>1000||!details.name||details.name.length>100||details.bookingId.length>50||!/^\d{4}-(0[1-9]|1[0-2])$/.test(details.travelMonth)||!Number.isFinite(month.getTime())||month>new Date()||!["Family","Couple","Friends","Solo","Business"].includes(details.companion)||text("consent")!=="on")return Response.json({error:"Please complete every required field and confirm this is your own experience."},{status:400});
  const photos=data.getAll("photos");
  if(photos.length>MAX_REVIEW_PHOTOS||photos.some(photo=>!(photo instanceof File)||!["image/jpeg","image/png"].includes(photo.type)||!photo.size||!(photo.type==='image/png'?/\.png$/i:/\.jpe?g$/i).test(photo.name))||photos.reduce((total,photo)=>total+(photo instanceof File?photo.size:0),0)>MAX_REVIEW_PHOTO_BYTES)return Response.json({error:"Add up to 6 JPG or PNG photos, with a combined size of 3 MB or less."},{status:400});
  if(process.env.VERCEL && photos.length && !process.env.PRIVATE_BLOB_READ_WRITE_TOKEN)return Response.json({error:"Photo uploads are not configured yet. Please submit your review without photos."},{status:503});
  const fileIds:number[]=[];
  try{
    const files=await Promise.all((photos as File[]).map(async(file,index)=>{const bytes=Buffer.from(await file.arrayBuffer());const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;if((file.type==="image/png"&&!png)||(file.type==="image/jpeg"&&!jpeg))throw new Error("Invalid photo");return {name:`photo-${index+1}.${png?"png":"jpg"}`,bytes};}));
    const payload=await getCMS();
    const itinerary=await payload.find({collection:'itineraries',overrideAccess:false,where:{slug:{equals:details.tour}},limit:1});
    if(!itinerary.docs[0])return Response.json({error:"This itinerary is not available."},{status:400});
    for(const file of files){const upload=await payload.create({collection:'private-files',overrideAccess:true,data:{purpose:'review-photo'},file:{name:`${randomUUID()}-${file.name}`,data:file.bytes,mimetype:file.name.endsWith('.png')?'image/png':'image/jpeg',size:file.bytes.length}});fileIds.push(upload.id);}
    const review=await payload.create({collection:'reviews',overrideAccess:true,data:{...details,itinerary:itinerary.docs[0].id,companion:details.companion as 'Family'|'Couple'|'Friends'|'Solo'|'Business',photos:fileIds,status:'pending',verified:false}});
    return Response.json({id:review.id,success:true},{status:201});
   }catch(error){
    if(fileIds.length){
      const payload=await getCMS();
      for(const id of fileIds)await payload.delete({collection:'private-files',id,overrideAccess:true}).catch(()=>payload.logger.error('Failed to clean up an unlinked review upload.'));
    }
    const invalid=error instanceof ValidationError || error instanceof APIError && error.status===400 || error instanceof Error && error.message==='Invalid photo';
    return Response.json({error:invalid?'Please upload valid JPG or PNG photos.':'We couldn’t save your review. Please try again.'},{status:invalid?400:503});
  }
}

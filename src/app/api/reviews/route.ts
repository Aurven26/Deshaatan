import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const runtime="nodejs";
export async function POST(request:Request){
  const origin=request.headers.get("origin");
  const host=request.headers.get("host")||new URL(request.url).host;
  if(origin){try{const source=new URL(origin);if(!["http:","https:"].includes(source.protocol)||source.host!==host)return Response.json({error:"This request is not permitted."},{status:403});}catch{return Response.json({error:"This request is not permitted."},{status:403});}}
  const limit=32*1024*1024;
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
  if(details.tour!=="golden-triangle-12-days"||!Number.isInteger(rating)||rating<1||rating>5||!details.title||details.title.length>150||details.review.length<50||details.review.length>1000||!details.name||details.name.length>100||details.bookingId.length>50||!/^\d{4}-(0[1-9]|1[0-2])$/.test(details.travelMonth)||!Number.isFinite(month.getTime())||month>new Date()||!["Family","Couple","Friends","Solo","Business"].includes(details.companion)||text("consent")!=="on")return Response.json({error:"Please complete every required field and confirm this is your own experience."},{status:400});
  const photos=data.getAll("photos");
  if(photos.length>6||photos.some(photo=>!(photo instanceof File)||!["image/jpeg","image/png"].includes(photo.type)||photo.size>5*1024*1024||!photo.size))return Response.json({error:"Add up to 6 JPG or PNG photos, up to 5 MB each."},{status:400});
  const id=randomUUID();const directory=path.join(process.env.REVIEWS_DIR||path.join(process.cwd(),".data","reviews"),id);
  try{
    const files=await Promise.all((photos as File[]).map(async(file,index)=>{const bytes=Buffer.from(await file.arrayBuffer());const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;if((file.type==="image/png"&&!png)||(file.type==="image/jpeg"&&!jpeg))throw new Error("Invalid photo");return {name:`photo-${index+1}.${png?"png":"jpg"}`,bytes};}));
    await mkdir(directory,{recursive:true,mode:0o700});
    for(const file of files)await writeFile(path.join(directory,file.name),file.bytes,{flag:"wx",mode:0o600});
    await writeFile(path.join(directory,"review.json"),JSON.stringify({id,submittedAt:new Date().toISOString(),status:"pending",verified:false,...details,photos:files.map(file=>file.name)}),{flag:"wx",mode:0o600});
  }catch{return Response.json({error:"We couldn’t save your review. Please check your photos and try again."},{status:503});}
  return Response.json({id,success:true},{status:201});
}

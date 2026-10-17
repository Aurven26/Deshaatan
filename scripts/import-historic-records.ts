import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {getPayload} from 'payload';
import config from '../src/payload.config';

const payload=await getPayload({config});
let imported=0;
for(const [folder,kind] of [['itinerary-requests','itinerary'],['airport-transfer-requests','airport-transfer'],['car-rental-requests','car-rental']] as const){
  const directory=path.join(process.cwd(),'.data',folder);
  let files:string[]=[];
  try{files=await readdir(directory);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
  for(const filename of files.filter(name=>name.endsWith('.json'))){
    const legacyId=`${folder}:${filename}`;
    if((await payload.count({collection:'leads',where:{legacyId:{equals:legacyId}}})).totalDocs)continue;
    const input:unknown=JSON.parse(await readFile(path.join(directory,filename),'utf8'));
    if(!input || typeof input!=='object' || Array.isArray(input))throw new Error('Invalid historic request.');
    const details=input as Record<string,unknown>;
    if(typeof details.name!=='string' || typeof details.phone!=='string')throw new Error('Historic request is missing its contact fields.');
    await payload.create({collection:'leads',overrideAccess:true,data:{legacyId,kind,name:details.name,phone:details.phone,details,adults:Number(details.adults || 1),children:Number(details.children || 0),status:'new'}});
    imported++;
  }
}
const reviewsDirectory=path.join(process.cwd(),'.data','reviews');
let folders:string[]=[];
try{folders=await readdir(reviewsDirectory);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
for(const folder of folders){
  let input:unknown;
  try{input=JSON.parse(await readFile(path.join(reviewsDirectory,folder,'review.json'),'utf8'));}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')continue;throw error;}
  if(!input || typeof input!=='object' || Array.isArray(input))throw new Error('Invalid historic review.');
  const details=input as Record<string,unknown>,legacyId=`reviews:${folder}`;
  if((await payload.count({collection:'reviews',where:{legacyId:{equals:legacyId}}})).totalDocs)continue;
  const itinerary=await payload.find({collection:'itineraries',where:{slug:{equals:details.tour}},limit:1});
  if(!itinerary.docs[0])throw new Error('Historic review itinerary was not imported.');
  const photos:number[]=[];
  for(const filename of Array.isArray(details.photos)?details.photos:[]){
    if(typeof filename!=='string' || path.basename(filename)!==filename)throw new Error('Invalid historic photo filename.');
    const buffer=await readFile(path.join(reviewsDirectory,folder,filename));
    const upload=await payload.create({collection:'private-files',overrideAccess:true,data:{purpose:'review-photo'},file:{name:`historic-${folder}-${filename}`,data:buffer,mimetype:filename.endsWith('.png')?'image/png':'image/jpeg',size:buffer.length}});
    photos.push(upload.id);
  }
  await payload.create({collection:'reviews',overrideAccess:true,data:{legacyId,itinerary:itinerary.docs[0].id,name:String(details.name),title:String(details.title),review:String(details.review),rating:Number(details.rating),bookingId:String(details.bookingId || ''),travelMonth:String(details.travelMonth),companion:String(details.companion) as 'Family'|'Couple'|'Friends'|'Solo'|'Business',photos,status:'pending',verified:false}});
  imported++;
}
console.log(`Imported ${imported} historic records. Original files are preserved.`);
await payload.destroy();
process.exit(0);

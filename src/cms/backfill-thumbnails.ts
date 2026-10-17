import type {Payload,PayloadRequest} from 'payload';
export async function backfillThumbnails(payload:Payload,req?:PayloadRequest){
  const result=await payload.find({collection:'itineraries',pagination:false,depth:0,req});
  for(const doc of result.docs){
    if(!doc.thumbnail && doc.image)await payload.db.updateOne({collection:'itineraries',id:doc.id,data:{thumbnail:doc.image},req});
    const versions=await payload.findVersions({collection:'itineraries',where:{parent:{equals:doc.id}},sort:'-updatedAt',depth:0,limit:1,req});
    const latest=versions.docs[0];
    const thumbnail=latest?.version.image||doc.image;
    if(latest && !latest.version.thumbnail && thumbnail)await payload.db.updateVersion({collection:'itineraries',id:latest.id,versionData:{version:{thumbnail}},req});
  }
}

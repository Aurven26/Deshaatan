import {getPayload} from 'payload';
import config from '@payload-config';

export const getCMS=()=>getPayload({config});
export async function saveLead(kind:'itinerary'|'callback'|'corporate'|'partner'|'airport-transfer'|'car-rental',details:{name:string;phone:string;email?:string;adults?:number;children?:number;[key:string]:unknown}){
  const payload=await getCMS();
  return payload.create({collection:'leads',overrideAccess:true,data:{kind,name:details.name,phone:details.phone,email:details.email,adults:details.adults,children:details.children,details,status:'new'}});
}

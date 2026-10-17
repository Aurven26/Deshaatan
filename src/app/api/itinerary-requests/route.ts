import {saveLead} from '@/cms/client';
import {requestGuard} from '@/cms/request-security';
import {readRequestText} from '@/cms/request-body';
import {requestInteger} from '@/cms/request-validation';

export const runtime = "nodejs";

const durations = ["3 nights / 4 days", "4 nights / 5 days", "5 nights or more"];
const styles = ["Adventure", "Beach", "Family", "Honeymoon", "Luxury", "Cars", "Solo"];

import {observePublicRoute} from '@/cms/secured-route';
export const POST = observePublicRoute(handlePOST);
async function handlePOST(request: Request) {
  const rejection=await requestGuard(request,'itinerary');if(rejection)return rejection;
  const body = await readRequestText(request,8192);
  if (body instanceof Response) return body;
  let input: Record<string, unknown>;
  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    input = parsed;
  } catch { return Response.json({error:"Please provide valid request details."}, {status:400}); }
  const text = (key: string) => typeof input[key] === "string" ? input[key].trim() : "";
  const travellers = requestInteger(input.travellers);
  const adults = input.adults === undefined ? travellers : requestInteger(input.adults);
  const children = input.children === undefined ? 0 : requestInteger(input.children);
  const details = {name:text("name"), phone:text("phone"), origin:text("origin"), destination:text("destination"), duration:text("duration"), style:text("style"), travellers, adults, children};
  if (![details.name, details.origin, details.destination].every(value => value.length > 0 && value.length <= 100) || !/^[0-9]{10}$/.test(details.phone) || !durations.includes(details.duration) || !styles.includes(details.style) || !Number.isInteger(travellers) || travellers < 1 || travellers > 99 || !Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0 || adults + children !== travellers) {
    return Response.json({error:"Please complete every field with valid travel details."}, {status:400});
  }
  try {
    const lead=await saveLead('itinerary',details);
    return Response.json({id:lead.id,success:true},{status:201});
  } catch {
    return Response.json({error:"We couldn’t save your request. Please try again."}, {status:503});
  }
}

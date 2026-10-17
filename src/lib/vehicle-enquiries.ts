import {saveLead} from '@/cms/client';
import {requestGuard} from '@/cms/request-security';
import {readRequestText} from '@/cms/request-body';
import {requestInteger} from '@/cms/request-validation';

export async function submitVehicleEnquiry(request: Request, service: "airport-transfer" | "car-rental") {
  const rejection=await requestGuard(request,service);if(rejection)return rejection;
  const rental = service === "car-rental";
  const originField = rental ? "originCity" : "originAirport";
  const body = await readRequestText(request,16384);
  if (body instanceof Response) return body;
  let input: Record<string, unknown>;
  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    input = parsed;
  } catch { return Response.json({error:"Please provide valid enquiry details."}, {status:400}); }
  const text = (key:string) => typeof input[key] === "string" ? input[key].trim() : "";
  const pickup = text(originField);
  const details = {name:text("name"), phone:text("phone"), [originField]:pickup, destination:text("destination"), vehicleType:text("vehicleType"), specialRequests:text("specialRequests"), adults:requestInteger(input.adults), children:requestInteger(input.children), travellers:requestInteger(input.travellers)};
  if (!details.name || details.name.length > 100 || !/^[0-9]{10}$/.test(details.phone) || !pickup || pickup.length > 150 || !details.destination || details.destination.length > 200 || !["Sedan", "SUV", "Premium", "Luxury"].includes(details.vehicleType) || details.specialRequests.length > 2000 || !Number.isInteger(details.adults) || details.adults < 1 || !Number.isInteger(details.children) || details.children < 0 || !Number.isInteger(details.travellers) || details.travellers > 99 || details.adults + details.children !== details.travellers) {
    return Response.json({error:rental ? "Please complete every required field with valid car rental details." : "Please complete every required field with valid transfer details."}, {status:400});
  }
  try {
    const lead=await saveLead(service,details);
    return Response.json({id:lead.id,success:true},{status:201});
  } catch {
    return Response.json({error:"We couldn’t save your enquiry. Please try again."}, {status:503});
  }
}

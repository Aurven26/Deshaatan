import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export async function submitVehicleEnquiry(request: Request, service: "airport-transfer" | "car-rental") {
  const rental = service === "car-rental";
  const originField = rental ? "originCity" : "originAirport";
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({error:"This request is not permitted."}, {status:403});
  const body = await request.text();
  if (body.length > 16384) return Response.json({error:"The request is too large."}, {status:413});
  let input: Record<string, unknown>;
  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    input = parsed;
  } catch { return Response.json({error:"Please provide valid enquiry details."}, {status:400}); }
  const text = (key:string) => typeof input[key] === "string" ? input[key].trim() : "";
  const pickup = text(originField);
  const details = {name:text("name"), phone:text("phone"), [originField]:pickup, destination:text("destination"), vehicleType:text("vehicleType"), specialRequests:text("specialRequests"), adults:Number(input.adults), children:Number(input.children), travellers:Number(input.travellers)};
  if (!details.name || details.name.length > 100 || !/^[0-9]{10}$/.test(details.phone) || !pickup || pickup.length > 150 || !details.destination || details.destination.length > 200 || !["Sedan", "SUV", "Premium", "Luxury"].includes(details.vehicleType) || details.specialRequests.length > 2000 || !Number.isInteger(details.adults) || details.adults < 1 || !Number.isInteger(details.children) || details.children < 0 || !Number.isInteger(details.travellers) || details.travellers > 99 || details.adults + details.children !== details.travellers) {
    return Response.json({error:rental ? "Please complete every required field with valid car rental details." : "Please complete every required field with valid transfer details."}, {status:400});
  }
  const id = randomUUID();
  const directory = (rental ? process.env.CAR_RENTAL_REQUESTS_DIR : process.env.AIRPORT_TRANSFER_REQUESTS_DIR) || path.join(process.cwd(), ".data", `${service}-requests`);
  try {
    await mkdir(directory, {recursive:true, mode:0o700});
    await writeFile(path.join(directory, `${id}.json`), JSON.stringify({id, submittedAt:new Date().toISOString(), ...details}), {flag:"wx", mode:0o600});
  } catch {
    return Response.json({error:"We couldn’t save your enquiry. Please try again."}, {status:503});
  }
  return Response.json({id, success:true}, {status:201});
}

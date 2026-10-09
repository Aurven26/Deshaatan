import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const runtime = "nodejs";

const durations = ["3 nights / 4 days", "4 nights / 5 days", "5 nights or more"];
const styles = ["Adventure", "Beach", "Family", "Honeymoon", "Luxury", "Cars", "Solo"];

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({error:"This request is not permitted."}, {status:403});
  const body = await request.text();
  if (body.length > 8192) return Response.json({error:"The request is too large."}, {status:413});
  let input: Record<string, unknown>;
  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    input = parsed;
  } catch { return Response.json({error:"Please provide valid request details."}, {status:400}); }
  const text = (key: string) => typeof input[key] === "string" ? input[key].trim() : "";
  const travellers = Number(input.travellers);
  const adults = input.adults === undefined ? travellers : Number(input.adults);
  const children = input.children === undefined ? 0 : Number(input.children);
  const details = {name:text("name"), phone:text("phone"), origin:text("origin"), destination:text("destination"), duration:text("duration"), style:text("style"), travellers, adults, children};
  if (![details.name, details.origin, details.destination].every(value => value.length > 0 && value.length <= 100) || !/^[0-9]{10}$/.test(details.phone) || !durations.includes(details.duration) || !styles.includes(details.style) || !Number.isInteger(travellers) || travellers < 1 || travellers > 99 || !Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0 || adults + children !== travellers) {
    return Response.json({error:"Please complete every field with valid travel details."}, {status:400});
  }
  const id = randomUUID();
  const directory = process.env.ITINERARY_REQUESTS_DIR || path.join(process.cwd(), ".data", "itinerary-requests");
  try {
    await mkdir(directory, {recursive:true, mode:0o700});
    await writeFile(path.join(directory, `${id}.json`), JSON.stringify({id, submittedAt:new Date().toISOString(), ...details}), {flag:"wx", mode:0o600});
  } catch {
    return Response.json({error:"We couldn’t save your request. Please try again."}, {status:503});
  }
  return Response.json({id, success:true}, {status:201});
}

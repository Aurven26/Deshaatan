import { submitVehicleEnquiry } from "@/lib/vehicle-enquiries";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return submitVehicleEnquiry(request, "car-rental");
}

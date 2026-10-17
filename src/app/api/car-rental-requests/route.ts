import { submitVehicleEnquiry } from "@/lib/vehicle-enquiries";

export const runtime = "nodejs";

import {observePublicRoute} from '@/cms/secured-route';
export const POST = observePublicRoute(handlePOST);
async function handlePOST(request: Request) {
  return submitVehicleEnquiry(request, "car-rental");
}

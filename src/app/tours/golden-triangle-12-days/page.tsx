import type { Metadata } from "next";
import TourDetail from "@/components/tour-detail";
import { goldenTriangle } from "@/data/golden-triangle";

export const metadata: Metadata = {
  title: `${goldenTriangle.title} | Deshaatan`,
  description: "Explore the Golden Triangle with Deshaatan. View the itinerary, trip highlights, inclusions, reviews, and enquire about your journey.",
};

export default function GoldenTrianglePage() {
  return <TourDetail tour={goldenTriangle} />;
}

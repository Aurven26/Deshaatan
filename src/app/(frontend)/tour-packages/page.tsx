import type { Metadata } from "next";
import TourPackagesPage from "@/components/tour-packages-page";

export const metadata: Metadata = {
  title: "Tour Packages | Deshaatan",
  description: "Explore handpicked India tour packages. Find your destination, compare trips and plan a custom holiday with a Deshaatan specialist.",
};

export default function Page() { return <TourPackagesPage />; }

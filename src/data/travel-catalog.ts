import { tourPackages } from "./tour-packages";

export type Trip = { title: string; image: string; dots: string; category: string; crop?: boolean; href?: string; days?: number; price?: number; previousPrice?: number };
export const trips: Trip[] = [
  { title: "Discover Golden Triangle Beauty - Small Group Tour 12 Days", image: "imgFrame33", dots: "imgGroup598", category: "Honeymoon", href: "/tours/golden-triangle-12-days" },
  { title: "Manali-Kasol Tour Package For Himachal By Cab", image: "imgFrame34", dots: "imgGroup601", category: "Adventure" },
  { title: "Best-Selling Goa Tour Packages For an Exciting Vacation", image: "imgFrame35", dots: "imgGroup602", category: "Beach" },
];
export const religious: Trip[] = [
  { title: "Best Golden Triangle Tour Package", image: "imgFrame31", dots: "imgGroup599", category: "Family", crop: true, days: tourPackages.find(trip => trip.id === "golden-triangle")?.days },
  { title: "Holy Trip To Kashi, Gaya, Prayag & Ram Jan Bhoomi", image: "imgFrame32", dots: "imgGroup600", category: "Family", days: tourPackages.find(trip => trip.id === "kashi-gaya")?.days },
];
export const guides = ["Kerala", "Rajasthan", "Kashmir"];

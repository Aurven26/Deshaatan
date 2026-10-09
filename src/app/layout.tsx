import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "./globals.css";
import "./animations.css";
import "./responsive-design.css";
import "./footer.css";
import "./itinerary-form.css";

export const metadata: Metadata = {
  title: "Deshaatan — Explore India",
  description: "Discover India with Deshaatan. Explore destinations, curated holiday packages, and a custom itinerary for your next adventure.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

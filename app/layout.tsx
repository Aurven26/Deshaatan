import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/sora/800.css";
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deshaatan | Coming Soon",
  description: "India's new travel discovery and trip-planning platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

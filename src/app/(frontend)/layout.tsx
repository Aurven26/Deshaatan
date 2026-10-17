import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "../globals.css";
import "../animations.css";
import "../responsive-design.css";
import "../footer.css";
import "../itinerary-form.css";
import "../testimonials.css";
import {getWebsiteContent} from '@/cms/content';
import {CMSContentProvider} from '@/components/cms-content';
import {getPayload} from 'payload';
import config from '@payload-config';
import {mediaURL} from '@/cms/home-defaults';
export const revalidate=60;

export async function generateMetadata():Promise<Metadata> {
  const payload=await getPayload({config});
  const home=await payload.findGlobal({slug:'home-page',overrideAccess:false,depth:1});
  const favicon=home.header?.favicon;
  const icon=mediaURL(favicon);
  const version=typeof favicon==='object' && favicon?.updatedAt ? `?v=${encodeURIComponent(favicon.updatedAt)}` : '';
  return {
  title: "Deshaatan — Explore India",
  description: "Discover India with Deshaatan. Explore destinations, curated holiday packages, and a custom itinerary for your next adventure.",
  ...(icon?{icons:{icon:icon+version,shortcut:icon+version,apple:icon+version}}:{}),
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content=await getWebsiteContent();
  return <html lang="en"><body><CMSContentProvider content={content}>{children}</CMSContentProvider></body></html>;
}

import Home from "@/components/home";
import type {Metadata} from 'next';
import {getPayload} from 'payload';
import config from '@payload-config';
import {mediaURL} from '@/cms/home-defaults';
export async function generateMetadata():Promise<Metadata>{
  const payload=await getPayload({config});
  const {seo}=await payload.findGlobal({slug:'home-page',overrideAccess:false,depth:1});
  const robots=seo?.robots||'index-follow';
  const image=mediaURL(seo?.image);
  return {title:seo?.title||'Deshaatan — Explore India',description:seo?.description||undefined,keywords:seo?.keywords||undefined,robots:{index:!robots.startsWith('noindex'),follow:!robots.endsWith('nofollow')},alternates:{canonical:seo?.canonicalURL||undefined,languages:Object.fromEntries((seo?.hreflang||[]).map(item=>[item.language,item.url]))},openGraph:{title:seo?.title||undefined,description:seo?.description||undefined,...(image?{images:[image]}:{})}};
}
export default function Page() { return <Home />; }

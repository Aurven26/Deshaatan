import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import TourDetail from '@/components/tour-detail';
import {getPublishedItinerary, getPublishedReviews, tourDetail} from '@/cms/tour';

type Props = {params: Promise<{slug: string}>};
export const revalidate = 60;
export function generateStaticParams() { return []; }

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const doc = await getPublishedItinerary((await params).slug);
  if (!doc) notFound();
  const image = typeof doc.seo?.image === 'object' ? doc.seo.image?.url : undefined;
  return {
    title: doc.seo?.title || `${doc.title} | Deshaatan`,
    description: doc.seo?.description || `View the itinerary, trip highlights, inclusions and enquiry options for ${doc.title}.`,
    robots: {index: !doc.seo?.noIndex, follow: true},
    ...(doc.seo?.robots ? {robots: {index: doc.seo.robots.startsWith('index-'), follow: doc.seo.robots.endsWith('-follow')}} : {}),
    keywords: doc.seo?.keywords?.split(',').map(keyword => keyword.trim()).filter(Boolean),
    alternates: {
      canonical: doc.seo?.canonicalURL || `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000'}/tours/${doc.slug}`,
      languages: Object.fromEntries((doc.seo?.hreflang || []).map(item => [item.language, item.url])),
    },
    ...(image ? {openGraph: {images: [image]}} : {}),
  };
}

export default async function ItineraryPage({params}: Props) {
  const doc = await getPublishedItinerary((await params).slug);
  const tour = doc && tourDetail(doc);
  if (!tour || !doc) notFound();
  const publishedReviews = await getPublishedReviews(doc.id);
  return <TourDetail tour={{...tour,reviews:publishedReviews}} />;
}

import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {getCMS} from '@/cms/client';
import TourDetail from '@/components/tour-detail';
import PolicyDocument from '@/components/policy-document';
import InformationShell from '@/components/information-shell';
import '@/app/(frontend)/(information)/information.css';
import {tourDetail, getPublishedReviews} from '@/cms/tour';

export const metadata={robots:{index:false,follow:false},title:'Content preview | Deshaatan'};
export default async function PreviewPage({params}:{params:Promise<{type:string;slug:string}>}){
  const payload=await getCMS();
  const {user}=await payload.auth({headers:await headers()});
  if(!user || !['admin','editor'].includes(user.role))notFound();
  const {type,slug}=await params;
  if(type==='itineraries'){
    const result=await payload.find({collection:'itineraries',user,overrideAccess:false,draft:true,where:{slug:{equals:slug}},limit:1});
    const itinerary=result.docs[0];
    const details=itinerary && tourDetail(itinerary);
    if(!details)notFound();
    return <TourDetail tour={{...details,reviews:await getPublishedReviews(itinerary.id)}}/>;
  }
  if(type==='pages'){
    const result=await payload.find({collection:'pages',user,overrideAccess:false,draft:true,where:{slug:{equals:slug}},limit:1});
    const page=result.docs[0];
    if(!page)notFound();
    return <InformationShell><PolicyDocument slug={slug} previewPage={page}/></InformationShell>;
  }
  notFound();
}

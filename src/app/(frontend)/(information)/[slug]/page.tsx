import PolicyDocument from '@/components/policy-document';
import {pageMetadata} from '@/cms/pages';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){return pageMetadata((await params).slug);}
export default async function Page({params}:Props){return <PolicyDocument slug={(await params).slug}/>;}

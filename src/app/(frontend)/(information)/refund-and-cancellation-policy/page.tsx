import {pageMetadata} from "@/cms/pages";
import PolicyDocument from "@/components/policy-document";

export function generateMetadata(){return pageMetadata("refund-and-cancellation-policy");}
export default function Page() { return <PolicyDocument slug="refund-and-cancellation-policy" />; }

import {pageMetadata} from "@/cms/pages";
import PolicyDocument from "@/components/policy-document";

export function generateMetadata(){return pageMetadata("copyright-policy");}
export default function Page() { return <PolicyDocument slug="copyright-policy" />; }

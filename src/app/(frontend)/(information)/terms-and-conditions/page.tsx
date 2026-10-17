import {pageMetadata} from "@/cms/pages";
import PolicyDocument from "@/components/policy-document";

export function generateMetadata(){return pageMetadata("terms-and-conditions");}
export default function Page() { return <PolicyDocument slug="terms-and-conditions" />; }

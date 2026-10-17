import {pageMetadata} from "@/cms/pages";
import PolicyDocument from "@/components/policy-document";

export function generateMetadata(){return pageMetadata("about-us");}
export default function Page() { return <PolicyDocument slug="about-us" />; }

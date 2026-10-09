import type { Metadata } from "next";
import PolicyDocument from "@/components/policy-document";

export const metadata: Metadata = { title: "Copyright Policy | Deshaatan", description: "Copyright Policy for Deshaatan, a travel discovery, planning and booking platform." };
export default function Page() { return <PolicyDocument slug="copyright-policy" />; }

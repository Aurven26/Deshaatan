import type { Metadata } from "next";
import PolicyDocument from "@/components/policy-document";

export const metadata: Metadata = { title: "Privacy Policy | Deshaatan", description: "Privacy Policy for Deshaatan, a travel discovery, planning and booking platform." };
export default function Page() { return <PolicyDocument slug="privacy-policy" />; }

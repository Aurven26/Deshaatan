import type { Metadata } from "next";
import PolicyDocument from "@/components/policy-document";

export const metadata: Metadata = { title: "Refund & Cancellation Policy | Deshaatan", description: "Refund & Cancellation Policy for Deshaatan, a travel discovery, planning and booking platform." };
export default function Page() { return <PolicyDocument slug="refund-and-cancellation-policy" />; }

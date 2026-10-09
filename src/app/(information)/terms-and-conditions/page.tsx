import type { Metadata } from "next";
import PolicyDocument from "@/components/policy-document";

export const metadata: Metadata = { title: "Terms & Conditions | Deshaatan", description: "Terms & Conditions for Deshaatan, a travel discovery, planning and booking platform." };
export default function Page() { return <PolicyDocument slug="terms-and-conditions" />; }

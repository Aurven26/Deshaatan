import type { Metadata } from "next";
import PolicyDocument from "@/components/policy-document";

export const metadata: Metadata = { title: "About Us | Deshaatan", description: "About Us for Deshaatan, a travel discovery, planning and booking platform." };
export default function Page() { return <PolicyDocument slug="about-us" />; }

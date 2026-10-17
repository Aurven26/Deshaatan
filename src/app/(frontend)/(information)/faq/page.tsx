import type { Metadata } from "next";
import FaqPage from "@/components/faq-page";

export const metadata: Metadata = {
  title: "Frequently asked questions | Deshaatan",
  description: "Answers to your questions about planning, booking, payments and travelling with Deshaatan.",
};

export default function Page() {
  return <FaqPage />;
}

import InformationShell from "@/components/information-shell";
import "./information.css";

export default function InformationLayout({ children }: { children: React.ReactNode }) {
  return <InformationShell>{children}</InformationShell>;
}

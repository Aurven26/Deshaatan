import Link from "next/link";
import type { CSSProperties } from "react";
import documents from "@/data/information-pages.json";

export type InformationSlug = keyof typeof documents;
type Inline = { text: string; bold?: boolean };
type Block = { type: string; space: number; size?: number; line?: number; content?: Inline[]; items?: Inline[][]; rows?: Inline[][][] };
const tabs: [InformationSlug, string][] = [
  ["terms-and-conditions", "Terms & Conditions"], ["privacy-policy", "Privacy Policy"], ["about-us", "About Us"],
  ["copyright-policy", "Copyright Policies"], ["refund-and-cancellation-policy", "Refunds and Cancellation Policy"],
];
function RichText({ content = [] }: { content?: Inline[] }) {
  return content.map((part, i) => part.bold ? <strong key={i}>{part.text}</strong> : <span key={i}>{part.text}</span>);
}
export default function PolicyDocument({ slug }: { slug: InformationSlug }) {
  const blocks: Block[] = documents[slug];
  return <main id="information-content">
    <nav className="policy-tabs" aria-label="Company information"><div>{tabs.map(([path, title]) => <Link key={path} href={`/${path}`} aria-current={path === slug ? "page" : undefined}>{title}</Link>)}</div></nav>
    <article className="policy-document">{blocks.map((block, i) => {
      const style = { marginTop: block.space } satisfies CSSProperties;
      const text = <RichText content={block.content} />;
      switch (block.type) {
        case "h1": return <h1 style={style} key={i}>{text}</h1>;
        case "h2": return <h2 style={style} key={i}>{text}</h2>;
        case "h3": return <h3 style={style} key={i}>{text}</h3>;
        case "separator": return <hr style={style} key={i} />;
        case "list": return <ul style={style} key={i}>{block.items?.map((item, j) => <li key={j}><RichText content={item} /></li>)}</ul>;
        case "table": return <div className="policy-table" style={style} key={i}><table><thead><tr>{block.rows?.[0]?.map((cell, j) => <th scope="col" key={j}><RichText content={cell} /></th>)}</tr></thead><tbody>{block.rows?.slice(1).map((row, j) => <tr key={j}>{row.map((cell, k) => <td key={k}><RichText content={cell} /></td>)}</tr>)}</tbody></table></div>;
        case "cta": return <p className="policy-cta" style={style} key={i}><Link href="/contact-us">{text}</Link></p>;
        default: return <p className={`policy-${block.type}`} style={style} key={i}>{text}</p>;
      }
    })}</article>
  </main>;
}

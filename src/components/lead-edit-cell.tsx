import Link from 'next/link';

export default function LeadEditCell({rowData}: {rowData: {id: number | string; name?: string}}) {
  return <Link href={`/admin/collections/leads/${encodeURIComponent(rowData.id)}`} aria-label={`Edit lead${rowData.name ? `: ${rowData.name}` : ''}`} title="Edit lead" style={{display:'inline-flex',alignItems:'center',gap:6,padding:6}}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m16 3 5 5M3 21l5-1L21 7a2.1 2.1 0 0 0-5-5L3 15Z" /></svg>
    <span>Edit</span>
  </Link>;
}

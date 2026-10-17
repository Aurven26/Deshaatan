export default function HomeEditorLinks(){
  return <div style={{marginBottom:24,padding:20,border:'1px solid var(--theme-elevation-150)',borderRadius:8}}>
    <h3 style={{margin:'0 0 8px'}}>Homepage content library</h3>
    <p style={{margin:'0 0 12px'}}>Use the section tabs below for homepage text, images, visibility and ordering of cards. Edit individual trip, guide and testimonial details through these collections. Contact details and menu links are shared across the website.</p>
    <div style={{display:'flex',flexWrap:'wrap',gap:'12px 24px'}}>{[
      ['Trip details & photos','/admin/collections/itineraries'],['Travel guides','/admin/collections/guides'],['Testimonials','/admin/collections/testimonials'],['All images','/admin/collections/media'],['Navigation links','/admin/globals/navigation'],['Contact & social details','/admin/globals/site-settings'],['Page visibility','/admin/globals/section-visibility'],
    ].map(([label,href])=><a key={href} href={href} style={{textDecoration:'underline'}}>{label}</a>)}</div>
  </div>;
}

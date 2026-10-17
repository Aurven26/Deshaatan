import Link from 'next/link';
import {RichText} from '@payloadcms/richtext-lexical/react';
import documents from '@/data/information-pages.json';
import {notFound} from 'next/navigation';
import type {Page} from '@/payload-types';
import {legacyPageSections} from '@/cms/page-content';
import {getPublishedPage} from '@/cms/pages';
import {getWebsiteContent} from '@/cms/content';
import {sectionVisible} from '@/cms/visibility-labels';
import {mediaURL} from '@/cms/home-defaults';

export type InformationSlug=keyof typeof documents;
const tabs:[InformationSlug,string][]=[['terms-and-conditions','Terms & Conditions'],['privacy-policy','Privacy Policy'],['about-us','About Us'],['copyright-policy','Copyright Policies'],['refund-and-cancellation-policy','Refunds and Cancellation Policy']];

export default async function PolicyDocument({slug,previewPage}:{slug:string;previewPage?:Page}){
  const page=previewPage||await getPublishedPage(slug);
  if(!page)notFound();
  const {visibility}=await getWebsiteContent();
  const visible=(name:string)=>sectionVisible(visibility,'pages',name) && page.visibility?.[name as 'navigation'|'introduction'|'sections']!==false;
  const sections=Array.isArray(page.sections)?page.sections:legacyPageSections(page.layoutBlocks);
  return <main id="information-content">
    {visible("navigation") && <nav className="policy-tabs" aria-label="Company information"><div>{tabs.map(([path,title])=><Link key={path} href={`/${path}`} aria-current={path===slug?'page':undefined}>{title}</Link>)}</div></nav>}
    <article className="policy-document">
      {visible("introduction") && page.content && <RichText data={page.content}/>}
      {visible("sections") && sections.filter(section=>section.visible!==false).map((section,index)=>{
        const style={marginTop:section.space??20};
        const key=section.id||index;
        switch(section.blockType){
          case 'heading':{const Heading=section.level||'h2';return <Heading key={key} style={style}>{section.text}</Heading>;}
          case 'text':return <div key={key} style={style} className={`policy-${section.style||'paragraph'}`}><RichText data={section.body}/></div>;
          case 'list':return <ul key={key} style={style}>{section.items?.map((item,i)=><li key={item.id||i}><RichText data={item.body}/></li>)}</ul>;
          case 'table':return <div className="policy-table" key={key} style={style}><table><thead><tr>{section.rows?.[0]?.cells?.map((cell,i)=><th scope="col" key={cell.id||i}><RichText data={cell.body}/></th>)}</tr></thead><tbody>{section.rows?.slice(1).map((row,i)=><tr key={row.id||i}>{row.cells?.map((cell,j)=><td key={cell.id||j}><RichText data={cell.body}/></td>)}</tr>)}</tbody></table></div>;
          case 'divider':return <hr key={key} style={style}/>;
          case 'cta':return <p key={key} style={style} className="policy-cta"><Link href={section.href}>{section.label}</Link></p>;
          case 'image':return <figure key={key} style={style}><img src={mediaURL(section.image)} alt={typeof section.image==='object'?section.image.alt:section.caption||''}/>{section.caption&&<figcaption>{section.caption}</figcaption>}</figure>;
        }
      })}
    </article>
  </main>;
}

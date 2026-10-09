"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { guides } from "@/data/travel-catalog";
import { tourPackages } from "@/data/tour-packages";
import styles from "./search-popup.module.css";

const destinations = [
  ["Kashmir", "Snow, lakes & houseboats", "imgThumb"], ["Kerala", "Backwaters & hill stations", "imgThumb1"],
  ["Rajasthan", "Forts, palaces & deserts", "imgThumb2"], ["Goa", "Beaches & easy weekends", "imgThumb3"],
  ["Char Dham Yatra", "Pilgrimage in the Himalayas", "imgThumb4"], ["Himachal", "Mountains & road trips", "imgThumb5"],
];
type ResultType = "Itinerary" | "Guide";
type Result = { title: string; subtitle: string; type: ResultType; destination: string; image?: string; href?: string };
const resultGroups: { label: string; type: ResultType }[] = [
  {label:"ITINERARIES",type:"Itinerary"},
  {label:"GUIDES",type:"Guide"},
];
const resultCatalog: Result[] = [
  ...tourPackages.map(trip => ({
    title:trip.title,
    subtitle:`${trip.days} days & ${trip.days - 1} nights · ${trip.destination}`,
    type:"Itinerary" as const,
    destination:trip.destination,
    image:`/figma/packages/${trip.image}`,
    href:trip.href,
  })),
  ...guides.map((name,index)=>({
    title:name+" travel guide",
    subtitle:"Deshaatan Guide",
    type:"Guide" as const,
    destination:name,
    image:`/figma/imgImageMunnar${index || ""}.png`,
  })),
];

export default function SearchPopup({ onClose, onEnquiry, onGuide }: {onClose:()=>void;onEnquiry:(title:string)=>void;onGuide:(title:string)=>void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query,setQuery] = useState("");
  const [recent,setRecent] = useState(["Kashmir in winter","Goa 4 days","Char Dham Yatra"]);
  const [showAll,setShowAll] = useState(false);
  const [anchor,setAnchor] = useState({top:160,pointer:617});
  useEffect(()=>{
    const popup=dialog.current;
    const oldOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    document.body.dataset.siteSearch="open";
    popup?.showModal();
    const position=()=>{
      const header=document.querySelector("header")?.getBoundingClientRect();
      const button=document.querySelector(".search-button")?.getBoundingClientRect();
      const bounds=popup?.getBoundingClientRect();
      const top=(header?.bottom ?? 146)+14;
      setAnchor({top,pointer:button && bounds ? button.x+button.width/2-bounds.x-8 : 617});
      document.body.style.setProperty("--search-header-bottom",`${top-14}px`);
    };
    position(); window.addEventListener("resize",position);
    return ()=>{window.removeEventListener("resize",position);document.body.style.overflow=oldOverflow;delete document.body.dataset.siteSearch;document.body.style.removeProperty("--search-header-bottom");};
  },[]);
  const normalized=query.trim().toLowerCase();
  const hasQuery=normalized.length>0;
  const isDiscover=!hasQuery && !showAll;
  const matches=(row:Result)=>!hasQuery || `${row.title} ${row.subtitle}`.toLowerCase().includes(normalized) || normalized.includes(row.destination.toLowerCase());
  const results=resultCatalog.filter(matches);
  function choose(row:Result){
    if(row.href){window.location.href=row.href;return;}
    if(row.type==="Guide" && guides.includes(row.destination)){onGuide(row.destination);return;}
    onEnquiry(row.title);
  }
  function highlighted(title:string){const index=title.toLowerCase().indexOf(normalized);return index>=0 && hasQuery ? <>{title.slice(0,index)}<strong>{title.slice(index,index+normalized.length)}</strong>{title.slice(index+normalized.length)}</> : title;}
  return <dialog ref={dialog} className={`modal ${styles.dialog}`} aria-label="Search itineraries and guides" style={{"--search-top":`${anchor.top}px`,"--pointer-left":`${anchor.pointer}px`} as CSSProperties} onCancel={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <span className={styles.pointer} aria-hidden="true" />
    <div className={`${styles.panel} ${isDiscover ? styles.discoverPanel : styles.suggestionsPanel}`}>
      <div className={styles.search}>
        <div className={styles.field}><img src={isDiscover ? "/figma/search/discover-imgIconSearch.svg" : "/figma/search/suggestions-search.svg"} alt="" /><input ref={input} aria-label="Search itineraries and guides" placeholder={'Where do you want to go?  Try "Kerala in December"'} value={query} onChange={event=>{setQuery(event.target.value);setShowAll(false);}} autoFocus onKeyDown={event=>{if(event.key==="Enter"){event.preventDefault();setShowAll(true);}}} />{hasQuery && <button className={styles.clear} onClick={()=>{setQuery("");setShowAll(false);input.current?.focus();}}>Clear</button>}<button className={styles.escape} aria-label="Close search" onClick={onClose}>Esc</button></div>
      </div>
      <div className={styles.body}>
        <div className={styles.discover}>
          {!hasQuery && !showAll ? <>
            {recent.length>0 && <section className={styles.recent}><h2><img src="/figma/search/discover-imgIconRecent.svg" alt="" />Recent searches<button onClick={()=>setRecent([])}>Clear</button></h2><div>{recent.map(text=><button key={text} onClick={()=>setQuery(text)}><img src="/figma/search/discover-imgIconRecent1.svg" alt="" />{text}</button>)}</div></section>}
            <section className={styles.trending}><h2><img src="/figma/search/discover-imgIconTrending.svg" alt="" />Trending destinations</h2><div>{destinations.map(([title,subtitle,image],index)=><button key={title} className={index===0?styles.selected:""} onClick={()=>setQuery(title)}><img src={`/figma/search/discover-${image}.png`} alt="" /><span><strong>{title}</strong><small>{subtitle}</small></span></button>)}</div></section>
          </> : <div className={styles.results} aria-live="polite">{resultGroups.map(({label,type})=>{
            const rows=results.filter(row=>row.type===type);
            return rows.length>0 && <section key={label}><h2>{label}</h2>{rows.map((row,index)=><button key={row.title} className={`${styles.result} ${row.type==="Itinerary" && index===0?styles.selected:""}`} onClick={()=>choose(row)}>{row.image?<img className={styles.thumb} src={row.image} alt="" />:<span className={styles.resultIcon}><img src="/figma/search/suggestions-result-search.svg" alt="" /></span>}<span className={styles.resultText}><span>{highlighted(row.title)}</span><small>{row.subtitle}</small></span><span className={styles.type}>{row.type}</span>{row.type==="Itinerary" && index===0 && <img src="/figma/search/suggestions-result-arrow.svg" alt="" />}</button>)}</section>;
          })}{results.length===0 && <p className={styles.noResults}>No matching itineraries or guides yet. Tell a specialist what you have in mind.</p>}</div>}
          <div className={styles.callback}><span><img src={isDiscover ? "/figma/search/discover-imgIconSpecialist.svg" : "/figma/search/suggestions-specialist.svg"} alt="" /></span><div><strong>Talk to a destination specialist</strong><p>Share who&apos;s travelling, when and your budget. We&apos;ll suggest trips that fit.</p></div><button onClick={()=>onEnquiry(`Request a callback: ${query || "Custom trip"}`)}>Request a callback<img src={isDiscover ? "/figma/search/discover-imgIconArrow.svg" : "/figma/search/suggestions-callback-arrow.svg"} alt="" /></button></div>
        </div>
      </div>
      <div className={styles.footer}><p>Not sure where to go?{" "}<button className={styles.specialistLink} onClick={()=>onEnquiry("Talk to a destination specialist")}>Talk to a specialist</button></p><button className={styles.clearAll} onClick={()=>{setQuery("");setShowAll(false);setRecent([]);input.current?.focus();}}>Clear all</button><button className={styles.primary} onClick={()=>setShowAll(true)}>Show results<img src={isDiscover ? "/figma/search/discover-imgIconArrow1.svg" : "/figma/search/suggestions-primary-arrow.svg"} alt="" /></button></div>
    </div>
  </dialog>;
}

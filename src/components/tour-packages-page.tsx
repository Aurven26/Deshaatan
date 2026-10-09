"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "./site-chrome";
import { SiteDialog, type Modal } from "./site-dialog";
import TravellerCountField from "./traveller-count-field";
import { ShareMenu } from "./share-menu";
import { tourPackages, type TourPackage } from "@/data/tour-packages";
import faqData from "@/data/faq.json";
import s from "./tour-packages-page.module.css";

const asset = (name: string) => `/figma/packages/${name}`;
const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const durations = ["1–3 days", "4–6 days", "7–9 days", "10+ days"];
const tripTypes = ["Honeymoon", "Family", "Adventure", "Beach", "Group tours", "Solo", "Pilgrimage", "Weekend getaways"];
const destinations = ["Kashmir", "Himachal", "Kerala", "Goa", "Rajasthan", "Uttarakhand", "Golden Triangle", "Uttar Pradesh"];
const inclusions = ["Hotel stay", "Breakfast & dinner", "Private cab", "Sightseeing", "Airport transfer", "Flights"];
type Filters = {duration: string; types: string[]; destinations: string[]; includes: string[]; min: number; max: number};
const initial: Filters = {duration:"4–6 days", types:["Family"], destinations:["Kashmir"], includes:["Hotel stay"], min:5000, max:60000};
const cleared: Filters = {duration:"",types:[],destinations:[],includes:[],min:0,max:100000};
const faqs = faqData.find(category => category.id === "faq-category-3")!.items.slice(0,4);
const reasons = [
  ["Honest advice", "We will not recommend a trip that is wrong for you just because it earns us more."],
  ["Clear pricing", "You see what is included, what is not, and what you may pay at the destination, before you pay us."],
  ["Clear policies", "Cancellation and refund terms are shown upfront, in plain language."],
  ["Real accountability", "You always know who is handling your trip and how to reach us, before and during travel."],
];
function matchesDuration(days: number, duration: string) {
  return !duration || (duration === durations[0] ? days <= 3 : duration === durations[1] ? days >= 4 && days <= 6 : duration === durations[2] ? days >= 7 && days <= 9 : days >= 10);
}
// The design's range has a nonlinear scale, allowing useful precision for lower budgets.
function budgetPosition(value: number) {return value <= 5000 ? value / 5000 * 12 : value <= 60000 ? 12 + (value-5000)/55000*58 : 70 + (value-60000)/40000*30;}
function positionBudget(value: number) {return Math.round((value <= 12 ? value/12*5000 : value <= 70 ? 5000+(value-12)/58*55000 : 60000+(value-70)/30*40000)/500)*500;}

function CustomTripBanner({enquire}: {enquire:(title:string)=>void}) {
  return <section className={s.customTrip} aria-label="Plan a custom trip">
    <div className={s.customCopy}><span className={s.tag}>CUSTOM ITINERARY</span><h2>Didn&apos;t find the perfect trip?<br /><span>We&apos;ll design one for you.</span></h2><p>Share your dates, group and budget. A Deshaatan specialist will build a custom itinerary with a clear, all-inclusive quote.</p><div className={s.customActions}><Link href="/#itinerary">Plan a custom trip</Link><button onClick={()=>enquire("Talk to a destination specialist")}>Talk to a specialist</button></div></div>
    <div className={s.collage} aria-hidden="true"><div><img src={asset("grid-imgFrame34.png")} alt="" /></div><div><img src={asset("grid-imgFrame35.png")} alt="" /></div><div><img src={asset("grid-imgFrame33.png")} alt="" /></div></div>
  </section>;
}

function Card({trip,enquire,copy,showOffer=false}: {trip:TourPackage; enquire:(title:string)=>void; copy:(trip:TourPackage)=>Promise<void>; showOffer?:boolean}) {
  return <article className={s.card}>
    <div className={s.photo}>
      {trip.href ? <Link href={trip.href} aria-label={`View ${trip.title}`}><img src={asset(trip.image)} alt={trip.title} /></Link> : <button className={s.photoLink} aria-label={`Enquire about ${trip.title}`} onClick={()=>enquire(trip.title)}><img src={asset(trip.image)} alt={trip.title} /></button>}
      <ShareMenu title={trip.title} icon={asset("grid-imgShare2.svg")} href={trip.href || `/tour-packages?package=${trip.id}`} onCopy={()=>copy(trip)} />
      {showOffer&&trip.previousPrice>trip.price&&<span className={s.offerBadge}>{Math.round((trip.previousPrice-trip.price)/trip.previousPrice*100)}% OFF</span>}
      <img className={s.dots} src={asset(trip.id === "golden-triangle-12-days" ? "grid-imgGroup598.svg" : "grid-imgGroup599.svg")} alt="" />
    </div>
    <div className={s.meta}><span className={s.rating}>4.5 <small>/5</small></span><span>| &nbsp;{String(trip.days).padStart(2,"0")} days &amp; {String(trip.days-1).padStart(2,"0")} nights</span></div>
    {trip.href ? <Link className={s.cardTitle} href={trip.href}><span>{trip.title}</span></Link> : <button className={s.cardTitle} onClick={()=>enquire(trip.title)}><span>{trip.title}</span></button>}
    <div className={s.priceRow}><div className={`${s.price} ${trip.id === "golden-triangle-12-days" ? s.firstPrice : ""}`}><del>{money(trip.previousPrice)}</del><strong>{money(trip.price)}</strong><small>per person</small></div><button className={s.callback} onClick={()=>enquire(trip.title)}>Request Callback</button></div>
  </article>;
}

export default function TourPackagesPage() {
  const [modal,setModal] = useState<Modal|null>(null);
  const [notice,setNotice] = useState("");
  const [filters,setFilters] = useState<Filters>(initial);
  // Figma's selected filters are draft search preferences. Search or changing a
  // sidebar filter applies them; the initial gallery preserves all nine supplied cards.
  const [applied,setApplied] = useState<Filters>(cleared);
  const [dealsOnly,setDealsOnly] = useState(false);
  const [query,setQuery] = useState("");
  const [appliedQuery,setAppliedQuery] = useState("");
  const [city,setCity] = useState("New Delhi");
  const [month,setMonth] = useState("December 2026");
  const [sort,setSort] = useState("Recommended");
  const [visibleCount,setVisibleCount] = useState(9);
  const [moreDestinations,setMoreDestinations] = useState(false);
  const [filtersOpen,setFiltersOpen] = useState(false);
  const [openFaq,setOpenFaq] = useState<number|null>(0);
  const searchForm = useRef<HTMLFormElement>(null);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),5000);return()=>clearTimeout(timer);},[notice]);
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get("deals")==="week"){setDealsOnly(true);setFilters(cleared);return;}
    const id=params.get("package");
    if(id){const trip=tourPackages.find(item=>item.id===id);if(trip){setQuery(trip.title);setAppliedQuery(trip.title);setFilters(cleared);}}
  },[]);
  const results=tourPackages.filter(trip=>{
    const text=`${trip.title} ${trip.destination}`.toLowerCase();
    return (!dealsOnly || trip.previousPrice>trip.price) && (!appliedQuery || text.includes(appliedQuery.toLowerCase())) && trip.price>=applied.min && trip.price<=applied.max && matchesDuration(trip.days,applied.duration) && (!applied.types.length || applied.types.some(type=>trip.types.includes(type))) && (!applied.destinations.length || applied.destinations.includes(trip.destination)) && !applied.includes.some(item=>item!=="Hotel stay" && item!=="Sightseeing");
  }).sort((a,b)=>sort==="Price: low to high"?a.price-b.price:sort==="Price: high to low"?b.price-a.price:sort==="Duration: shortest first"?a.days-b.days:0);
  const visible=results.slice(0,visibleCount);
  const enquiry=(title:string)=>{
    const data=searchForm.current?new FormData(searchForm.current):null;
    const adults=Number(data?.get("adults") || 2), children=Number(data?.get("children") || 0);
    setModal({kind:"enquiry",title:`${title} — ${city} · ${month} · ${adults} ${adults===1?"adult":"adults"}, ${children} ${children===1?"child":"children"}`});
  };
  function update(next:Filters){setFilters(next);setApplied(next);setVisibleCount(9);}
  function reset(){update(cleared);setQuery("");setAppliedQuery("");setSort("Recommended");}
  function selectPackageType(value:string){
    const isDeals=value==="Deals of the Week";
    setDealsOnly(isDeals);
    if(isDeals || value==="All packages") reset();
    else update({...filters,types:[value],destinations:[],duration:""});
    const url=new URL(window.location.href);
    url.searchParams.delete("package");
    if(isDeals) url.searchParams.set("deals","week");
    else url.searchParams.delete("deals");
    window.history.replaceState(null,"",url);
  }
  function toggle(key:"types"|"destinations"|"includes",value:string){const values=filters[key];update({...filters,[key]:values.includes(value)?values.filter(item=>item!==value):[...values,value]});}
  function search(event:FormEvent<HTMLFormElement>){event.preventDefault();const next={...filters,destinations:query.trim()?[]:filters.destinations};update(next);setAppliedQuery(query.trim());}
  async function copy(trip:TourPackage){try{await navigator.clipboard.writeText(`${trip.title} — ${new URL(trip.href || `/tour-packages?package=${trip.id}`,window.location.origin).href}`);setNotice("Package link copied.");}catch{setNotice("Copy the page address from your browser to share this package.");}}
  const active=[...filters.types.map(value=>({key:"types" as const,value})),...(filters.duration?[{key:"duration" as const,value:filters.duration}]:[]),...filters.destinations.map(value=>({key:"destinations" as const,value})),...filters.includes.map(value=>({key:"includes" as const,value}))];
  function checklist(title:string,key:"types"|"destinations"|"includes",options:string[]){return <fieldset className={s.filterGroup}><legend>{title}</legend><div className={s.checks}>{options.map(value=><label key={value}><input type="checkbox" checked={filters[key].includes(value)} onChange={()=>toggle(key,value)} /><span className={s.checkbox} aria-hidden="true">{filters[key].includes(value)&&<img src={asset("filters-imgTick.svg")} alt="" />}</span><span>{value==="Group tours"?"Group tour":value}</span></label>)}</div>{key==="destinations"&&<button className={s.showMore} onClick={()=>setMoreDestinations(value=>!value)}>{moreDestinations?"− Show fewer destinations":"+ Show more destinations"}</button>}</fieldset>;}
  return <>
    <a className="skip-link" href="#packages-content">Skip to packages</a>
    <SiteHeader onAction={(kind,title)=>setModal({kind,title})} />
    <main className={s.page} id="packages-content">
      <nav className={s.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><span>Tour Packages</span></nav>
      <div className={s.pageHeader}><div><h1>Tour Packages</h1><p>Handpicked trips with hotels, transfers and sightseeing included, and the full price shown before you pay.</p></div><div className={s.highlights}>{["Clear pricing","Fully customisable","Real specialists"].map(text=><span key={text}><span><img src={asset("header-imgTick.svg")} alt="" /></span>{text}</span>)}</div></div>
      <form ref={searchForm} className={s.searchBar} onSubmit={search}>
        <label className={s.searchField}>WHERE TO<input name="destination" aria-label="Where to" placeholder="Kashmir, Kerala, Goa…" value={query} onChange={event=>setQuery(event.target.value)} /></label>
        <label className={s.searchField}>LEAVING FROM<span className={s.select}><select aria-label="Leaving from" value={city} onChange={event=>setCity(event.target.value)}>{["New Delhi","Mumbai","Bengaluru","Chennai","Hyderabad","Kolkata","Pune","Ahmedabad"].map(value=><option key={value}>{value}</option>)}</select><img src={asset("search-imgChevron.svg")} alt="" /></span></label>
        <label className={s.searchField}>WHEN<span className={s.select}><select aria-label="Travel month" value={month} onChange={event=>setMonth(event.target.value)}>{["Any time","October 2026","November 2026","December 2026","January 2027","February 2027","March 2027"].map(value=><option key={value}>{value}</option>)}</select><img src={asset("search-imgChevron.svg")} alt="" /></span></label>
        <label className={s.searchField}>DURATION<span className={s.select}><select aria-label="Search duration" value={filters.duration} onChange={event=>setFilters({...filters,duration:event.target.value})}><option value="">Any duration</option>{durations.map(value=><option key={value}>{value}</option>)}</select><img src={asset("search-imgChevron.svg")} alt="" /></span></label>
        <div className={s.searchField}><label htmlFor="package-travellers">TRAVELLERS</label><TravellerCountField id="package-travellers" label="Package travellers" initialAdults={2} initialSelected compactSummary chevronSrc={asset("search-imgChevron.svg")} className={s.travellers} /></div>
        <button className={s.searchButton} type="submit"><img src={asset("search-imgIconSearch.svg")} alt="" />Search</button>
      </form>
      <div className={s.tripTypes} aria-label="Package types">{["All packages","Deals of the Week",...tripTypes].map(value=><button key={value} className={value==="Deals of the Week"?s.dealsTab:undefined} aria-pressed={value==="Deals of the Week"?dealsOnly:!dealsOnly&&(value==="All packages"?!applied.types.length:applied.types.length===1&&applied.types[0]===value)} onClick={()=>selectPackageType(value)}>{value}</button>)}</div>
      <div className={s.listing}>
        <aside className={s.sidebar} aria-label="Package filters"><button className={s.mobileFilters} aria-expanded={filtersOpen} onClick={()=>setFiltersOpen(value=>!value)}><img src={asset("filters-imgIconFilter.svg")} alt="" />Filters<span>{filtersOpen?"Close":"Show"}</span></button><div className={`${s.filters} ${filtersOpen?s.filtersExpanded:""}`}>
          <div className={s.filterHeading}><img src={asset("filters-imgIconFilter.svg")} alt="" /><h2>Filters</h2><button onClick={reset}>Reset all</button></div><hr />
          <fieldset className={`${s.filterGroup} ${s.budget}`}><legend>BUDGET PER PERSON</legend><div className={s.range}>
            <span className={s.rangeTrack} /><span className={s.rangeFill} style={{left:`${budgetPosition(filters.min)}%`,width:`${budgetPosition(filters.max)-budgetPosition(filters.min)}%`}} />
            {(["min","max"] as const).map(key=><Fragment key={key}><img className={s.rangeKnob} style={{left:`calc(${budgetPosition(filters[key])}% - 9px)`}} src={asset("filters-imgEllipse.svg")} alt="" /><input type="range" aria-label={key==="min"?"Minimum budget slider":"Maximum budget slider"} min="0" max="100" step="1" value={budgetPosition(filters[key])} aria-valuetext={money(filters[key])} onChange={event=>{const value=positionBudget(Number(event.target.value));update({...filters,[key]:key==="min"?Math.min(value,filters.max):Math.max(value,filters.min)});}} /></Fragment>)}
          </div><div className={s.budgetFields}>{(["min","max"] as const).map(key=><label key={key}>{key==="min"?"Min":"Max"}<input aria-label={key==="min"?"Minimum budget":"Maximum budget"} inputMode="numeric" value={money(filters[key])} onChange={event=>{const value=Math.min(100000,Number(event.target.value.replace(/\D/g,"")));update({...filters,[key]:key==="min"?Math.min(value,filters.max):Math.max(value,filters.min)});}} /></label>)}</div></fieldset><hr />
          <fieldset className={s.filterGroup}><legend>DURATION</legend><div className={s.durationChips}>{durations.map(value=><button key={value} aria-pressed={filters.duration===value} onClick={()=>update({...filters,duration:filters.duration===value?"":value})}>{value}</button>)}</div></fieldset><hr />
          {checklist("TRIP TYPE","types",tripTypes.slice(0,7))}<hr />
          {checklist("DESTINATIONS","destinations",moreDestinations?destinations:destinations.slice(0,6))}<hr />
          {checklist("MUST INCLUDE","includes",inclusions)}
        </div><div className={s.helpCard}><span><img src={asset("filters-imgIconSpecialist.svg")} alt="" /></span><h3>Need help choosing?</h3><p>Tell a destination specialist who&apos;s travelling, when and your budget. We&apos;ll shortlist trips that fit.</p><button onClick={()=>enquiry("Help me choose a holiday")}>Request a callback</button></div></aside>
        <section className={s.results} aria-labelledby="package-results-heading">
          <div className={s.resultsHeader}><div aria-live="polite"><h2 id="package-results-heading">{dealsOnly?"Deals of the Week":`${results.length} ${applied.destinations.length===1?`${applied.destinations[0]} `:""}Tour Packages Found`}</h2><p>{dealsOnly&&`${results.length} offer ${results.length===1?"package":"packages"} · `}Prices are per person on twin sharing, before flights</p></div><label className={s.sort}><span>Sort by:</span><select aria-label="Sort packages" value={sort} onChange={event=>setSort(event.target.value)}>{["Recommended","Price: low to high","Price: high to low","Duration: shortest first"].map(value=><option key={value}>{value}</option>)}</select><img src={asset("sort-imgChevron.svg")} alt="" /></label></div>
          {active.length>0&&<div className={s.activeFilters} aria-label="Selected package filters">{active.map(({key,value})=><button key={key+value} aria-label={`Remove ${value} filter`} onClick={()=>key==="duration"?update({...filters,duration:""}):toggle(key,value)}>{value}<img src={asset("active-imgRemove.svg")} alt="" /></button>)}<button className={s.clearFilters} onClick={reset}>Clear all</button></div>}
          <div className={s.grid}>{visible.map((trip,index)=><Fragment key={trip.id}><Card trip={trip} enquire={enquiry} copy={copy} showOffer={dealsOnly} />{index===5&&<CustomTripBanner enquire={enquiry} />}</Fragment>)}{visible.length<6&&<CustomTripBanner enquire={enquiry} />}</div>
          {!results.length&&<div className={s.empty} role="status"><h3>No packages match these preferences.</h3><p>Try clearing a filter, or ask a specialist to customise your trip. Only inclusions confirmed in the supplied catalogue are used for filtering.</p><button onClick={reset}>Clear filters</button></div>}
          <div className={s.loadMore}><p>Showing {visible.length} of {results.length} packages</p><span><span style={{width:`${results.length?visible.length/results.length*100:0}%`}} /></span><button disabled={visible.length>=results.length} onClick={()=>setVisibleCount(count=>count+9)}>Load more packages</button></div>
        </section>
      </div>
      <section className={s.why}><span className={s.eyebrow}>WHY DESHAATAN</span><h2>Why book your holiday with us</h2><div>{reasons.map(([title,text])=><article key={title}><span><img src={asset("why-imgTick.svg")} alt="" /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className={s.faq}><div><span className={s.eyebrow}>FAQs</span><h2>Questions about our packages</h2><p>Quick answers before you book. You can always ask a specialist too.</p><Link href="/faq">View all FAQs →</Link></div><div className={s.accordion}>{faqs.map((item,index)=><article key={item.question} className={openFaq===index?s.faqOpen:""}><h3><button aria-expanded={openFaq===index} aria-controls={`package-faq-${index}`} onClick={()=>setOpenFaq(openFaq===index?null:index)}>{item.question}<span className={s.faqIcon} aria-hidden="true" /></button></h3>{openFaq===index&&<p id={`package-faq-${index}`}>{item.answer}</p>}</article>)}</div></section>
    </main>
    <SiteFooter onInfo={title=>setModal({kind:"info",title})} onRentCar={()=>setModal({kind:"car-rental",title:"Rent A Car"})} />
    <SiteDialog modal={modal} setModal={setModal} onNotice={setNotice} />
    {notice&&<div className="toast" role="status">{notice}</div>}
  </>;
}

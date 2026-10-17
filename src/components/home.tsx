"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "./site-chrome";
import {SiteDialog, EnquiryFields, type Modal} from "./site-dialog";
import {type Trip} from "@/data/travel-catalog";
import { ShareMenu } from "./share-menu";
import HomepageMotion from "./homepage-motion";
import HomeBanners from "./home-banners";
import {useCMSContent} from './cms-content';
import DurationTabs, { matchesTripDuration } from "./duration-tabs";

const asset = (name: string, extension = "svg") => `/figma/${name}.${extension}`;
function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={asset(name)} alt="" />;
}
function CarouselArrows({ target, label, count }: { target: RefObject<HTMLDivElement | null>; label: string; count: number }) {
  const [edges, setEdges] = useState({start:true,end:false});
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    element.scrollTo({left:0});
    const update = () => setEdges({start:element.scrollLeft <= 1,end:element.scrollLeft + element.clientWidth >= element.scrollWidth - 1});
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll",update,{passive:true});
    return () => {observer.disconnect(); element.removeEventListener("scroll",update);};
  }, [target,count]);
  const move = (direction: number) => {
    const element = target.current;
    if (element) element.scrollBy({left:direction * element.clientWidth,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
  };
  return <div className="home-carousel-arrows" aria-label={label + " navigation"}><button type="button" aria-label={"Previous " + label} disabled={edges.start} onClick={() => move(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg></button><button type="button" aria-label={"Next " + label} disabled={edges.end} onClick={() => move(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></button></div>;
}

function PackageCard({ trip, duration, enquire, share }: { trip: Trip; duration: number; enquire: (title: string) => void; share: (title: string) => Promise<void> }) {
  const {homePage:{popular:p}}=useCMSContent();
  return <article className="package-card">
    <div className={`package-image ${trip.crop ? "golden-crop" : ""}`}>
      {trip.href ? <Link href={trip.href} aria-label={`View ${trip.title}`}><Image className="package-photo" src={trip.image.startsWith("/") ? trip.image : asset(trip.image, "png")} alt={trip.title} width={486} height={486} sizes="(max-width: 600px) 90vw, 486px" /></Link> : <Image className="package-photo" src={trip.image.startsWith("/") ? trip.image : asset(trip.image, "png")} alt={trip.title} width={486} height={486} sizes="(max-width: 600px) 90vw, 486px" />}
      <ShareMenu title={trip.title} icon={["imgFrame34", "imgFrame32"].includes(trip.image) ? "imgShare3" : "imgShare2"} onCopy={share} />
      <Icon name={trip.dots} className="photo-dots" />
    </div>
    <div className="trip-meta"><span className="rating">{p.rating} <small>{p.ratingScale}</small></span><span>| &nbsp;{trip.days ? `${String(trip.days).padStart(2, "0")} days & ${String(trip.days - 1).padStart(2, "0")} nights` : duration === 1 ? "05 days & 04 nights" : "06 days & 05 nights"}</span></div>
    {trip.href ? <Link className="trip-title" href={trip.href}>{trip.title}</Link> : <button className="trip-title" onClick={() => enquire(trip.title)}>{trip.title}</button>}
    <div className="price-row"><div className="price"><del>₹{(trip.previousPrice ?? 12952).toLocaleString("en-IN")}</del><div><strong>₹{(trip.price ?? 8952).toLocaleString("en-IN")}</strong><span>{p.perPerson}</span></div></div><button className="callback" onClick={() => enquire(trip.title)}>{p.callbackLabel}</button></div>
  </article>;
}

export default function Home() {
  const {tourPackages,testimonials:allTestimonials,guideDetails,homePage:h,homeSelection}=useCMSContent();
  const categories=h.categories.items;
  const showCategories=h.categories.enabled;
  const testimonials=h.testimonials.useAll?allTestimonials:homeSelection.testimonials.flatMap(name=>allTestimonials.filter(item=>item.name===name));
  const guides=h.guides.useAll?guideDetails:homeSelection.guides.flatMap(name=>guideDetails.filter(item=>item.title===name));
  const popularTrips=h.popular.useAll?tourPackages:homeSelection.popular.flatMap(id=>tourPackages.filter(item=>item.id===id));
  const [duration, setDuration] = useState(-1);
  const [religiousDuration, setReligiousDuration] = useState(-1);
  const destinationTrack = useRef<HTMLDivElement>(null);
  const guideTrack = useRef<HTMLDivElement>(null);
  const religiousTrack = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState("");
  const [modal, setModal] = useState<Modal | null>(null);
  const [notice, setNotice] = useState("");
  const [submittingItinerary, setSubmittingItinerary] = useState(false);
  const [itineraryResult, setItineraryResult] = useState<{success: boolean; message: string} | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [testimonial, setTestimonial] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);
  const enquiry = (title: string) => setModal({ kind: "enquiry", title });
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 5000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (!testimonials.length || testimonialPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setTestimonial(value => (value + 1) % testimonials.length), 7000);
    return () => window.clearInterval(timer);
  }, [testimonialPaused,testimonials.length,h.testimonials.interval]);
  async function share(title: string) {
    try {
      await navigator.clipboard.writeText(`${title} — ${window.location.origin}/#destinations`);
      setNotice("Package link copied.");
    } catch { setNotice("You can share this page using the address in your browser."); }
  }
  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingItinerary) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmittingItinerary(true);
    setItineraryResult(null);
    try {
      const response = await fetch("/api/itinerary-requests", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(Object.fromEntries(data))});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t submit your request. Please try again.");
      setItineraryResult({success:true, message:h.enquiry.successMessage});
      form.reset();
    } catch (error) {
      setItineraryResult({success:false, message:error instanceof Error ? error.message : "We couldn’t submit your request. Please try again."});
    } finally { setSubmittingItinerary(false); }
  }
  const visibleTrips: Trip[] = popularTrips
    .filter(trip => matchesTripDuration(trip.days, duration)
      && (!category || !["Adventure", "Beach", "Honeymoon"].includes(category) || trip.types.includes(category)))
    .map(trip => ({...trip, image: trip.image.startsWith('/') || trip.image.startsWith('http') ? trip.image : `/figma/packages/${trip.image}`, dots: "imgGroup598", category: trip.types[0]}));
  const charDham = tourPackages.find(trip => trip.id === h.religious.featuredSlug);
  const showCharDham = !!charDham && (h.religious.useAll || homeSelection.religious.includes(charDham.id)) && matchesTripDuration(charDham.days, religiousDuration);
  const religious:Trip[]=(h.religious.useAll?tourPackages.filter(trip=>trip.types.includes('Pilgrimage') || trip.id==='golden-triangle'):homeSelection.religious.flatMap(id=>tourPackages.filter(trip=>trip.id===id))).filter(trip=>trip.id!==h.religious.featuredSlug).map(trip=>({...trip,image:trip.image.startsWith('/')?trip.image:`/figma/packages/${trip.image}`,dots:'imgGroup599',category:trip.types[0]}));
  const visibleReligiousTrips = religious.filter(trip => matchesTripDuration(trip.days, religiousDuration));
  const religiousCount = visibleReligiousTrips.length + Number(showCharDham);
  return <>
    <HomepageMotion />
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader home onAction={(kind, title) => setModal({kind, title})} />
    <main id="main">
      <HomeBanners />
      {showCategories && <div className="categories-wrap"><div className="categories content">{categories.map((item, i) => <button key={item.label} className={category === item.label ? "category active" : "category"} aria-pressed={category === item.label} onClick={() => { setCategory(category === item.label ? "" : item.label); if (!["Adventure", "Beach", "Honeymoon"].includes(item.label)) enquiry(item.enquiryTitle); }}><span className={`category-icon category-${i}`}><img src={item.image} alt="" />{i === 3 && <Icon name="imgIcon1" className="heart-detail" />}</span><span>{item.label}</span></button>)}</div><Icon name="imgVector11" className="category-divider" /></div>}
      {h.popular.enabled && <section id="destinations" className="popular content">
        <div className="section-heading"><h1>{h.popular.title}</h1><DurationTabs labels={h.popular.durationLabels.map(item=>item.label)} value={duration} onChange={setDuration} /><CarouselArrows target={destinationTrack} label="destinations" count={visibleTrips.length} /></div>
        <div className="packages-grid home-carousel-track" ref={destinationTrack} aria-live="polite">{visibleTrips.map(trip => <PackageCard key={trip.title} trip={trip} duration={duration} enquire={enquiry} share={share} />)}</div>
        {!visibleTrips.length && <p role="status">{h.popular.emptyText} <button className="view-all" onClick={() => setCategory("")}>{h.popular.clearLabel}</button></p>}
      </section>}
      {h.guides.enabled && <section id="guides" className="guides content"><div className="section-heading"><h2>{h.guides.title}</h2><CarouselArrows target={guideTrack} label="guides" count={guides.length} /></div>
        <div className="guides-grid home-carousel-track" ref={guideTrack}>{guides.map(guide => <button className="guide-card" key={guide.title} onClick={() => setModal({ kind: "guide", title: guide.title })}><span className="guide-image"><img src={guide.image||""} alt={`${guide.title} travel guide`} /></span><div className="guide-copy"><h3>{guide.title}</h3><p>{guide.summary}</p><span>{h.guides.exploreLabel} {guide.title} <b>→</b></span></div></button>)}</div>
      </section>}
      {h.religious.enabled && <section id="religious" className="religious"><div className="religious-backdrop" style={{backgroundImage:`url("${h.religious.backgroundImage}")`}} /><div className="content religious-content"><div className="section-heading"><h2>{h.religious.title}</h2><DurationTabs labels={h.religious.durationLabels.map(item=>item.label)} value={religiousDuration} onChange={setReligiousDuration} /><CarouselArrows target={religiousTrack} label="religious packages" count={religiousCount} /></div>
        <div className="packages-grid home-carousel-track" ref={religiousTrack} aria-live="polite">{showCharDham && <article className="featured-trip"><img className="featured-photo" src={h.religious.featuredImage} alt="Kedarnath temple in the Himalayas" /><ShareMenu title={h.religious.featuredEnquiry} icon="imgShare4" onCopy={share} /><button className="featured-copy" onClick={() => enquiry(h.religious.featuredEnquiry)}><strong>{h.religious.featuredTitle}</strong><span>{h.religious.featuredSubtitle}</span><small>{charDham?.days} days - {(charDham?.days ?? 1) - 1} Nights</small></button><button className="featured-callback" onClick={() => enquiry(h.religious.featuredEnquiry)}>{h.religious.featuredButton}</button></article>}{visibleReligiousTrips.map(trip => <PackageCard key={trip.title} trip={trip} duration={religiousDuration} enquire={enquiry} share={share} />)}</div>
        {!religiousCount && <p role="status">{h.religious.emptyText} <button type="button" onClick={() => setReligiousDuration(-1)}>{h.religious.clearLabel}</button></p>}
      </div></section>}
      {h.testimonials.enabled && testimonials.length>0 && <section className="testimonials content" onMouseEnter={() => setTestimonialPaused(true)} onMouseLeave={() => setTestimonialPaused(false)} onFocusCapture={() => setTestimonialPaused(true)} onBlurCapture={() => setTestimonialPaused(false)}><div className="testimonial-heading"><p>{h.testimonials.eyebrow}</p><h2><span className="desktop-only">{h.testimonials.title.split("\n").map((line,i)=><span key={i}>{i>0&&<br/>}{line}</span>)}</span><span className="mobile-only">{h.testimonials.mobileTitle}</span></h2></div><div className="testimonial-card" aria-live="polite"><img className="avatar" src={testimonials[testimonial % testimonials.length].avatar||h.testimonials.defaultAvatar} alt="" /><div className="testimonial-story" key={testimonial}><p>{testimonials[testimonial % testimonials.length].text}</p>{testimonials[testimonial % testimonials.length].rating>=4.5 ? <Icon name="imgStar" className="stars" /> : <span className="stars" style={{color:"#ffbe45",fontSize:20,width:"auto",height:"auto",lineHeight:1}} aria-label={`${testimonials[testimonial % testimonials.length].rating} out of 5 stars`}>{"★".repeat(Math.round(testimonials[testimonial % testimonials.length].rating))}</span>}<strong>{testimonials[testimonial % testimonials.length].name}</strong><small>{testimonials[testimonial % testimonials.length].role}</small></div><div className="testimonial-controls"><button aria-label="Previous testimonial" onClick={() => setTestimonial(value => (value + testimonials.length - 1) % testimonials.length)}><Icon name="imgArrowBtn8" className="flip-arrow" /></button><button aria-label="Next testimonial" onClick={() => setTestimonial(value => (value + 1) % testimonials.length)}><Icon name="imgArrowBtn2" /></button></div></div></section>}
      {h.enquiry.enabled && <section id="itinerary" className="itinerary"><div className="content"><h2>{h.enquiry.titleBefore} <span>{h.enquiry.titleHighlight}</span> {h.enquiry.titleAfter}</h2><p>{h.enquiry.description}</p><form className="itinerary-form" onSubmit={submitEnquiry} aria-busy={submittingItinerary}><fieldset className="itinerary-fieldset" disabled={submittingItinerary}><EnquiryFields prefix="itinerary-" travelDetails copy={h.enquiry} /></fieldset><div className="form-actions"><button type="submit" className="primary-button" disabled={submittingItinerary}>{submittingItinerary ? h.enquiry.pendingLabel : h.enquiry.button}<Icon name="imgItalicText1" /></button><a className="whatsapp-button" href={h.enquiry.whatsappURL} target="_blank" rel="noreferrer"><Icon name="imgGroup1" />{h.enquiry.whatsappLabel}</a></div>{itineraryResult && <p className={`itinerary-result ${itineraryResult.success ? "success" : "error"}`} role={itineraryResult.success ? "status" : "alert"}>{itineraryResult.message}</p>}<div className="form-promises">{h.enquiry.promises.map((item,i)=><span key={i}>{item.label}</span>)}</div></form></div></section>}
      {h.about.enabled && <><section id="about" className="about content"><h2>{h.about.title}</h2><div className={expanded ? "about-copy expanded" : "about-copy"}><p>{expanded ? h.about.full : h.about.preview} <button className="about-toggle" onClick={() => setExpanded(!expanded)}>{expanded ? h.about.readLess : h.about.readMore}</button></p></div>{h.about.linkGroups.map((group,i) => <div className="city-links" key={i}><h2>{group.title}</h2><Icon name="imgVector16" /><div className="city-columns">{[0,1,2].map(column => <div key={column}>{group.links.filter((_,index)=>index%3===column).map((link,j)=>link.href?<a key={j} href={link.href}>{link.label}</a>:<button key={j} onClick={()=>enquiry(link.label)}>{link.label}</button>)}</div>)}</div></div>)}</section>
      <div className="mobile-city-links mobile-only">{h.about.linkGroups.map((group,i)=><details key={i}><summary>{group.title}</summary><div>{group.links.map((link,j)=>link.href?<a key={j} href={link.href}>{link.label}</a>:<button key={j} onClick={()=>enquiry(link.label)}>{link.label}</button>)}</div></details>)}</div></>}
      {h.airport.enabled && <section className="airport-transfer content" aria-label="Airport transfers"><img className="airport-decoration" src={h.airport.decorationImage} alt="" /><img className="airport-car" src={h.airport.carImage} alt={h.airport.carAlt} /><div><h2>{h.airport.title}</h2><p>{h.airport.description}</p></div><button onClick={() => setModal({kind:"airport-transfer",title:h.airport.enquiryTitle})}>{h.airport.button}</button></section>}
    </main>
    <SiteFooter onInfo={title => setModal({kind: "info", title})} onRentCar={() => setModal({kind:"car-rental",title:"Rent A Car"})} />
    <SiteDialog modal={modal} setModal={setModal} onNotice={setNotice} />
    {notice && <div className="toast" role="status">{notice}</div>}
  </>;
}

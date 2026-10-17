"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { SiteHeader, SiteFooter } from "./site-chrome";
import { ShareMenu } from "./share-menu";
import { SiteDialog, type Modal } from "./site-dialog";
import { tourAssets } from "./tour-assets";
import type { Tour } from "@/data/golden-triangle";
import s from "./tour-detail.module.css";
import TravellerCountField from "./traveller-count-field";
import WriteReviewPopup from "./write-review-popup";
import DurationTabs, { matchesTripDuration } from "./duration-tabs";
import {useCMSContent} from "./cms-content";
import {sectionVisible} from "@/cms/visibility-labels";

const sections = ["Overview", "Itinerary", "Inclusions", "Exclusions", "FAQs", "Reviews"];
const sectionId = (label: string) => label.toLowerCase();
const defaultPhotos = [tourAssets["2032-4185-imgRectangle4661"], tourAssets["2032-4167-imgListItem"]];
function Asset({ name, className = "" }: { name: string; className?: string }) {
  return <img src={tourAssets[name]} className={className} alt="" loading="lazy" />;
}
function TourLinks({links, onEnquire}: {links: NonNullable<Tour['linkSections']>[number]['links']; onEnquire:(title:string)=>void}) {
  return <div>{links.map((link,i) => <button key={i} onClick={() => onEnquire(link.label)}>{link.label}</button>)}</div>;
}
function Heading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className={s.sectionHeading}><h2>{children}</h2>{action}</div>;
}
function Stars({rating}: {rating:number}) {
  return <span role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`} style={{color:'#ffbd45',letterSpacing:2}}>{Array.from({length:5},(_,i)=>i<Math.round(rating)?'★':'☆').join('')}</span>;
}
function MissingDetail({onEnquire}: {onEnquire:()=>void}) {
  return <p className={s.missingDetail}>The detailed information has not been supplied yet. <button onClick={onEnquire}>Ask our travel expert</button>.</p>;
}

function TravelDateField() {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [travelDate, setTravelDate] = useState("");
  const [earliestDate, setEarliestDate] = useState("");
  const [month, setMonth] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  useEffect(() => {
    const today = new Date();
    setEarliestDate(dateKey(today));
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  const days = month ? new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() : 0;
  function changeMonth(offset: number) { if (month) setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1)); }
  return <div ref={root} className={`${s.compactField} ${s.dateField}`} data-empty={!travelDate} onKeyDown={event => { if (event.key === "Escape") { setOpen(false); input.current?.focus(); } }}>
    <label className={s.srOnly} htmlFor={id}>Travel Date</label>
    {!travelDate && <span className={s.datePlaceholder} aria-hidden="true">Travel Date <b>*</b></span>}
    <input ref={input} id={id} name="date" type="date" min={earliestDate || undefined} value={travelDate} onChange={event => { setTravelDate(event.target.value); setOpen(false); }} onClick={() => setOpen(true)} required />
    <button className={s.calendarToggle} type="button" aria-label="Choose travel date" aria-expanded={open} aria-controls={`${id}-calendar`} onClick={() => setOpen(!open)}><img src="/figma/itinerary/date-chevron.svg" alt="" /></button>
    {open && month && <div className={s.calendar} id={`${id}-calendar`} role="dialog" aria-label="Choose travel date">
      <div className={s.calendarHeader}><button type="button" aria-label="Previous month" disabled={dateKey(month).slice(0,7) <= earliestDate.slice(0,7)} onClick={() => changeMonth(-1)}><img src="/figma/itinerary/form-chevron.svg" alt="" /></button><strong aria-live="polite">{month.toLocaleDateString("en-IN", {month:"long", year:"numeric"})}</strong><button type="button" aria-label="Next month" onClick={() => changeMonth(1)}><img src="/figma/itinerary/form-chevron.svg" alt="" /></button></div>
      <div className={s.calendarDays}>{["Su","Mo","Tu","We","Th","Fr","Sa"].map(day => <span key={day}>{day}</span>)}{Array.from({length:month.getDay()}, (_, i) => <span key={`blank-${i}`} />)}{Array.from({length:days}, (_, i) => { const date = new Date(month.getFullYear(), month.getMonth(), i + 1); const value = dateKey(date); return <button type="button" key={value} disabled={value < earliestDate} aria-label={date.toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"})} aria-pressed={travelDate === value} onClick={() => {setTravelDate(value); setOpen(false); input.current?.focus();}}>{i + 1}</button>; })}</div>
    </div>}
  </div>;
}

function EnquiryForm({ title, message, onReady }: { title: string; message: string; onReady: (text: string) => void }) {
  const [pending,setPending]=useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(pending)return;
    const values = new FormData(event.currentTarget);
    setPending(true);
    try{const response=await fetch('/api/callback-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(values),title})});const result=await response.json();if(!response.ok)throw new Error(result.error || 'Please try again.');onReady('Your enquiry has been submitted successfully.');}
    catch(error){onReady(error instanceof Error?error.message:'Please try again.');}
    finally{setPending(false);}
  }
  return <form id="enquiry" className={s.enquiry} onSubmit={submit}>
    <h2>Fill Enquiry Form Below!</h2>
    <label className={s.field}><span>Full Name <b>*</b></span><input name="name" autoComplete="name" placeholder="Your full name" required /></label>
    <label className={s.field}><span>Email <b>*</b></span><input name="email" type="email" autoComplete="email" placeholder="Your email address" required /></label>
    <div className={s.phoneRow}><label className={s.country}><span className={s.srOnly}>Country code</span><select name="country" autoComplete="tel-country-code" defaultValue="+91"><option>+91</option><option>+1</option><option>+44</option><option>+61</option><option>+971</option></select><img src="/figma/itinerary/form-chevron.svg" alt="" /></label><label className={s.field}><span>Phone Number <b>*</b></span><input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="Phone number" pattern="[0-9 ()-]{7,20}" required /></label></div>
    <div className={s.formRow}>
      <TravelDateField />
      <TravellerCountField />
    </div>
    <label className={s.messageField}><span className={s.srOnly}>Message</span><textarea name="message" placeholder="Message..." key={message} defaultValue={message} /></label>
    <button className={s.orangeButton} type="submit" disabled={pending} aria-busy={pending}>{pending ? 'Submitting…' : 'Send Enquiry'} <img className={s.enquiryArrow} src="/figma/itinerary/enquiry-chevron.svg" alt="" /></button>
  </form>;
}

function Itinerary({ tour, enquire }: { tour: Tour; enquire:()=>void }) {
  const [expanded, setExpanded] = useState<number[]>([]);
  useEffect(() => { if (window.matchMedia("(min-width: 701px)").matches) setExpanded([0]); }, []);
  const allExpanded = expanded.length === tour.days.length;
  return <section id="itinerary" className={s.itinerarySection}>
    <Heading action={<button className={s.expandAll} onClick={() => setExpanded(allExpanded ? [] : tour.days.map((_, i) => i))}>{allExpanded ? "Collapse All" : "Expand All"}</button>}>Itinerary</Heading>
    <div className={s.days}>{tour.days.map((day, i) => <div className={`${s.day} ${day.desktopOnly ? s.desktop : ""}`} key={`${day.day}-${i}`}>
      <h3><button aria-expanded={expanded.includes(i)} aria-controls={`day-${i}`} onClick={() => setExpanded(current => current.includes(i) ? current.filter(n => n !== i) : [...current, i])}><span className={s.dayNumber}>DAY {day.day}</span><span className={s.dayTitle}>{day.mobileTitle ? <><span className={s.desktop}>{day.title}</span><span className={s.mobile}>{day.mobileTitle}</span></> : day.title}</span><Asset name="2163-2995-imgIcon" className={expanded.includes(i) ? s.chevronOpen : s.chevron} /></button></h3>
      <div id={`day-${i}`} hidden={!expanded.includes(i)} className={s.dayBody}>{day.description ? <p>{day.description}</p> : <MissingDetail onEnquire={enquire} />}</div>
    </div>)}</div>
    <Asset name="2032-4182-imgImageEndOfTrip" className={s.endTrip} />
  </section>;
}

function Checklist({ items, excluded = false }: { items: string[]; excluded?: boolean }) {
  return <ul className={s.checklist}>{items.map(item => <li key={item}><Asset name={excluded ? "2163-2994-imgIcon13" : "2163-2994-imgIcon"} /><span>{item}</span></li>)}</ul>;
}

function ReviewCard({ review, index }: { review: Tour["reviews"][number]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [useful, setUseful] = useState(false);
  return <article className={s.reviewCard}>
    <div className={s.reviewer}><strong>{review.name}</strong><span>BEST</span></div>
    <div className={s.reviewMeta}>{review.rating >= 4 ? <img className={s.reviewStars} src={`/figma/itinerary/review-stars-${review.rating}.png`} alt={`${review.rating} out of 5 stars`} /> : <Stars rating={review.rating} />}<time>{review.date}</time></div>
    <p className={expanded ? s.reviewFull : s.reviewExcerpt} id={`review-${index}`}>{review.text}</p>
    <button className={s.seeMore} aria-expanded={expanded} aria-controls={`review-${index}`} onClick={() => setExpanded(!expanded)}>{expanded ? "See less" : "See more"}</button>
    <div className={s.reviewActions}><button aria-pressed={useful} onClick={() => setUseful(!useful)}><img src="/figma/itinerary/useful.png" alt="" />It&apos;s useful! · {useful ? 1 : 0}</button><button className={s.reviewMore} aria-label={`${expanded ? "Collapse" : "Read full"} review from ${review.name}`} aria-expanded={expanded} aria-controls={`review-${index}`} onClick={() => setExpanded(!expanded)}><Asset name="2146-3115-imgIcon2" /></button></div>
  </article>;
}

function FloatingEnquiry({ visible, active, price, enquire, labels }: {labels:string[]; visible: boolean; active: string; price: string; enquire: (customize?: boolean) => void }) {
  const icons = ["imgIcon", "imgIcon1", "imgIcon2", "imgIcon3", "imgGroup1171275185"];
  return <aside className={`${s.floating} ${visible ? s.floatingVisible : ""}`} aria-label="Trip enquiry" inert={!visible}>
    <div className={s.desktopBar}><nav aria-label="Quick trip sections">{labels.map((label) => <a key={label} href={`#${sectionId(label)}`} aria-current={active === sectionId(label) ? "location" : undefined}><Asset name={`2179-3658-${icons[["Overview","Itinerary","Inclusions","Reviews","FAQs"].indexOf(label)]}`} />{label === "FAQs" ? "FAQ’s" : label}</a>)}</nav><div className={s.floatingPrice}><div><strong>₹{price}</strong><span> / person</span></div><small>Excluding Applicable Taxes</small></div><button className={s.orangeButton} onClick={() => enquire()}>Send Enquiry</button></div>
    <div className={s.mobileBar}><div className={s.mobileBarTop}><div><p>Want to change this trip?</p><small>Our travel expert can help</small></div><a className={s.whatsappContact} href="https://wa.me/?text=Hello%20Deshaatan%2C%20I%20would%20like%20to%20plan%20a%20trip." target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><img src="/figma/itinerary/mobile-enquiry-whatsapp.svg" alt="" /></a><a href="tel:+917065780780" aria-label="Call Deshaatan"><img src="/figma/itinerary/mobile-enquiry-call.svg" alt="" /></a></div><div className={s.mobileBarBottom}><div className={s.mobilePrice}><small>From</small><div><strong>₹{price}</strong><span>/person</span></div></div><button className={s.mobileEnquire} onClick={() => enquire()}>Send Enquire</button></div></div>
  </aside>;
}

export default function TourDetail({ tour }: { tour: Tour }) {
  const {visibility,tourPackages}=useCMSContent();
  const isVisible=(name:string)=>sectionVisible(visibility,"itinerary",name) && tour.sectionVisibility?.[name]!==false;
  const visibleTabs=sections.filter(label=>isVisible(sectionId(label)));
  const photos=tour.photos?.length?tour.photos:defaultPhotos;
  const linkSections = tour.linkSections || [];
  const startCity = tour.startCity ?? tour.startEndCity;
  const endCity = tour.endCity || startCity;
  const reviewCount=tour.reviews.length;
  const average=reviewCount?tour.reviews.reduce((sum,review)=>sum+review.rating,0)/reviewCount:0;
  const sentiment=[tour.reviews.filter(r=>r.rating>=4).length,tour.reviews.filter(r=>r.rating===3).length,tour.reviews.filter(r=>r.rating<=2).length].map(count=>reviewCount?Math.round(count/reviewCount*100):0);
  const [active, setActive] = useState("overview");
  const [floating, setFloating] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const message = "";
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [dialog, setDialog] = useState<"gallery" | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const overviewRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLDetailsElement>(null);
  const [allReviews, setAllReviews] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [relatedDuration, setRelatedDuration] = useState(-1);
  const relatedRef = useRef<HTMLDivElement>(null);
  useEffect(() => { relatedRef.current?.scrollTo({left: 0}); }, [relatedDuration]);
  useEffect(() => { try { setSaved(localStorage.getItem(`saved-tour:${tour.slug}`) === "true"); } catch {} }, [tour.slug]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => { if (faqRef.current) faqRef.current.open = !media.matches; };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const overviewTop = overviewRef.current?.getBoundingClientRect().top ?? Infinity;
      setFloating(overviewTop <= 160);
      let current = "overview";
      for (const label of sections) { const element = document.getElementById(sectionId(label)); if (element && element.getBoundingClientRect().top <= 210) current = sectionId(label); }
      setActive(current);
    };
    const scroll = () => { if (!scheduled) { scheduled = true; frame = requestAnimationFrame(update); } };
    let frame = requestAnimationFrame(update);
    window.addEventListener("scroll", scroll, {passive: true});
    window.addEventListener("resize", scroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  }, []);
  useEffect(() => { if (dialog) dialogRef.current?.showModal(); else dialogRef.current?.close(); }, [dialog]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 6000); return () => clearTimeout(timer); }, [notice]);
  function enquire(customize = false) { setModal({kind: "enquiry", title: customize ? "Customize " + tour.title : tour.title}); }
  function openInfo(title: string) { setModal({kind:"info",title}); }
  async function share() {
    try { await navigator.clipboard.writeText(window.location.href.split("#")[0]); setNotice("Tour link copied."); } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setNotice("Please copy the tour address from your browser to share it."); }
  }
  function save() { const next = !saved; setSaved(next); try {localStorage.setItem(`saved-tour:${tour.slug}`, String(next));} catch {setNotice("Saved for this visit; browser storage is unavailable.");} }
  const related = ["kashmir-winter", "manali-kasol", "goa-beach", "golden-triangle"].flatMap((id, index) => {
    const trip = tourPackages.find(packageItem => packageItem.id === id);
    return trip && matchesTripDuration(trip.days, relatedDuration) ? [{...trip, index}] : [];
  });
  return <div className={s.page}>
    {writeReviewOpen && <WriteReviewPopup title={tour.title} slug={tour.slug} onClose={() => setWriteReviewOpen(false)} />}
    <a className="skip-link" href="#tour-content">Skip to itinerary</a>
    <SiteHeader onAction={(kind, title) => setModal({kind, title})} />
    <main id="tour-content" className={s.container}>
      {isVisible("introduction") && <nav className={s.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>〉</span><Link href="/#destinations">India Tours</Link><span>〉</span><span>{tour.title}</span></nav>}
      {isVisible("introduction") && <h1 className={s.title}>{tour.title}</h1>}
      {isVisible("introduction") && <div className={s.titleMeta}>{isVisible("reviews") && <a className={s.rating} href="#reviews"><strong>{reviewCount?average.toFixed(1):"New"}</strong><Stars rating={average} /><span>({reviewCount} reviews)</span></a>}<p className={s.duration}>{tour.duration ?? 12} days {startCity && <><span>•</span> {startCity === endCity ? <>Start and end in <strong>{startCity}</strong></> : <>Start in <strong>{startCity}</strong> · End in <strong>{endCity}</strong></>}</>}</p><div className={s.titleActions}><ShareMenu title={tour.title} icon="/figma/itinerary/share.svg" inline href={`/tours/${tour.slug}`} onCopy={share} /><button aria-pressed={saved} onClick={save}><img src="/figma/itinerary/heart.svg" alt="" />{saved ? "Saved" : "Save"}</button></div></div>}
      <div className={s.topGrid} style={!isVisible("gallery")||!isVisible("enquiry")?{gridTemplateColumns:"minmax(0,1fr)"}:undefined}>{isVisible("gallery") && <div className={s.gallery}>
        <button className={s.mainPhoto} onClick={() => {setGalleryIndex(0); setDialog("gallery");}} aria-label={`Open ${tour.title} photo gallery`}><Image src={photos[0]} alt={tour.title} fill priority sizes="(max-width: 700px) 440px, (max-width: 1100px) 65vw, 634px" /></button>
        <div className={s.gallerySide}>{photos.length>1 && <button className={s.secondaryPhoto} onClick={() => {setGalleryIndex(1);setDialog("gallery");}} aria-label="View all tour photos"><Image src={photos[1]} alt={tour.title} fill sizes="(max-width: 700px) 222px, 340px" /><span><Asset name="2032-4167-imgClarityImageGalleryLine" />View all</span></button>}
          {isVisible("reviews") && isVisible("featuredReview") && tour.reviews[0] && <a className={s.quote} href="#reviews" aria-label="Read traveller reviews"><Asset name="2032-4282-img" /><p>{tour.reviews[0].text}</p><footer>{tour.reviews[0].name} | {tour.reviews[0].date}<div><span className={s.blueStars} role="img" aria-label={`${tour.reviews[0].rating} out of 5 stars`}>{Array.from({length: tour.reviews[0].rating}, (_, i) => <Asset key={i} name="2032-4282-imgIcon" />)}</span><span>{tour.reviews[0].rating} - {tour.reviews[0].rating === 5 ? "Excellent" : "Traveller rating"}</span></div></footer></a>}
        </div>
      </div>}{isVisible("enquiry") && <EnquiryForm title={tour.title} message={message} onReady={setNotice} />}</div>
      <div className={s.contentColumn}>
        {isVisible("navigation") && visibleTabs.length>0 && <nav className={s.tabs} aria-label="Trip sections">{visibleTabs.map(label => <a key={label} href={`#${sectionId(label)}`} aria-current={active === sectionId(label) ? "location" : undefined}>{label}</a>)}</nav>}
        {(isVisible("overview") || isVisible("highlights")) && <section id="overview" ref={overviewRef} className={s.overview}><Heading>Trip Highlights</Heading>{isVisible("overview") && (tour.overview ? <p className={s.overviewCopy}>{overviewOpen || tour.overview.length <= 400 ? tour.overview : `${tour.overview.slice(0, 400)}…`} {tour.overview.length > 400 && <button aria-expanded={overviewOpen} onClick={() => setOverviewOpen(!overviewOpen)}>{overviewOpen ? "Read less" : "Read more"}</button>}</p> : <MissingDetail onEnquire={enquire} />)}{isVisible("highlights") && <ul className={s.highlights}>{tour.highlights.map(text => <li key={text}><Asset name="2032-4691-imgIcon" />{text}</li>)}</ul>}</section>}
        {isVisible("itinerary") && <Itinerary tour={tour} enquire={enquire} />}
        <div className={s.inclusionsGrid} style={!isVisible("inclusions")||!isVisible("exclusions")?{gridTemplateColumns:"minmax(0,1fr)"}:undefined}>{isVisible("inclusions") && <section id="inclusions"><Heading>What&apos;s inside the package?</Heading><h3>Inclusions</h3><div className={s.desktop}><Checklist items={tour.inclusions} /></div><div className={s.mobile}><Checklist items={tour.mobileInclusions} /></div></section>}{isVisible("exclusions") && <section id="exclusions"><h3>Exclusions</h3><div className={s.desktop}><Checklist items={tour.exclusions} excluded /></div><div className={s.mobile}><Checklist items={tour.mobileExclusions} excluded /></div></section>}</div>
        {isVisible("faqs") && <section id="faqs" className={s.faqs}><details className={s.faqWrapper} ref={faqRef} open><summary><Heading>FAQs</Heading><img className={s.mobile} src="/figma/itinerary/policy-chevron.svg" alt="" /></summary><div className={s.faqList}>{tour.faqs.map((faq, i) => <details key={faq.question} open={i === 0}><summary>{faq.question}<img className={s.faqChevron} src="/figma/itinerary/faq-chevron.svg" alt="" /></summary>{faq.answer ? <p>{faq.answer}</p> : <MissingDetail onEnquire={enquire} />}</details>)}</div></details></section>}
{isVisible("reviews") && <section id="reviews" className={s.reviews}><Heading action={<div className={s.reviewHeadingActions}><button className={s.writeReviewButton} onClick={() => setWriteReviewOpen(true)}><img src="/figma/review/pen.svg" alt="" />Write a review</button></div>}>Reviews ({reviewCount})</Heading><div className={s.reviewSummary}><div className={s.summaryTop}><div className={s.score}><small>{reviewCount?'Traveller rating':'No reviews yet'}</small><strong>{reviewCount?average.toFixed(1):'—'}</strong><Stars rating={average} /></div><div className={s.histogram}>{sentiment.map((value, i) => <div key={i}><b>{value}%</b><span className={value ? s.fullBar : s.emptyBar} /><img src={`/figma/itinerary/sentiment-${i}.png`} alt={["Positive", "Neutral", "Negative"][i]} /></div>)}</div></div><div className={s.googleReviews}><a href="https://www.google.com/search?q=Deshaatan+Private+Limited+reviews" target="_blank" rel="noreferrer"><img src="/figma/itinerary/google.svg" alt="" />Read all reviews on Google<img src="/figma/itinerary/external-link.svg" alt="" /></a><p>Reviews for Deshaatan Private Limited, collected by Google.</p></div></div><div className={`${s.reviewCards} ${allReviews ? s.allReviews : ""}`}>{tour.reviews.map((review, i) => <ReviewCard key={review.name} review={review} index={i} />)}</div>{reviewCount>0 && <button className={s.allReviewsButton} onClick={() => setAllReviews(!allReviews)}>{allReviews ? "Show fewer reviews" : "See all reviews"}</button>}</section>}
        {isVisible("signup") && <div className={s.signup}><Asset name="2032-4503-imgVector" /><strong>Sign up to enjoy 10% off your first 2 bookings</strong><button className={s.signupButton} onClick={() => setModal({kind:"login",title:"Welcome to Deshaatan"})}>Sign up now</button><a className={s.signupTerms} href="/terms-and-conditions">T&amp;Cs apply</a></div>}
        {isVisible("policies") && <section className={s.policies} aria-label="Booking policies">{tour.policies?.map((policy, i) => <details key={`${policy.title}-${i}`}><summary>{policy.title}<img className={s.policyChevron} src="/figma/itinerary/policy-chevron.svg" alt="" /></summary>{policy.content ? <p style={{whiteSpace: 'pre-line'}}>{policy.content}</p> : <MissingDetail onEnquire={enquire} />}</details>)}</section>}
      </div>
      {isVisible("related") && <section className={s.related}>
        <div className={s.relatedHeading}>
          <h2>Related Destinations in India</h2>
          <DurationTabs value={relatedDuration} onChange={setRelatedDuration} className={s.durationTabs} label="Related trip duration" />
          <div className={s.relatedArrows}><img src="/figma/itinerary/related-arrows.svg" alt="" /><button aria-label="Previous related destinations" onClick={() => relatedRef.current?.scrollBy({left:-371, behavior:"smooth"})} /><button aria-label="Next related destinations" onClick={() => relatedRef.current?.scrollBy({left:371, behavior:"smooth"})} /></div>
        </div>
        <div className={s.relatedCards} ref={relatedRef} aria-live="polite">{related.map(({title, days, price, previousPrice, id, image, index: i}) => <article key={id}>
          <div className={s.relatedMedia}><button className={s.relatedPhoto} onClick={() => {setModal({kind:"enquiry",title});}}><Image src={image.startsWith("/")||image.startsWith("http")?image:`/figma/packages/${image}`} alt={title} width={336} height={336} sizes="(max-width: 700px) 270px, 336px" /><img className={s.relatedDots} src={`/figma/${["imgGroup598","imgGroup601","imgGroup602","imgGroup599"][i]}.svg`} alt="" /></button><ShareMenu title={title} icon="imgShare2" onCopy={async name => {try {await navigator.clipboard.writeText(`${name} — ${window.location.origin}/#destinations`);setNotice("Package link copied.");} catch {setNotice("You can share this page using the address in your browser.");}}} /></div>
          <div className={s.relatedMeta}><b>4.5 <small>/5</small></b><span>│ {String(days).padStart(2, "0")} days & {String(days - 1).padStart(2, "0")} nights</span></div>
          <h3>{title}</h3>
          <div className={s.relatedPrice}><div><del>₹{previousPrice.toLocaleString("en-IN")}</del><p><strong>₹{price.toLocaleString("en-IN")}</strong><small>per person</small></p></div><button onClick={() => {setModal({kind:"enquiry",title});}}>Request Callback</button></div>
        </article>)}</div>
      </section>}
      <div className={s.cityLinks}>{linkSections.filter((_,i)=>isVisible(i===0?"attractions":"activities")).map((section,i) => <section key={i}><h2>{section.title}</h2><TourLinks links={section.links} onEnquire={title => setModal({kind:"enquiry",title})} /></section>)}</div>
      <div className={s.mobileRelated}>{linkSections.filter((_,i)=>isVisible(i===0?"attractions":"activities")).map((section,i) => <details key={i}><summary>{section.title}<img src="/figma/itinerary/policy-chevron.svg" alt="" /></summary><TourLinks links={section.links} onEnquire={title => setModal({kind:"enquiry",title})} /></details>)}</div>
    </main>
    <SiteFooter onInfo={openInfo} onRentCar={() => setModal({kind:"car-rental",title:"Rent A Car"})} />
    <FloatingEnquiry labels={visibleTabs.filter(label=>label!=="Exclusions")} visible={floating&&isVisible("floatingEnquiry")} active={active} price={tour.price} enquire={enquire} />
    <dialog className={s.dialog} ref={dialogRef} onCancel={() => setDialog(null)} onClick={event => {if (event.target === event.currentTarget) setDialog(null);}} aria-label={`${tour.title} photo gallery`} onKeyDown={event => {if (dialog === "gallery" && ["ArrowLeft", "ArrowRight"].includes(event.key)) {event.preventDefault();setGalleryIndex(i => (i + (event.key === 'ArrowLeft' ? -1 : 1) + photos.length) % photos.length);}}}><button className={s.closeDialog} aria-label="Close dialog" onClick={() => setDialog(null)}>×</button>{dialog === "gallery" ? <div className={s.lightbox}><Image src={photos[galleryIndex]} alt={`${tour.title} photo ${galleryIndex + 1}`} width={1200} height={900} sizes="90vw" /><div><button aria-label="Previous photo" onClick={() => setGalleryIndex(i => (i - 1 + photos.length) % photos.length)}>‹</button><span>{galleryIndex + 1} / {photos.length}</span><button aria-label="Next photo" onClick={() => setGalleryIndex(i => (i + 1) % photos.length)}>›</button></div></div> : null}</dialog>
    <SiteDialog modal={modal} setModal={setModal} onNotice={setNotice} />
    {notice && <div className={s.notice} role="status">{notice}</div>}
  </div>;
}

"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "./site-chrome";
import {SiteDialog, EnquiryFields, type Modal} from "./site-dialog";
import {religious, guides, type Trip} from "@/data/travel-catalog";
import { ShareMenu } from "./share-menu";
import HomepageMotion from "./homepage-motion";
import MobileHero from "./mobile-hero";
import { tourPackages } from "@/data/tour-packages";
import DurationTabs, { matchesTripDuration } from "./duration-tabs";

const asset = (name: string, extension = "svg") => `/figma/${name}.${extension}`;
function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={asset(name)} alt="" />;
}
const categories = ["Adventure", "Beach", "Family", "Honeymoon", "Luxury", "Cars", "Solo"];
const banners = ["imgImage8", "imgImageNol", "imgImage9", "imgImage10", "imgImage11", "imgImage12", "imgImageNol1", "imgImage13", "imgImage14", "imgImageX6", "imgImage15", "imgImage16", "imgImage50", "imgImageNol2", "imgImage17"];
const cities = [["Delhi", "Mumbai", "Banagalore"], ["Pune", "Kolkata", "Chennai"], ["Chennai", "Hyderabad", "Ahmedabad"]];
const testimonials = [
  { name: "Harshit Gupta", role: "Entrepreneur", text: "Deshaatan helped me find the perfect place for our first outdoor adventure. The team responded quickly and shared useful details about the destination, its history, and its best experiences." },
  { name: "Priya Sharma", role: "Marketing Consultant", text: "Our Kashmir holiday felt effortless from the first call. Every stay, transfer, and local experience was thoughtfully planned, while the team remained available whenever we needed help." },
  { name: "Rahul Mehta", role: "Frequent Traveller", text: "The itinerary balanced famous sights with quieter local discoveries beautifully. We never felt rushed, and each recommendation genuinely matched how our family likes to travel." },
];
const aboutPreview = "Obsessed with empowering travellers with better vacation deals, Deshaatan connects people with trusted local travel experts. With 650+ specialists, we have helped more than 10 Lac travellers plan international holidays and memorable journeys across India.";
const aboutFull = "Obsessed with the idea of empowering travellers with the best vacation deals, Deshaatan is a product of Holiday Triangle Travel Pvt. Ltd. We are an online marketplace that connects travellers with multiple local travel agents. With the help of 650+ local travel experts, Deshaatan has catered to more than 10 Lac travellers across international holidays and domestic tours in India.";


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
  return <article className="package-card">
    <div className={`package-image ${trip.crop ? "golden-crop" : ""}`}>
      {trip.href ? <Link href={trip.href} aria-label={`View ${trip.title}`}><Image className="package-photo" src={trip.image.startsWith("/") ? trip.image : asset(trip.image, "png")} alt={trip.title} width={486} height={486} sizes="(max-width: 600px) 90vw, 486px" /></Link> : <Image className="package-photo" src={trip.image.startsWith("/") ? trip.image : asset(trip.image, "png")} alt={trip.title} width={486} height={486} sizes="(max-width: 600px) 90vw, 486px" />}
      <ShareMenu title={trip.title} icon={["imgFrame34", "imgFrame32"].includes(trip.image) ? "imgShare3" : "imgShare2"} onCopy={share} />
      <Icon name={trip.dots} className="photo-dots" />
    </div>
    <div className="trip-meta"><span className="rating">4.5 <small>/5</small></span><span>| &nbsp;{trip.days ? `${String(trip.days).padStart(2, "0")} days & ${String(trip.days - 1).padStart(2, "0")} nights` : duration === 1 ? "05 days & 04 nights" : "06 days & 05 nights"}</span></div>
    {trip.href ? <Link className="trip-title" href={trip.href}>{trip.title}</Link> : <button className="trip-title" onClick={() => enquire(trip.title)}>{trip.title}</button>}
    <div className="price-row"><div className="price"><del>₹{(trip.previousPrice ?? 12952).toLocaleString("en-IN")}</del><div><strong>₹{(trip.price ?? 8952).toLocaleString("en-IN")}</strong><span>per person</span></div></div><button className="callback" onClick={() => enquire(trip.title)}>Request Callback</button></div>
  </article>;
}

export default function Home() {
  const [slide, setSlide] = useState(13);
  const [playing, setPlaying] = useState(false);
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
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setSlide(v => (v + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [playing]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 5000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (testimonialPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setTestimonial(value => (value + 1) % testimonials.length), 7000);
    return () => window.clearInterval(timer);
  }, [testimonialPaused]);
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
      setItineraryResult({success:true, message:"Your itinerary request has been submitted successfully."});
      form.reset();
    } catch (error) {
      setItineraryResult({success:false, message:error instanceof Error ? error.message : "We couldn’t submit your request. Please try again."});
    } finally { setSubmittingItinerary(false); }
  }
  const visibleTrips: Trip[] = tourPackages
    .filter(trip => matchesTripDuration(trip.days, duration)
      && (!category || !["Adventure", "Beach", "Honeymoon"].includes(category) || trip.types.includes(category)))
    .map(trip => ({...trip, image: `/figma/packages/${trip.image}`, dots: "imgGroup598", category: trip.types[0]}));
  const charDham = tourPackages.find(trip => trip.id === "char-dham");
  const showCharDham = matchesTripDuration(charDham?.days, religiousDuration);
  const visibleReligiousTrips = religious.filter(trip => matchesTripDuration(trip.days, religiousDuration));
  const religiousCount = visibleReligiousTrips.length + Number(showCharDham);
  return <>
    <HomepageMotion />
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader home onAction={(kind, title) => setModal({kind, title})} />
    <main id="main">
      <section className="hero" aria-label="Explore India">
        <div className="hero-track">{[-1, 0, 1].map(offset => <div className={`hero-panel ${offset === -1 ? "previous" : offset === 1 ? "next" : "current"}`} key={offset}><img src={asset(banners[(slide + offset + banners.length) % banners.length], "png")} alt={offset === 0 ? "Explore India — timeless places, endless experiences" : ""} fetchPriority="high" /></div>)}</div>
        <div className="hero-controls"><button className="hero-arrow left" aria-label="Previous banner" onClick={() => setSlide((slide + 14) % 15)}><Icon name="imgIcon2" /></button><button className="hero-arrow right" aria-label="Next banner" onClick={() => setSlide((slide + 1) % 15)}><Icon name="imgIcon3" /></button>
          <div className="carousel-status"><button aria-label={playing ? "Pause slideshow" : "Play slideshow"} onClick={() => setPlaying(!playing)}><Icon name="imgIcon4" /></button><span>{((slide + 11) % 15) + 1} / 15 <Icon name="imgVector" /></span></div>
        </div>
      </section>
      <MobileHero />
      <div className="categories-wrap"><div className="categories content">{categories.map((label, i) => <button key={label} className={category === label ? "category active" : "category"} aria-pressed={category === label} onClick={() => { setCategory(category === label ? "" : label); if (!["Adventure", "Beach", "Honeymoon"].includes(label)) enquiry(label + " holiday"); }}><span className={`category-icon category-${i}`}><img src={asset("imgImage" + (i + 1), "png")} alt="" />{i === 3 && <Icon name="imgIcon1" className="heart-detail" />}</span><span>{label}</span></button>)}</div><Icon name="imgVector11" className="category-divider" /></div>
      <section id="destinations" className="popular content">
        <div className="section-heading"><h1>Popular Destinations in India</h1><DurationTabs value={duration} onChange={setDuration} /><CarouselArrows target={destinationTrack} label="destinations" count={visibleTrips.length} /></div>
        <div className="packages-grid home-carousel-track" ref={destinationTrack} aria-live="polite">{visibleTrips.map(trip => <PackageCard key={trip.title} trip={trip} duration={duration} enquire={enquiry} share={share} />)}</div>
        {!visibleTrips.length && <p role="status">No trips match this duration and category. <button className="view-all" onClick={() => setCategory("")}>Clear category filter</button></p>}
      </section>
      <section id="guides" className="guides content"><div className="section-heading"><h2>The Ultimate India Travel Guide</h2><CarouselArrows target={guideTrack} label="guides" count={guides.length} /></div>
        <div className="guides-grid home-carousel-track" ref={guideTrack}>{guides.map((name, i) => <button className="guide-card" key={name} onClick={() => setModal({ kind: "guide", title: name })}><span className="guide-image"><img src={asset("imgImageMunnar" + (i || ""), "png")} alt={`${name} travel guide`} /></span><div className="guide-copy"><h3>{name}</h3><p>Forests, waterfalls, caves and relaxed hill-country stays.</p><span>Explore {name} <b>→</b></span></div></button>)}</div>
      </section>
      <section id="religious" className="religious"><div className="religious-backdrop" /><div className="content religious-content"><div className="section-heading"><h2>Explore Religious packages</h2><DurationTabs value={religiousDuration} onChange={setReligiousDuration} /><CarouselArrows target={religiousTrack} label="religious packages" count={religiousCount} /></div>
        <div className="packages-grid home-carousel-track" ref={religiousTrack} aria-live="polite">{showCharDham && <article className="featured-trip"><img className="featured-photo" src={asset("imgRectangle9", "png")} alt="Kedarnath temple in the Himalayas" /><ShareMenu title="Char Dham Yatra Package 2024" icon="imgShare4" onCopy={share} /><button className="featured-copy" onClick={() => enquiry("Char Dham Yatra Package 2024")}><strong>Char Dham Yatra</strong><span>Package 2024</span><small>{charDham?.days} days - {(charDham?.days ?? 1) - 1} Nights</small></button><button className="featured-callback" onClick={() => enquiry("Char Dham Yatra Package 2024")}>Request Callback</button></article>}{visibleReligiousTrips.map(trip => <PackageCard key={trip.title} trip={trip} duration={religiousDuration} enquire={enquiry} share={share} />)}</div>
        {!religiousCount && <p role="status">No religious packages match this duration. <button type="button" onClick={() => setReligiousDuration(-1)}>Clear duration filter</button></p>}
      </div></section>
      <section className="testimonials content" onMouseEnter={() => setTestimonialPaused(true)} onMouseLeave={() => setTestimonialPaused(false)} onFocusCapture={() => setTestimonialPaused(true)} onBlurCapture={() => setTestimonialPaused(false)}><div className="testimonial-heading"><p>TESTIMONIALS</p><h2><span className="desktop-only">What People Say<br />About Us.</span><span className="mobile-only">What people say about us.</span></h2></div><div className="testimonial-card" aria-live="polite"><img className="avatar" src={asset("imgImage", "png")} alt="" /><div className="testimonial-story" key={testimonial}><p>{testimonials[testimonial].text}</p><Icon name="imgStar" className="stars" /><strong>{testimonials[testimonial].name}</strong><small>{testimonials[testimonial].role}</small></div><div className="testimonial-controls"><button aria-label="Previous testimonial" onClick={() => setTestimonial(value => (value + testimonials.length - 1) % testimonials.length)}><Icon name="imgArrowBtn8" className="flip-arrow" /></button><button aria-label="Next testimonial" onClick={() => setTestimonial(value => (value + 1) % testimonials.length)}><Icon name="imgArrowBtn2" /></button></div></div></section>
      <section id="itinerary" className="itinerary"><div className="content"><h2>Get a Custom <span>Deshaatan</span> Itinerary</h2><p>Tell us the basics and our team can take it from there.</p><form className="itinerary-form" onSubmit={submitEnquiry} aria-busy={submittingItinerary}><fieldset className="itinerary-fieldset" disabled={submittingItinerary}><EnquiryFields prefix="itinerary-" travelDetails /></fieldset><div className="form-actions"><button type="submit" className="primary-button" disabled={submittingItinerary}>{submittingItinerary ? "Submitting…" : "Request My Itinerary"}<Icon name="imgItalicText1" /></button><a className="whatsapp-button" href="https://wa.me/?text=Hello%20Deshaatan%2C%20I%20would%20like%20to%20plan%20a%20trip." target="_blank" rel="noreferrer"><Icon name="imgGroup1" />Chat on WhatsApp</a></div>{itineraryResult && <p className={`itinerary-result ${itineraryResult.success ? "success" : "error"}`} role={itineraryResult.success ? "status" : "alert"}>{itineraryResult.message}</p>}<div className="form-promises"><span>100% Customisable</span><span>Fast 15-Min Response</span><span>No Booking Obligation</span></div></form></div></section>
      <section id="about" className="about content"><h2>Who We Are?</h2><div className={expanded ? "about-copy expanded" : "about-copy"}><p>{expanded ? aboutFull : aboutPreview} <button className="about-toggle" onClick={() => setExpanded(!expanded)}>{expanded ? "Read less" : "Read more"}</button></p></div>{[0, 1].map(group => <div className="city-links" key={group}><h2>Kerala Packages from Top Cities</h2><Icon name="imgVector16" /><div className="city-columns">{cities.map((column, index) => <div key={index}>{column.map(city => <button key={city} onClick={() => enquiry("Kerala Package From " + city)}>Kerala Packages From {city}</button>)}</div>)}</div></div>)}</section>
      <div className="mobile-city-links mobile-only">{[0, 1].map(group => <details key={group}><summary>Kerala Packages from Top Cities</summary><div>{cities.flat().map((city, i) => <button key={i} onClick={() => enquiry("Kerala Package From " + city)}>Kerala Packages From {city}</button>)}</div></details>)}</div>
      <section className="airport-transfer content" aria-label="Airport transfers"><img className="airport-decoration" src={asset("desktop-imgContainer5", "png")} alt="" /><img className="airport-car" src={asset("desktop-imgContainer6", "png")} alt="Airport transfer car" /><div><h2>Book airport transfers. Across India.</h2><p>Relax with easy pick-up and drop-off at the airport or your hotel.</p></div><button onClick={() => setModal({kind:"airport-transfer",title:"Airport transfer"})}>Book Now</button></section>
    </main>
    <SiteFooter onInfo={title => setModal({kind: "info", title})} onRentCar={() => setModal({kind:"car-rental",title:"Rent A Car"})} />
    <SiteDialog modal={modal} setModal={setModal} onNotice={setNotice} />
    {notice && <div className="toast" role="status">{notice}</div>}
  </>;
}

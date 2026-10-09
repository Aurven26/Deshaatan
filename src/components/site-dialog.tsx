"use client";
import {useEffect, useRef, type FormEvent} from "react";
import {guides} from "@/data/travel-catalog";
import TravellerCountField from "./traveller-count-field";
import VehicleEnquiryForm from "./vehicle-enquiry-form";
import AuthPopup from "./auth-popup";
import authStyles from "./auth-popup.module.css";
import SearchPopup from "./search-popup";
const asset = (name: string, extension = "svg") => `/figma/${name}.${extension}`;
function Icon({name,className=""}: {name:string;className?:string}) {return <img className={`icon ${className}`} src={asset(name)} alt=""/>;}
const categories = ["Adventure", "Beach", "Family", "Honeymoon", "Luxury", "Cars", "Solo"];
export type Modal = { kind: "enquiry" | "airport-transfer" | "car-rental" | "search" | "info" | "guide" | "login"; title: string };
export function EnquiryFields({prefix, travelDetails = false}: {prefix: string; travelDetails?: boolean}) {
    return <div className={`form-fields${travelDetails ? " itinerary-fields" : ""}`}>
      <label htmlFor={prefix + "name"}>{travelDetails ? "PASSENGER NAME" : "YOUR NAME"}<input id={prefix + "name"} name="name" autoComplete="name" placeholder={travelDetails ? "Passenger name" : "Your name"} maxLength={100} required /></label>
      <label htmlFor={prefix + "phone"}>PHONE NUMBER<span className="phone-field"><span className="phone-prefix"><Icon name="imgGroup1171275144" />+91 <Icon name="imgBxsRightArrow" className="tiny-down" /></span><input id={prefix + "phone"} name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Phone number" pattern="[0-9]{10}" title="Enter a 10-digit Indian phone number" required /></span></label>
      {travelDetails && <><label htmlFor={prefix + "origin"}>ORIGIN CITY<input id={prefix + "origin"} name="origin" autoComplete="address-level2" placeholder="Starting city" maxLength={100} required /></label><label htmlFor={prefix + "destination"}>DESTINATION<input id={prefix + "destination"} name="destination" placeholder="Where would you like to go?" maxLength={100} required /></label></>}
      <label className={travelDetails ? "planning-field" : undefined} htmlFor={prefix + "duration"}>TRIP DURATION<select id={prefix + "duration"} name="duration" defaultValue="" required={travelDetails}><option value="" disabled>Trip duration</option><option>3 nights / 4 days</option><option>4 nights / 5 days</option><option>5 nights or more</option></select></label>
      <label className={travelDetails ? "planning-field" : undefined} htmlFor={prefix + "style"}>TRAVEL STYLE<select id={prefix + "style"} name="style" defaultValue="" required={travelDetails}><option value="" disabled>Travel style</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      {travelDetails && <div className="planning-field travellers-field"><label htmlFor={prefix + "travellers"}>NUMBER OF TRAVELLERS</label><TravellerCountField id={prefix + "travellers"} label="Number of Travellers" placeholder="Traveller count" className="home-traveller-control" /></div>}
    </div>;
  }

export function SiteDialog({modal,setModal,onNotice}: {modal: Modal|null;setModal:(modal:Modal|null)=>void;onNotice:(notice:string)=>void}) {
const dialog=useRef<HTMLDialogElement>(null);
const enquiry=(title:string)=>setModal({kind:"enquiry",title});
useEffect(()=>{if(modal) dialog.current?.showModal();else dialog.current?.close();},[modal]);
  function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `Hello Deshaatan,\n\nI would like to plan a trip.\nName: ${data.get("name")}\nPhone: +91 ${data.get("phone")}\nDuration: ${data.get("duration") || "Please advise"}\nTravel style: ${data.get("style") || "Please advise"}\nPackage: ${modal?.title || "Custom itinerary"}\n\nPlease contact me with more details.`;
    window.location.href = `mailto:care@deshaatan.com?subject=${encodeURIComponent("My Deshaatan travel enquiry")}&body=${encodeURIComponent(body)}`;
    onNotice("Your enquiry is ready in your email app. Send it there to contact the team.");
  }

if(modal?.kind === "search") return <SearchPopup onClose={() => setModal(null)} onEnquiry={enquiry} onGuide={title => setModal({kind:"guide",title})} />;

return (    <dialog ref={dialog} className={modal?.kind === "login" ? `modal ${authStyles.dialog}` : "modal"} aria-labelledby={modal?.kind === "login" ? "auth-popup-heading" : undefined} onCancel={() => setModal(null)} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}><button className={modal?.kind === "login" ? authStyles.close : "modal-close"} aria-label="Close dialog" onClick={() => setModal(null)}>{modal?.kind === "login" ? <img src="/figma/auth/login-imgClose.svg" alt="" /> : "×"}</button>{modal?.kind !== "login" && <h2>{modal?.title}</h2>}
      {modal?.kind === "enquiry" && <form onSubmit={submitEnquiry}><p>Tell us a little about your trip. We’ll prepare an email enquiry for the Deshaatan team.</p><EnquiryFields prefix="modal-" /><button className="primary-button" type="submit">Prepare My Enquiry<Icon name="imgItalicText1" /></button></form>}
      {(modal?.kind === "airport-transfer" || modal?.kind === "car-rental") && <VehicleEnquiryForm key={modal.kind} service={modal.kind} />}
      {modal?.kind === "guide" && <><img className="modal-guide-image" src={asset("imgImageMunnar" + (guides.indexOf(modal.title) || ""), "png")} alt={modal.title} /><p>{modal.title === "Kerala" ? "Explore tranquil backwaters, houseboats, tea gardens, and the green hills of Munnar." : modal.title === "Rajasthan" ? "Discover royal palaces, historic forts, desert landscapes, and the colourful cities of Rajasthan." : "Discover the mountain scenery, lakes, gardens, and valleys of Kashmir."}</p><button className="primary-button" onClick={() => enquiry("A trip to " + modal.title)}>Plan My Trip</button></>}
      {modal?.kind === "login" && <AuthPopup />}
      {modal?.kind === "info" && <><p>For {modal.title.toLowerCase()}, please contact the Deshaatan team.</p><a className="primary-button" href={`mailto:care@deshaatan.com?subject=${encodeURIComponent(modal.title)}`}>Email Deshaatan</a></>}
    </dialog>
);
}

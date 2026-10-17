"use client";
import {useEffect, useId, useRef, useState, type FormEvent} from "react";
import {useCMSContent} from "./cms-content";
import {homeDefaults,type HomePageContent} from "@/cms/home-defaults";
import TravellerCountField from "./traveller-count-field";
import VehicleEnquiryForm from "./vehicle-enquiry-form";
import AuthPopup from "./auth-popup";
import authStyles from "./auth-popup.module.css";
import SearchPopup from "./search-popup";
import styles from "./site-dialog.module.css";
import FooterContactForm, {footerFormTypes} from "./footer-contact-form";
const asset = (name: string, extension = "svg") => `/figma/${name}.${extension}`;
function Icon({name,className=""}: {name:string;className?:string}) {return <img className={`icon ${className}`} src={asset(name)} alt=""/>;}
const categories = ["Adventure", "Beach", "Family", "Honeymoon", "Luxury", "Cars", "Solo"];
export type Modal = { kind: "enquiry" | "airport-transfer" | "car-rental" | "search" | "info" | "guide" | "login"; title: string };
export function EnquiryFields({prefix, travelDetails = false, inDialog = false, copy}: {prefix: string; travelDetails?: boolean; inDialog?: boolean;copy?:HomePageContent["enquiry"]}) {
    const c=copy||homeDefaults.enquiry;
    return <div className={`form-fields${travelDetails ? " itinerary-fields" : ""}`}>
      <label htmlFor={prefix + "name"}>{travelDetails ? c.nameLabel : "YOUR NAME"}<input id={prefix + "name"} name="name" autoComplete="name" placeholder={travelDetails ? c.namePlaceholder : "Your name"} maxLength={100} required /></label>
      <label htmlFor={prefix + "phone"}>{copy?c.phoneLabel:"PHONE NUMBER"}<span className="phone-field"><span className="phone-prefix"><Icon name="imgGroup1171275144" />+91 <Icon name="imgBxsRightArrow" className="tiny-down" /></span><input id={prefix + "phone"} name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={copy?c.phonePlaceholder:"Phone number"} pattern="[0-9]{10}" title="Enter a 10-digit Indian phone number" required /></span></label>
      {travelDetails && <><label htmlFor={prefix + "origin"}>{c.originLabel}<input id={prefix + "origin"} name="origin" autoComplete="address-level2" placeholder={c.originPlaceholder} maxLength={100} required /></label><label htmlFor={prefix + "destination"}>{c.destinationLabel}<input id={prefix + "destination"} name="destination" placeholder={c.destinationPlaceholder} maxLength={100} required /></label></>}
      <label className={travelDetails ? "planning-field" : undefined} htmlFor={prefix + "duration"}>{copy?c.durationLabel:"TRIP DURATION"}<select id={prefix + "duration"} name="duration" defaultValue="" required={travelDetails}><option value="" disabled>{c.durationPlaceholder}</option>{c.durations.map((item,i)=><option key={i}>{item.label}</option>)}</select></label>
      {travelDetails && <label className="planning-field" htmlFor={prefix + "style"}>{c.styleLabel}<select id={prefix + "style"} name="style" defaultValue="" required><option value="" disabled>{c.stylePlaceholder}</option>{(copy?c.styles.map(item=>item.label):categories).map(label=><option key={label}>{label}</option>)}</select></label>}
      <div className={travelDetails && !inDialog ? "planning-field travellers-field" : styles.travellers}><label htmlFor={prefix + "travellers"}>{copy?c.travellersLabel:"NUMBER OF TRAVELLERS"}</label><TravellerCountField id={prefix + "travellers"} label={copy?c.travellersLabel:"Number of Travellers"} placeholder={copy?c.travellersPlaceholder:"Traveller count"} className={travelDetails && !inDialog ? "home-traveller-control" : styles.travellerControl} /></div>
    </div>;
  }

export function SiteDialog({modal,setModal,onNotice}: {modal: Modal|null;setModal:(modal:Modal|null)=>void;onNotice:(notice:string)=>void}) {
const {guideDetails}=useCMSContent();
const guide=guideDetails.find(item=>item.title===modal?.title);
const dialog=useRef<HTMLDialogElement>(null);
const headingId=useId();
const [submitting,setSubmitting]=useState(false);
const [submissionError,setSubmissionError]=useState('');
const enquiry=(title:string)=>setModal({kind:"enquiry",title});
useEffect(()=>{setSubmissionError('');if(modal) dialog.current?.showModal();else dialog.current?.close();},[modal]);
  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(submitting)return;
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setSubmissionError('');
    try{
      const response=await fetch('/api/callback-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(data),title:modal?.title})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error || 'We couldn’t save your enquiry.');
      onNotice('Your enquiry has been submitted successfully.');setModal(null);
    }catch(error){setSubmissionError(error instanceof Error?error.message:'Please try again.');}
    finally{setSubmitting(false);}
  }

if(modal?.kind === "search") return <SearchPopup onClose={() => setModal(null)} onEnquiry={enquiry} onGuide={title => setModal({kind:"guide",title})} />;

return (    <dialog ref={dialog} className={modal?.kind === "login" ? `modal ${authStyles.dialog}` : "modal"} aria-labelledby={modal?.kind === "login" ? "auth-popup-heading" : headingId} onCancel={event => {if(submitting)event.preventDefault();else setModal(null);}} onClick={e => { if (e.target === e.currentTarget && !submitting) setModal(null); }}><button className={modal?.kind === "login" ? authStyles.close : "modal-close"} aria-label="Close dialog" disabled={submitting} onClick={() => setModal(null)}>{modal?.kind === "login" ? <img src="/figma/auth/login-imgClose.svg" alt="" /> : "×"}</button>{modal?.kind !== "login" && <h2 id={headingId}>{modal?.title}</h2>}
      {modal?.kind === "enquiry" && <form onSubmit={submitEnquiry}><p>Tell us a little about your trip. A Deshaatan specialist will get in touch.</p><EnquiryFields prefix="modal-" travelDetails={modal.title === "Plan a custom trip"} inDialog />{submissionError && <p role="alert">{submissionError}</p>}<button className="primary-button" type="submit" disabled={submitting}>{submitting?'Submitting…':'Submit Enquiry'}<Icon name="imgItalicText1" /></button></form>}
      {(modal?.kind === "airport-transfer" || modal?.kind === "car-rental") && <VehicleEnquiryForm key={modal.kind} service={modal.kind} />}
      {modal?.kind === "guide" && <>{guide?.image && <img className="modal-guide-image" src={guide.image} alt={modal.title} />}<p>{guide?.summary}</p><button className="primary-button" onClick={() => enquiry("A trip to " + modal.title)}>Plan My Trip</button></>}
      {modal?.kind === "login" && <AuthPopup />}
      {modal?.kind === "info" && (footerFormTypes[modal.title] ? <FooterContactForm key={modal.title} type={footerFormTypes[modal.title]} /> : <><p>For {modal.title.toLowerCase()}, please contact the Deshaatan team.</p><a className="primary-button" href={`mailto:care@deshaatan.com?subject=${encodeURIComponent(modal.title)}`}>Email Deshaatan</a></>)}
    </dialog>
);
}

"use client";

import {useState, type FormEvent} from "react";
import TravellerCountField from "./traveller-count-field";
import s from "./site-dialog.module.css";

export const footerFormTypes:Record<string,"partner"|"application"|"corporate"> = {
  "Partner With Deshaatan":"partner", "We are Hiring":"application", "Corporate Tour":"corporate",
};

export default function FooterContactForm({type}:{type:"partner"|"application"|"corporate"}) {
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<{success:boolean;message:string}|null>(null);
  const application=type==="application", corporate=type==="corporate";
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form=event.currentTarget;
    const data=new FormData(form);
    data.set("type",type);
    const resume=data.get("resume");
    if(application && resume instanceof File && resume.size>2*1024*1024){setResult({success:false,message:"Please upload a PDF resume smaller than 2 MB."});return;}
    setBusy(true);setResult(null);
    try {
      const response=await fetch("/api/contact-requests",{method:"POST",body:data});
      const body=await response.json();
      if(!response.ok)throw new Error(body.error || "We couldn’t save your details. Please try again.");
      setResult({success:true,message:application ? "Your application and resume have been saved. Thank you for your interest." : "Your enquiry has been saved. Thank you for contacting Deshaatan."});
      form.reset();
    } catch(error){setResult({success:false,message:error instanceof Error?error.message:"Please try again."});}
    finally{setBusy(false);}
  }
  const prefix=`footer-${type}-`;
  return <form onSubmit={submit} aria-busy={busy}>
    <p>{application?"Tell us about yourself and the role you’re interested in.":corporate?"Share your company’s travel requirements with us.":"Tell us about your business and how you’d like to partner with Deshaatan."}</p>
    <fieldset className={s.contactFieldset} disabled={busy}>
      <div className="form-fields">
        <label htmlFor={prefix+"name"}>{corporate?"CONTACT PERSON NAME":"FULL NAME"}<input id={prefix+"name"} name="name" autoComplete="name" placeholder={corporate?"Contact person name":"Full name"} maxLength={100} required /></label>
        {!application && <label htmlFor={prefix+"company"}>{corporate?"COMPANY NAME":"BUSINESS / ORGANISATION NAME"}<input id={prefix+"company"} name="company" autoComplete="organization" placeholder="Company or business name" maxLength={150} required /></label>}
        <label htmlFor={prefix+"email"}>EMAIL<input id={prefix+"email"} name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required /></label>
        <label htmlFor={prefix+"phone"}>PHONE NUMBER<input id={prefix+"phone"} name="phone" type="tel" autoComplete="tel" placeholder="Phone number with country code" pattern="[+0-9 ()-]{7,25}" maxLength={25} required /></label>
        {application && <><label htmlFor={prefix+"position"}>POSITION APPLYING FOR<input id={prefix+"position"} name="position" placeholder="Position or role" maxLength={100} required /></label><label className={s.fullWidth} htmlFor={prefix+"resume"}>RESUME / CV<input className={s.fileInput} id={prefix+"resume"} name="resume" type="file" accept=".pdf,application/pdf" required /><span className={s.fieldHint}>PDF only, up to 2 MB.</span></label></>}
        {corporate && <div className={s.travellers}><label htmlFor={prefix+"travellers"}>NUMBER OF TRAVELLERS</label><TravellerCountField id={prefix+"travellers"} label="Number of Travellers" placeholder="Traveller count" className={s.travellerControl} /></div>}
        {type==="partner" && <><label htmlFor={prefix+"businessType"}>BUSINESS TYPE<select id={prefix+"businessType"} name="businessType" defaultValue="" required><option value="" disabled>Select business type</option>{["Travel agency","Hotel / accommodation","Transport provider","Tour operator","Individual","Other"].map(value=><option key={value}>{value}</option>)}</select></label><label htmlFor={prefix+"website"}>WEBSITE (OPTIONAL)<input id={prefix+"website"} name="website" type="url" placeholder="https://" maxLength={300} /></label><label htmlFor={prefix+"location"}>CITY / LOCATION<input id={prefix+"location"} name="location" placeholder="Where is your business based?" maxLength={150} required /></label><label className={s.fullWidth} htmlFor={prefix+"message"}>PARTNERSHIP DETAILS<textarea id={prefix+"message"} name="message" placeholder="Tell us about your services and proposed partnership" maxLength={3000} rows={4} required /></label></>}
      </div>
      <button type="submit" className="primary-button">{busy?"Submitting…":application?"Submit Application":"Submit Enquiry"}</button>
    </fieldset>
    {result && <p className={s.formResult} role={result.success?"status":"alert"}>{result.message}</p>}
  </form>;
}

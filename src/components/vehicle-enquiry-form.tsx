"use client";

import { useState, type FormEvent } from "react";
import TravellerCountField from "./traveller-count-field";
import s from "./airport-transfer-form.module.css";

export default function VehicleEnquiryForm({service}: {service:"airport-transfer" | "car-rental"}) {
  const rental = service === "car-rental";
  const prefix = rental ? "rental" : "airport";
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{success:boolean; message:string} | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const details = Object.fromEntries(new FormData(form));
    setSubmitting(true);
    setResult(null);
    try {
      const response = await fetch(rental ? "/api/car-rental-requests" : "/api/airport-transfer-requests", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(details)});
      const body = await response.json();
      if (!response.ok) { setResult({success:false, message:body.error || "We couldn’t submit your enquiry. Please try again."}); return; }
      form.reset();
      setResult({success:true, message:rental ? "Your car rental enquiry has been submitted successfully." : "Your airport transfer enquiry has been submitted successfully."});
    } catch {
      setResult({success:false, message:"We couldn’t submit your enquiry. Please check your connection and try again."});
    } finally { setSubmitting(false); }
  }
  return <form className={s.form} onSubmit={submit} aria-busy={submitting}>
    <p>{rental ? "Tell us where you’re starting from and where you want to go, and we’ll arrange the right car for your trip." : "Tell us your pickup and drop-off details so we can arrange your airport transfer."}</p>
    <fieldset disabled={submitting} className={s.fieldset}>
      <div className={`form-fields ${s.fields}`}>
        <label htmlFor={`${prefix}-name`}>YOUR NAME<input id={`${prefix}-name`} name="name" autoComplete="name" placeholder="Your name" maxLength={100} required /></label>
        <label htmlFor={`${prefix}-phone`}>PHONE NUMBER<span className="phone-field"><span className="phone-prefix"><img src="/figma/imgGroup1171275144.svg" alt="" />+91</span><input id={`${prefix}-phone`} name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Phone number" pattern="[0-9]{10}" title="Enter a 10-digit Indian phone number" required /></span></label>
        <label htmlFor={`${prefix}-origin`}>{rental ? "ORIGIN CITY" : "ORIGIN AIRPORT"}<input id={`${prefix}-origin`} name={rental ? "originCity" : "originAirport"} placeholder={rental ? "Pickup city" : "Pickup airport"} maxLength={150} required /></label>
        <label htmlFor={`${prefix}-destination`}>DESTINATION<input id={`${prefix}-destination`} name="destination" placeholder={rental ? "Where would you like to go?" : "Drop-off location"} maxLength={200} required /></label>
        <div className={s.travellers}><label htmlFor={`${prefix}-travellers`}>NUMBER OF TRAVELLERS</label><TravellerCountField id={`${prefix}-travellers`} label="Number of Travellers" placeholder="Traveller count" className={s.travellerControl} /></div>
        <label htmlFor={`${prefix}-vehicle`}>VEHICLE TYPE<select id={`${prefix}-vehicle`} name="vehicleType" defaultValue="" required><option value="" disabled>Select vehicle type</option>{["Sedan", "SUV", "Premium", "Luxury"].map(type => <option key={type}>{type}</option>)}</select></label>
        <label className={s.message} htmlFor={`${prefix}-requests`}>SPECIAL REQUESTS <span>(OPTIONAL)</span><textarea id={`${prefix}-requests`} name="specialRequests" placeholder={rental ? "Let us know about luggage, number of stops, driver preferences, or other requests…" : "Let us know about luggage, accessibility needs, or other requests…"} maxLength={2000} rows={3} /></label>
      </div>
    </fieldset>
    <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Prepare My Enquiry"}<img className="icon" src="/figma/imgItalicText1.svg" alt="" /></button>
    {result && <div className={`${s.result} ${result.success ? s.success : s.error}`} role={result.success ? "status" : "alert"}>{result.message}</div>}
  </form>;
}

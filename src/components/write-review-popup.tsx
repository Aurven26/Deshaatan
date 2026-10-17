"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import s from "./write-review-popup.module.css";
import {MAX_REVIEW_PHOTO_BYTES, MAX_REVIEW_PHOTOS} from '@/lib/upload-limits';

const asset = (name:string) => `/figma/review/${name}.svg`;
const ratings = ["Terrible", "Poor", "Average", "Very good", "Excellent"];
const companions = ["Family", "Couple", "Friends", "Solo", "Business"];
type Photo = {file:File; url:string};

export default function WriteReviewPopup({title,slug,onClose}:{title:string;slug:string;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const upload=useRef<HTMLInputElement>(null);
  const photoRef=useRef<Photo[]>([]);
  const [rating,setRating]=useState(4);
  const [hoverRating,setHoverRating]=useState(0);
  const [companion,setCompanion]=useState("Family");
  const [review,setReview]=useState("");
  const [photos,setPhotos]=useState<Photo[]>([]);
  const [error,setError]=useState("");
  const [pending,setPending]=useState(false);
  const [success,setSuccess]=useState(false);
  const [months,setMonths]=useState<{value:string;label:string}[]>([]);
  const [travelMonth,setTravelMonth]=useState("");
  useEffect(()=>{
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    dialog.current?.showModal();
    const today=new Date();
    const previousMonth=new Date(today.getFullYear(),today.getMonth()-1,1);
    setTravelMonth(`${previousMonth.getFullYear()}-${String(previousMonth.getMonth()+1).padStart(2,"0")}`);
    setMonths(Array.from({length:36},(_,i)=>{const d=new Date(today.getFullYear(),today.getMonth()-i,1);return {value:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,label:d.toLocaleDateString("en-GB",{month:"long",year:"numeric"})};}));
    return ()=>{document.body.style.overflow=previousOverflow;photoRef.current.forEach(photo=>URL.revokeObjectURL(photo.url));};
  },[]);
  function addPhotos(event:ChangeEvent<HTMLInputElement>){
    const files=Array.from(event.target.files||[]);
    event.target.value="";
    if(photos.length+files.length>MAX_REVIEW_PHOTOS){setError("Please add no more than 6 photos.");return;}
    if(files.some(file=>!["image/jpeg","image/png"].includes(file.type)||!file.size)){setError("Choose valid JPG or PNG photos.");return;}
    if([...photos.map(photo=>photo.file),...files].reduce((total,file)=>total+file.size,0)>MAX_REVIEW_PHOTO_BYTES){setError("Choose photos with a combined size of 3 MB or less.");return;}
    const next=[...photos,...files.map(file=>({file,url:URL.createObjectURL(file)}))];
    photoRef.current=next;setPhotos(next);setError("");
  }
  function removePhoto(index:number){URL.revokeObjectURL(photos[index].url);const next=photos.filter((_,i)=>i!==index);photoRef.current=next;setPhotos(next);}
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(pending)return;
    if(review.trim().length<50){setError("Please write at least 50 characters about your trip.");return;}
    setPending(true);setError("");
    const data=new FormData(event.currentTarget);data.set("tour",slug);data.set("rating",String(rating));data.set("companion",companion);photos.forEach(photo=>data.append("photos",photo.file));
    try{const response=await fetch("/api/reviews",{method:"POST",body:data});const result=await response.json();if(!response.ok)throw new Error(result.error||"We couldn’t submit your review. Please try again.");setSuccess(true);}
    catch(e){setError(e instanceof Error?e.message:"We couldn’t submit your review. Please try again.");}
    finally{setPending(false);}
  }
  return <dialog ref={dialog} className={s.dialog} aria-labelledby="write-review-title" onCancel={event=>{if(pending)event.preventDefault();else onClose();}} onClick={event=>{if(event.target===event.currentTarget&&!pending)onClose();}}>
    <header className={s.header}><div><h2 id="write-review-title">Write a review</h2><p>{title}</p></div><button className={s.close} type="button" aria-label="Close review popup" disabled={pending} onClick={onClose}><img src={asset("close")} alt="" /></button></header>
    {success?<div className={s.success} role="status"><h3>Thank you for your review!</h3><p>Your review has been submitted successfully and is awaiting review before publication.</p><button className={s.primary} onClick={onClose}>Done</button></div>:<form onSubmit={submit}>
      <div className={s.body}>
        <div className={s.overall}><div><strong>How was your trip overall? <em>*</em></strong><p>Tap the stars to rate</p></div><div className={s.rating}><div className={s.stars} role="group" aria-label="Overall trip rating" onMouseLeave={()=>setHoverRating(0)}>{ratings.map((label,i)=><button type="button" key={label} aria-label={`${i+1} ${i===0?"star":"stars"}: ${label}`} aria-pressed={rating===i+1} onMouseEnter={()=>setHoverRating(i+1)} onFocus={()=>setHoverRating(i+1)} onBlur={()=>setHoverRating(0)} onClick={()=>setRating(i+1)}><img src={asset(i<(hoverRating||rating)?"star-filled":"star-empty")} alt="" /></button>)}</div><strong>{ratings[(hoverRating||rating)-1]}</strong></div></div>
<div className={s.tripDetails}><label className={s.field}>When did you travel? <em>*</em><span className={s.select}><select name="travelMonth" required value={travelMonth} onChange={event=>setTravelMonth(event.target.value)}>{months.map(month=><option key={month.value} value={month.value}>{month.label}</option>)}</select><img src={asset("chevron")} alt="" /></span></label><fieldset className={s.companions}><legend>Who did you travel with?</legend><div>{companions.map(value=><button key={value} type="button" aria-pressed={value===companion} onClick={()=>setCompanion(value)}>{value}</button>)}</div></fieldset></div>
        <label className={s.field}>Give your review a title <em>*</em><input name="title" placeholder={'e.g. "Well planned trip, great guide in Agra"'} maxLength={150} required /></label>
        <div><label className={s.field}>Your review <em>*</em><textarea name="review" placeholder="Tell other travellers what you loved and what could be better: hotels, drivers, guides, food, pacing…" minLength={50} maxLength={1000} required value={review} onChange={event=>setReview(event.target.value)} /></label><div className={s.helper}><span>Minimum 50 characters</span><span>{review.length} / 1000</span></div></div>
        <div className={s.photos}><div><strong>Add photos</strong><span>Optional · up to 6 · JPG or PNG · 3 MB total</span></div><div className={s.photoRow}><input ref={upload} type="file" accept="image/jpeg,image/png" multiple aria-label="Upload review photos" onChange={addPhotos} hidden /><button className={s.upload} type="button" disabled={photos.length>=6} onClick={()=>upload.current?.click()}><img src={asset("plus")} alt="" />Upload</button>{photos.map((photo,i)=><div className={s.photo} key={photo.url}><img src={photo.url} alt={`Your trip photo ${i+1}`} /><button type="button" aria-label={`Remove photo ${i+1}`} onClick={()=>removePhoto(i)}><img src={asset("remove")} alt="" /></button></div>)}</div></div>
        <div className={s.details}><label className={s.field}>Your name <em>*</em><input name="name" autoComplete="name" placeholder="Name shown on your review" maxLength={100} required /></label><div><label className={s.field}>Booking ID<input name="bookingId" placeholder="e.g. DSH-24816" maxLength={50} /></label><p className={s.verified}><img src={asset("verified")} alt="" />Add it to get a &quot;Verified traveller&quot; badge</p></div></div>
        <label className={s.consent}><input type="checkbox" name="consent" required /><span className={s.checkbox}><img src={asset("tick")} alt="" /></span><span>I confirm this review is about my own experience, and I have permission to share any photos that show other people.</span></label>
        {error&&<p className={s.error} role="alert">{error}</p>}
      </div>
      <footer className={s.footer}><p><img src={asset("shield")} alt="" />We never remove a review just because it is negative.</p><button type="button" className={s.cancel} disabled={pending} onClick={onClose}>Cancel</button><button type="submit" className={s.primary} disabled={pending}>{pending?"Submitting…":"Submit review"}</button></footer>
    </form>}
  </dialog>;
}

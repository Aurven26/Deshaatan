"use client";

import { useEffect, useId, useRef, useState } from "react";
import s from "./tour-detail.module.css";

export default function TravellerCountField({id: suppliedId, label = "Traveller Count", placeholder = "Traveller Count *", className = "", initialAdults = 1, initialSelected = false, compactSummary = false, chevronSrc = "/figma/itinerary/date-chevron.svg"}: {id?:string; label?:string; placeholder?:string; className?:string; initialAdults?:number; initialSelected?:boolean; compactSummary?:boolean; chevronSrc?:string}) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(0);
  const [selected, setSelected] = useState(initialSelected);
  useEffect(() => {
    const form = root.current?.closest("form");
    const reset = () => {setAdults(initialAdults); setChildren(0); setSelected(initialSelected); setOpen(false);};
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [initialAdults, initialSelected]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return <div ref={root} className={`${s.compactField} ${className}`} onKeyDown={event => {
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
  }}>
    <input type="hidden" name="adults" value={adults} />
    <input type="hidden" name="children" value={children} />
    <input type="hidden" name="travellers" value={adults + children} />
    <button ref={trigger} id={id} className={s.travellerToggle} type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={`${id}-travellers`} data-empty={!selected} onClick={() => {
      if (!open && root.current) {
        const bounds = root.current.getBoundingClientRect();
        const dialogBounds = root.current.closest("dialog")?.getBoundingClientRect();
        const bottom = Math.min(window.innerHeight, dialogBounds?.bottom ?? window.innerHeight);
        const top = Math.max(0, dialogBounds?.top ?? 0);
        setOpenAbove(bottom - bounds.bottom < 190 && bounds.top - top >= 190);
      }
      setOpen(!open);
    }}>
      <span>{selected ? compactSummary && !children ? `${adults} ${adults === 1 ? "Adult" : "Adults"}` : `${adults} ${adults === 1 ? "adult" : "adults"}, ${children} ${children === 1 ? "child" : "children"}` : placeholder}</span>
      <img src={chevronSrc} alt="" />
    </button>
    {open && <div className={s.travellerPicker} id={`${id}-travellers`} role="dialog" aria-label="Choose travellers" data-placement={openAbove ? "above" : "below"}>
      {[{label:"Adults", value:adults, minimum:1, update:setAdults}, {label:"Children", value:children, minimum:0, update:setChildren}].map(({label,value,minimum,update}) => <div className={s.travellerRow} key={label}>
        <span>{label}</span>
        <div className={s.travellerStepper}>
          <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value === minimum} onClick={() => {update(value - 1); setSelected(true);}}><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></button>
          <output aria-label={`${label} count`} aria-live="polite">{value}</output>
          <button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={adults + children >= 99} onClick={() => {update(value + 1); setSelected(true);}}><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></button>
        </div>
      </div>)}
      <button className={s.travellerDone} type="button" onClick={() => {setSelected(true); setOpen(false); trigger.current?.focus();}}>Done</button>
    </div>}
  </div>;
}

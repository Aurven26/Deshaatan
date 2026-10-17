'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import type {Lead} from '@/payload-types';
import s from './lead-details-editor.module.css';

type Values = Record<string, unknown>;
const record = (value: unknown): Values => value && typeof value === 'object' && !Array.isArray(value) ? value as Values : {};
const display = (value: unknown): string => value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
const label = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, letter => letter.toUpperCase());
const primaryDetails = new Set(['name','phone','email','adults','children','duration','style','title']);
const fields = [
  ['name','Name'], ['phone','Mobile number'], ['email','Email'], ['tripDuration','Trip duration'],
  ['travelStyle','Travel style'], ['enquirySource','Enquiry for / source'], ['adults','Adults'],
  ['children','Children'], ['kind','Enquiry type'], ['status','Status'], ['notes','Internal notes'],
] as const;
const options: Record<string, string[]> = {kind: ['itinerary','callback','corporate','partner','airport-transfer','car-rental'], status: ['new','contacted','qualified','closed']};
type Detail = {path: string[]; value: unknown};
function flatten(value: unknown, path: string[] = []): Detail[] {
  if (value && typeof value === 'object' && Object.keys(value).length) return Object.entries(value).flatMap(([key, child]) => flatten(child, [...path, key]));
  return [{path, value}];
}
function setAt(value: unknown, path: string[], next: unknown): unknown {
  if (!path.length) return next;
  const [key, ...rest] = path;
  if (Array.isArray(value)) {const result = [...value]; result[Number(key)] = setAt(result[Number(key)], rest, next); return result;}
  const current = record(value);
  return {...current, [key]: setAt(current[key], rest, next)};
}

export default function LeadDetailsEditor({initialLead}: {initialLead: Lead}) {
  const [saved, setSaved] = useState(initialLead);
  const [lead, setLead] = useState(initialLead);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState('');
  const dirty = editing && JSON.stringify(lead) !== JSON.stringify(saved);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(''), 1800);
    return () => clearTimeout(timer);
  }, [copied]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {event.preventDefault(); event.returnValue = '';};
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  async function copy(key: string, value: unknown) {
    try {await navigator.clipboard.writeText(display(value)); setCopied(key); setMessage('Copied to clipboard.');}
    catch {setMessage('Could not copy. Select the value and copy it manually.');}
  }
  function change(key: string, value: unknown) {setLead(current => ({...current, [key]: value}));}
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || pending) return;
    setPending(true); setMessage('');
    try {
      const data: Values = {};
      for (const [key] of fields) if (lead[key] !== saved[key]) data[key] = lead[key];
      if (JSON.stringify(lead.details) !== JSON.stringify(saved.details)) data.details = lead.details;
      const response = await fetch(`/cms-api/leads/${encodeURIComponent(lead.id)}`, {method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.message || result.message || 'Could not save this lead.');
      setSaved(result.doc); setLead(result.doc); setEditing(false); setMessage('Lead saved. Fields are locked again.');
    } catch (error) {setMessage(error instanceof Error ? error.message : 'Could not save this lead.');}
    finally {setPending(false);}
  }
  function box(key: string, title: string, value: unknown, update?: (value: unknown) => void, select?: string[]) {
    const locked = !editing || !update || pending;
    const id = `lead-box-${encodeURIComponent(key)}`;
    return <div className={s.box} key={key}>
      <div className={s.boxHeader}><label htmlFor={id}>{title}</label><button type="button" className={s.copy} onClick={() => copy(key, value)} aria-label={`Copy ${title}`}>{copied === key ? 'Copied' : 'Copy'}</button></div>
      {select ? <select id={id} value={display(value)} disabled={locked} onChange={event => update?.(event.target.value)}>{select.map(option => <option key={option} value={option}>{label(option)}</option>)}</select>
        : typeof value === 'boolean' ? <select id={id} value={String(value)} disabled={locked} onChange={event => update?.(event.target.value === 'true')}><option value="true">Yes</option><option value="false">No</option></select>
        : typeof value === 'number' || key === 'adults' || key === 'children' ? <input id={id} type="number" value={display(value)} readOnly={locked} onChange={event => update?.(event.target.value === '' ? null : Number(event.target.value))} />
        : <textarea id={id} value={display(value)} placeholder="Not provided" rows={key === 'notes' || display(value).length > 100 ? 3 : 1} readOnly={locked} required={key === 'name' || key === 'phone'} onChange={event => update?.(event.target.value)} />}
    </div>;
  }
  const details = Object.entries(record(lead.details)).filter(([key]) => !primaryDetails.has(key)).flatMap(([key, value]) => flatten(value, [key]));
  return <form className={s.editor} onSubmit={save}>
    <Link href="/admin/collections/leads" onClick={event => {if (dirty && !window.confirm('Discard your unsaved lead changes?')) event.preventDefault();}}>← Back to leads</Link>
    <div className={s.toolbar}><div><h2>Lead information</h2><p>{editing ? 'Editing enabled. Save your changes or cancel.' : 'Read only. Select Edit to change this lead.'}</p></div><div className={s.actions}>
      {editing ? <button type="button" disabled={pending} onClick={() => {setLead(saved); setEditing(false); setMessage('Changes cancelled.');}}>Cancel</button> : <button type="button" onClick={() => {setEditing(true); setMessage('');}}>✎ Edit</button>}
      <button type="submit" disabled={!dirty || pending} className={s.save}>{pending ? 'Saving…' : 'Save'}</button>
    </div></div>
    <p role="status" className={s.message}>{message}</p>
    <h2>Lead details</h2><div className={s.grid}>{fields.map(([key,title]) => box(key,title,lead[key],value => change(key,value),options[key]))}</div>
    {details.length > 0 && <><h2>Submitted details</h2><div className={s.grid}>{details.map(({path,value}) => box(`details-${JSON.stringify(path)}`,path.map(label).join(' / '),value,
      typeof value === 'object' && value !== null ? undefined : next => setLead(current => ({...current,details:setAt(current.details,path,next) as Lead['details']}))))}</div></>}
    <h2>Record information</h2><div className={s.grid}>{box('id','Lead ID',lead.id)}{box('createdAt','Created at',lead.createdAt)}{box('updatedAt','Last updated',lead.updatedAt)}{lead.legacyId && box('legacyId','Legacy reference',lead.legacyId)}{lead.itinerary && box('itinerary','Linked itinerary',typeof lead.itinerary === 'object' ? lead.itinerary.title : lead.itinerary)}</div>
  </form>;
}

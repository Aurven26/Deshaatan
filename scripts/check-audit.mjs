import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

const base='http://127.0.0.1:3000';
const admin=JSON.parse(await readFile('.data/local-admin.json','utf8'));
const json=data=>({'Content-Type':'application/json',Origin:base,...data});
const login=await fetch(`${base}/cms-api/users/login`,{method:'POST',headers:json(),body:JSON.stringify(admin)});
assert.equal(login.status,200);
const {token}=await login.json();
const staff=json({Authorization:`JWT ${token}`});
const call=async(path,data,headers=json())=>fetch(base+path,{method:'POST',headers,body:JSON.stringify(data)});
const callback={name:'Audit fixture',phone:'9999999999',title:'Audit fixture',adults:1,children:0};
assert.equal((await call('/api/callback-requests',{...callback,email:'invalid'})).status,400);
assert.equal((await call('/api/callback-requests',{...callback,phone:'-------'})).status,400);
assert.equal((await call('/api/callback-requests',{...callback,message:'x'.repeat(9000)})).status,413);
assert.equal((await call('/api/callback-requests',callback,json({Origin:'https://untrusted.example'}))).status,403);
for(const route of ['itinerary-requests','car-rental-requests','airport-transfer-requests']){
  assert.equal((await call(`/api/${route}`,{})).status,400);
  assert.equal((await call(`/api/${route}`,{message:'x'.repeat(18000)})).status,413);
}
for(const collection of ['leads','applications','private-files','users','request-limits'])assert.equal((await fetch(`${base}/cms-api/${collection}`)).status,403);
const source=await (await fetch(`${base}/cms-api/itineraries?where[slug][equals]=golden-triangle-12-days`)).json();
const original=source.docs[0];
const slug=`audit-${randomUUID()}`;
let id;
let reviewId;
try{
  const created=await call('/cms-api/itineraries',{title:'Audit draft',slug,destination:original.destination.id,days:2,price:12345,detailData:original.detailData,_status:'draft'},staff);
  assert.equal(created.status,201);
  id=(await created.json()).doc.id;
  const hidden=await (await fetch(`${base}/cms-api/itineraries?where[slug][equals]=${slug}`)).json();
  assert.equal(hidden.totalDocs,0,'Anonymous users must not read drafts');
  const visible=await (await fetch(`${base}/cms-api/itineraries/${id}?draft=true`,{headers:staff})).json();
  assert.equal(visible.title,'Audit draft');
  const published=await fetch(`${base}/cms-api/itineraries/${id}`,{method:'PATCH',headers:staff,body:JSON.stringify({_status:'published',title:'Audit published'})});
  assert.equal(published.status,200);
  const publicDoc=await (await fetch(`${base}/cms-api/itineraries?where[slug][equals]=${slug}`)).json();
  assert.equal(publicDoc.docs[0].title,'Audit published');
  const versions=await fetch(`${base}/cms-api/itineraries/versions?where[parent][equals]=${id}`,{headers:staff});
  assert.equal(versions.status,200);
  assert.ok((await versions.json()).totalDocs>=2);
  const review=await call('/cms-api/reviews',{},json());
  assert.equal(review.status,403,'Public clients cannot bypass moderation');
  const reviewForm=new FormData();
  for(const [key,value] of Object.entries({tour:slug,rating:'2',title:'Audit review',review:'This is a disposable integration test review with more than fifty characters.',name:'Audit fixture',bookingId:'PRIVATE-TEST',travelMonth:'2026-01',companion:'Solo',consent:'on'}))reviewForm.set(key,value);
  const submitted=await fetch(`${base}/api/reviews`,{method:'POST',headers:{Origin:base},body:reviewForm});
  assert.equal(submitted.status,201);
  reviewId=(await submitted.json()).id;
  const pending=await (await fetch(`${base}/cms-api/reviews?where[itinerary][equals]=${id}`)).json();
  assert.equal(pending.totalDocs,0);
  const approved=await fetch(`${base}/cms-api/reviews/${reviewId}`,{method:'PATCH',headers:staff,body:JSON.stringify({status:'published'})});
  assert.equal(approved.status,200);
  const approvedPublic=await (await fetch(`${base}/cms-api/reviews/${reviewId}`)).json();
  assert.equal(approvedPublic.rating,2);
  assert.equal(approvedPublic.bookingId,undefined);
  assert.equal(approvedPublic.photos,undefined);
}finally{
  if(reviewId)assert.equal((await fetch(`${base}/cms-api/reviews/${reviewId}`,{method:'DELETE',headers:staff})).status,200);
  if(id)assert.equal((await fetch(`${base}/cms-api/itineraries/${id}`,{method:'DELETE',headers:staff})).status,200);
}
const rateHeaders=json({'x-forwarded-for':`audit-${randomUUID()}`});
let limited;
for(let index=0;index<21;index++)limited=await call('/api/callback-requests',{},rateHeaders);
assert.equal(limited.status,429);
assert.ok(Number(limited.headers.get('retry-after'))>=1 && Number(limited.headers.get('retry-after'))<=60);
console.log('Audit regression checks passed: byte limits, validation, CSRF, private collections, drafts, publishing, versions, review moderation, private fields, rate limiting and fixture cleanup.');

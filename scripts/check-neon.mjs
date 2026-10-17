import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import nextEnv from '@next/env';
import {Pool} from 'pg';

const {loadEnvConfig}=nextEnv;
loadEnvConfig(process.cwd());
const base=process.env.CHECK_BASE_URL || 'http://127.0.0.1:3000';
const origin=process.env.NEXT_PUBLIC_SERVER_URL || new URL(base).origin;
const databaseURL=new URL(process.env.DATABASE_URL);
assert.ok(databaseURL.hostname.endsWith('.neon.tech'),'This check requires a Neon DATABASE_URL.');
assert.ok(databaseURL.hostname.includes('-pooler.'),'The app should use the pooled Neon connection.');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:2,connectionTimeoutMillis:15000});
const request=async(path,options={})=>{
  const response=await fetch(base+path,options);
  return {response,result:await response.json()};
};
const post=(data)=>({method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(data)});
let leadId,authorization;
const marker=`Neon verification ${randomUUID()}`;
try{
  assert.equal((await pool.query('SELECT 1 AS connected')).rows[0].connected,1);
  console.log('PASS: pooled Neon PostgreSQL connection.');
  assert.equal((await fetch(base+'/')).status,200);
  const content=await request('/cms-api/itineraries?limit=1');
  assert.equal(content.response.status,200);
  assert.ok(content.result.docs.length>0,'Migrated CMS itineraries must be present.');
  const itinerary=content.result.docs[0];
  assert.equal((await fetch(base+'/tours/'+encodeURIComponent(itinerary.slug))).status,200);
  console.log(`PASS: homepage, CMS content (${content.result.totalDocs} itineraries), and itinerary page.`);
  const admin=JSON.parse(await readFile('.data/local-admin.json','utf8'));
  const login=await request('/cms-api/users/login',post(admin));
  assert.equal(login.response.status,200);
  assert.ok(login.result.token);
  authorization={Authorization:`JWT ${login.result.token}`};
  assert.equal((await request('/cms-api/leads')).response.status,403);
  const lead=await request('/api/callback-requests',post({name:marker,phone:'9999999999',title:'Neon end-to-end verification',adults:2,children:0,duration:'4 days',style:'Family'}));
  assert.equal(lead.response.status,201);
  leadId=lead.result.id;
  const saved=await pool.query('SELECT name FROM leads WHERE id=$1',[leadId]);
  assert.equal(saved.rows[0]?.name,marker,'The HTTP form must write to the same Neon database.');
  const cmsLead=await request(`/cms-api/leads/${leadId}`,{headers:authorization});
  assert.equal(cmsLead.response.status,200);
  assert.equal(cmsLead.result.name,marker);
  console.log('PASS: migrated admin login, public lead access denied, enquiry saved to Neon and read through authenticated CMS.');
  const edited=await request(`/cms-api/leads/${leadId}`,{method:'PATCH',headers:{...authorization,'Content-Type':'application/json',Origin:origin},body:JSON.stringify({name:marker+' edited'})});
  assert.equal(edited.response.status,200);
  assert.equal((await pool.query('SELECT name FROM leads WHERE id=$1',[leadId])).rows[0]?.name,marker+' edited');
  console.log('PASS: CMS lead edit persisted in Neon.');
}finally{
  try{
    if(leadId && authorization){
      const deleted=await request(`/cms-api/leads/${leadId}`,{method:'DELETE',headers:{...authorization,Origin:origin}});
      assert.equal(deleted.response.status,200);
      assert.equal((await pool.query('SELECT count(*)::int AS count FROM leads WHERE id=$1',[leadId])).rows[0].count,0);
      console.log('PASS: verification enquiry deleted; no fixture lead retained.');
    }
  }finally{await pool.end();}
}

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildConfig} from 'payload';
import {postgresAdapter} from '@payloadcms/db-postgres';
import {lexicalEditor} from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import {vercelBlobStorage} from '@payloadcms/storage-vercel-blob';
import {nodemailerAdapter} from '@payloadcms/email-nodemailer';
import {attachDatabasePool} from '@vercel/functions';
import {privateBlobStorage} from './cms/private-blob';
import nodemailer from 'nodemailer';
import {Users,Media,PrivateFiles,Destinations,Categories,Itineraries,Guides,Pages,FAQs,Testimonials,Leads,Applications,Reviews} from './cms/collections';
import {isAdmin,isEditor} from './cms/access';
import {revalidateGlobal} from './cms/fields';
import {HomePage} from './cms/home-page';
import {PageVisibility} from './cms/section-visibility';
import {allowedOrigins} from './cms/security-origins';

const base=path.dirname(fileURLToPath(import.meta.url));
const secret=process.env.PAYLOAD_SECRET;
const connectionString=process.env.DATABASE_URL;
if(!secret || secret.length<32)throw new Error('PAYLOAD_SECRET must contain at least 32 characters.');
if(!connectionString)throw new Error('DATABASE_URL is required.');
const isNeon=new URL(connectionString).hostname.endsWith('.neon.tech');
const serverURL=process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000';
export default buildConfig({
  secret,serverURL,telemetry:false,maxDepth:3,defaultDepth:1,defaultMaxTextLength:10000,
  admin:{user:'users',meta:{titleSuffix:'— Deshaatan CMS'},importMap:{baseDir:base},livePreview:{collections:['itineraries','pages'],url:({data,collectionConfig})=>typeof data.slug==='string'?`${serverURL}/preview/${collectionConfig?.slug}/${encodeURIComponent(data.slug)}`:serverURL}},
  routes:{api:'/cms-api',admin:'/admin'},
  cors:allowedOrigins(),csrf:allowedOrigins(),
  db:postgresAdapter({pool:{connectionString,max:5,idleTimeoutMillis:5000,connectionTimeoutMillis:15000},push:!isNeon && process.env.NODE_ENV!=='production'}),
  onInit:async(payload)=>{if(process.env.VERCEL)attachDatabasePool(payload.db.pool);},
  editor:lexicalEditor(),sharp,
  plugins:[vercelBlobStorage({enabled:!!process.env.BLOB_READ_WRITE_TOKEN,token:process.env.BLOB_READ_WRITE_TOKEN,collections:{media:true},alwaysInsertFields:true}),privateBlobStorage()],
  ...(process.env.SMTP_HOST?{email:nodemailerAdapter({defaultFromAddress:process.env.SMTP_FROM || 'care@deshaatan.com',defaultFromName:'Deshaatan',transport:nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT || 587),secure:process.env.SMTP_SECURE==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})})}:{}),
  typescript:{outputFile:path.join(base,'payload-types.ts')},
  upload:{limits:{fileSize:25*1024*1024},abortOnLimit:true},
  collections:[Users,Media,PrivateFiles,Destinations,Categories,Itineraries,Guides,Pages,FAQs,Testimonials,...[Leads,Applications,Reviews].map(collection=>({...collection,fields:[...collection.fields,{name:'legacyId',type:'text' as const,unique:true,index:true,admin:{readOnly:true}}]})),{slug:'request-limits',admin:{hidden:true},access:{read:()=>false,create:()=>false,update:()=>false,delete:()=>false},fields:[{name:'key',type:'text',required:true,unique:true},{name:'count',type:'number',required:true},{name:'expiresAt',type:'date',required:true,index:true}]}],
  globals:[HomePage,PageVisibility,{slug:'site-settings',access:{read:()=>true,update:isAdmin},hooks:{afterChange:[revalidateGlobal]},fields:[{name:'email',type:'email',required:true,defaultValue:'care@deshaatan.com'},{name:'phone',type:'text',required:true,defaultValue:'07065780780'},{name:'address',type:'textarea',required:true,defaultValue:'Cabin 21, Ground Floor, H-187, Lohia Rd,\nH Block, Sector 63, Noida, Uttar Pradesh 201301'},{name:'instagram',type:'text',defaultValue:'https://www.instagram.com/plan.deshaatan/'}]},{slug:'navigation',access:{read:()=>true,update:isEditor},hooks:{afterChange:[revalidateGlobal]},fields:[{name:'links',type:'array',fields:[{name:'label',type:'text',required:true},{name:'href',type:'text',required:true,validate:(value:string|null|undefined)=>!!value && (value.startsWith('/') && !value.startsWith('//') || /^https?:\/\//.test(value)) || 'Enter a relative path or HTTP URL.'}]}]}],
});

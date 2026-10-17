import {randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {getPayload} from 'payload';
import config from '../src/payload.config';
import {tourPackages} from '../src/data/tour-packages';
import {goldenTriangle} from '../src/data/golden-triangle';
import faq from '../src/data/faq.json';
import documents from '../src/data/information-pages.json';
import {importHomepage} from '../src/cms/import-homepage';
import {backfillPageSections} from '../src/cms/page-content';
import {backfillThumbnails} from '../src/cms/backfill-thumbnails';

const payload=await getPayload({config});
const context={skipRevalidation:true};
const slug=(text:string)=>text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const richText=(text:string)=>({root:{type:'root',format:'' as const,indent:0,version:1,direction:null,children:[{type:'paragraph',format:'',indent:0,version:1,direction:null,children:[{type:'text',text,format:0,detail:0,mode:'normal',style:'',version:1}]}]}});
const users=await payload.count({collection:'users'});
if(users.totalDocs===0){
  const password=randomBytes(24).toString('base64url');
  await payload.create({collection:'users',overrideAccess:true,data:{email:'admin@deshaatan.local',name:'Deshaatan Admin',password,role:'admin'},context});
  await mkdir('.data',{recursive:true,mode:0o700});
  await writeFile('.data/local-admin.json',JSON.stringify({email:'admin@deshaatan.local',password}),{mode:0o600,flag:'wx'});
  console.log('Local admin credentials saved privately in .data/local-admin.json.');
}
const destinationIds=new Map<string,number>();
for(const title of [...new Set(tourPackages.map(trip=>trip.destination))]){
  const existing=await payload.find({collection:'destinations',where:{slug:{equals:slug(title)}},limit:1});
  const document=existing.docs[0] || await payload.create({collection:'destinations',data:{title,slug:slug(title),_status:'published'},context});
  destinationIds.set(title,document.id);
}
const categoryIds=new Map<string,number>();
for(const title of [...new Set(tourPackages.flatMap(trip=>trip.types))]){
  const existing=await payload.find({collection:'categories',where:{slug:{equals:slug(title)}},limit:1});
  const document=existing.docs[0] || await payload.create({collection:'categories',data:{title,slug:slug(title)},context});
  categoryIds.set(title,document.id);
}
for(const trip of tourPackages){
  const existing=await payload.find({collection:'itineraries',where:{slug:{equals:trip.id}},limit:1});
  if(existing.totalDocs)continue;
  await payload.create({collection:'itineraries',data:{title:trip.title,slug:trip.id,destination:destinationIds.get(trip.destination)!,categories:trip.types.map(type=>categoryIds.get(type)!),days:trip.days,price:trip.price,previousPrice:trip.previousPrice,legacyImage:trip.image,featured:true,religious:trip.types.includes('Pilgrimage'),_status:'published',...(trip.id===goldenTriangle.slug?{detailData:goldenTriangle,overview:richText(goldenTriangle.overview)}:{})},context});
}
for(const category of faq){
  for(const [order,item] of category.items.entries()){
    const existing=await payload.find({collection:'faqs',where:{and:[{category:{equals:category.id}},{question:{equals:item.question}}]},limit:1});
    if(!existing.totalDocs)await payload.create({collection:'faqs',data:{category:category.id,categoryTitle:category.title,categoryChip:category.chip,question:item.question,answer:item.answer,order,_status:'published'},context});
  }
}
for(const [pageSlug,layoutBlocks] of Object.entries(documents)){
  const existing=await payload.find({collection:'pages',where:{slug:{equals:pageSlug}},limit:1});
  if(!existing.totalDocs)await payload.create({collection:'pages',data:{slug:pageSlug,title:pageSlug.replace(/-/g,' '),layoutBlocks,_status:'published'},context});
}
for(const [title,summary] of [['Kerala','Explore tranquil backwaters, houseboats, tea gardens, and the green hills of Munnar.'],['Rajasthan','Discover royal palaces, historic forts, desert landscapes, and the colourful cities of Rajasthan.'],['Kashmir','Discover the mountain scenery, lakes, gardens, and valleys of Kashmir.']]){
  const existing=await payload.find({collection:'guides',where:{slug:{equals:slug(title)}},limit:1});
  if(!existing.totalDocs)await payload.create({collection:'guides',data:{title,slug:slug(title),destination:destinationIds.get(title)!,summary,content:richText(summary),_status:'published'},context});
}
for(const [order,review] of [
  {name:'Harshit Gupta',designation:'Entrepreneur',text:'Deshaatan helped me find the perfect place for our first outdoor adventure. The team responded quickly and shared useful details about the destination, its history, and its best experiences.'},
  {name:'Priya Sharma',designation:'Marketing Consultant',text:'Our Kashmir holiday felt effortless from the first call. Every stay, transfer, and local experience was thoughtfully planned, while the team remained available whenever we needed help.'},
  {name:'Rahul Mehta',designation:'Frequent Traveller',text:'The itinerary balanced famous sights with quieter local discoveries beautifully. We never felt rushed, and each recommendation genuinely matched how our family likes to travel.'},
].entries()){
  const existing=await payload.find({collection:'testimonials',where:{name:{equals:review.name}},limit:1});
  if(!existing.totalDocs)await payload.create({collection:'testimonials',data:{...review,order,_status:'published'},context});
}
const settings=await payload.findGlobal({slug:'site-settings'});
const navigation=await payload.findGlobal({slug:'navigation'});
if(!navigation.updatedAt)await payload.updateGlobal({slug:'navigation',data:{links:[{label:'About Us',href:'/about-us'},{label:'Destinations',href:'/#destinations'},{label:'Tour Packages',href:'/tour-packages'},{label:'Guides',href:'/#guides'}]},context});
if(!settings.updatedAt)await payload.updateGlobal({slug:'site-settings',data:{email:'care@deshaatan.com',phone:'07065780780',address:'Cabin 21, Ground Floor, H-187, Lohia Rd,\nH Block, Sector 63, Noida, Uttar Pradesh 201301',instagram:'https://www.instagram.com/plan.deshaatan/'},context});
await importHomepage(payload);
await backfillPageSections(payload);
await backfillThumbnails(payload);
console.log('Existing site content imported into PostgreSQL.');
await payload.destroy();
process.exit(0);

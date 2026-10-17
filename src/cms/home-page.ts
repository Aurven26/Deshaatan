import type {Field, GlobalConfig} from 'payload';
import {isEditor} from './access';
import {revalidateGlobal} from './fields';
import {itinerarySEO} from './itinerary-seo';
import {homeDefaults as d} from './home-defaults';
import {sectionMenu} from './section-menu';
const text=(name:string,value='',type:'text'|'textarea'='text'):Field=>type==='textarea'?{name,type:'textarea',defaultValue:value}:{name,type:'text',defaultValue:value,...(/(URL|href)$/.test(name)?{validate:(url:string|null|undefined)=>!url || /^(\/[^/]|\/$|#|https?:\/\/)/.test(url) || 'Enter a relative path or an HTTP(S) URL.'}:{})};
const toggle=(name:string,value=true):Field=>({name,type:'checkbox',defaultValue:value});
const image=(name:string):Field=>({name,type:'upload',relationTo:'media'});
const number=(name:string,value:number,min?:number):Field=>({name,type:'number',defaultValue:value,...(min!==undefined?{min}:{})});
const labels=(name:string,values:{label:string}[]):Field=>({name,type:'array',defaultValue:values,fields:[{name:'label',type:'text',required:true}]});
const selection=(relationTo:'itineraries'|'guides'|'testimonials'):Field=>({name:'items',type:'relationship',relationTo,hasMany:true,admin:{description:'Turn off Use All to show only these records, in this order. Edit their full details and images in the matching Content collection.'}});
const group=(name:string,fields:Field[]):Field=>({name,label:({hero:'Hero banners',popular:'Popular trips',guides:'Travel guides',religious:'Religious trips',testimonials:'Testimonials',enquiry:'Enquiry form',about:'About & links',airport:'Airport transfer',footer:'Footer',categories:'Categories',header:'Header'} as Record<string,string>)[name]||name,type:'group',fields});
const strings=(values:Record<string,unknown>,omit:string[]=[])=>Object.entries(values).flatMap(([key,value])=>typeof value==='string'&&!omit.includes(key)?[text(key,value,key==='description'?'textarea':'text')]:[]);
const linkFields:Field[]=[{name:'label',type:'text',required:true},{name:'href',type:'text',admin:{description:'Enter a /relative path or https:// URL.'}},{name:'action',type:'select',defaultValue:'link',options:['link','corporate','car-rental','hiring','partner','info']}];
export const HomePage:GlobalConfig={slug:'home-page',label:'Home Page',admin:{group:'Website',description:'Homepage sections in page order. Existing text and images are imported here. Header and footer settings apply throughout the website.'},access:{read:()=>true,update:isEditor},versions:{max:30},hooks:{afterChange:[revalidateGlobal]},fields:[{name:'contentLibrary',type:'ui',admin:{components:{Field:'@/components/home-editor-links#default'}}},{type:'tabs',tabs:[
  {label:'Header',fields:[group('header',[toggle('promotionVisible'),...strings(d.header,['desktopLogo','mobileLogo','favicon']),{name:'favicon',label:'Website favicon',type:'upload',relationTo:'media',admin:{description:'Browser tab icon for the website. Upload a square PNG, ideally 512 × 512 pixels. Clear it to remove the custom favicon.'}},image('desktopLogo'),image('mobileLogo'),toggle('showGuides',false),toggle('showLogin',false),toggle('showSearch'),toggle('showCurrency')])]},
  {label:'Hero banners',fields:[group('hero',[{name:'enabled',label:'Show hero banners',type:'checkbox',defaultValue:true,admin:{description:'Turn off to hide the entire banner carousel without deleting any banners.'}},toggle('autoplay',false),number('interval',6,3),{name:'banners',type:'array',admin:{description:'Drag to reorder. Use image-only artwork to hide the overlaid title and button. Destination fills the tour search; Link URL overrides it.'},fields:[{name:'visible',label:'Show this banner',type:'checkbox',defaultValue:true},text('key'),text('title'),image('image'),text('alt'),text('badge'),text('tagline'),text('action'),text('destination'),text('href'),toggle('artworkOnly',false),{type:'collapsible',label:'Desktop photo crop (%)',fields:[number('width',100,1),number('height',100,1),number('left',0),number('top',0)]}]}])]},
  {label:'Categories',fields:[group('categories',[toggle('enabled',false),{name:'items',type:'array',fields:[text('label'),image('image'),text('enquiryTitle')]}])]},
  {label:'Popular trips',fields:[group('popular',[toggle('enabled'),...strings(d.popular),toggle('useAll'),selection('itineraries'),number('rating',4.5,0),labels('durationLabels',d.popular.durationLabels)])]},
  {label:'Travel guides',fields:[group('guides',[toggle('enabled'),...strings(d.guides),toggle('useAll'),selection('guides')])]},
  {label:'Religious trips',fields:[group('religious',[toggle('enabled'),...strings(d.religious,['backgroundImage','featuredImage']),toggle('useAll'),selection('itineraries'),image('backgroundImage'),image('featuredImage'),labels('durationLabels',d.religious.durationLabels)])]},
  {label:'Testimonials',fields:[group('testimonials',[toggle('enabled'),...strings(d.testimonials,['defaultAvatar','title']),text('title',d.testimonials.title,'textarea'),toggle('useAll'),selection('testimonials'),number('interval',7,3),image('defaultAvatar')])]},
  {label:'Enquiry form',fields:[group('enquiry',[toggle('enabled'),...strings(d.enquiry),labels('promises',d.enquiry.promises),labels('durations',d.enquiry.durations),labels('styles',d.enquiry.styles)])]},
  {label:'About & links',fields:[group('about',[toggle('enabled'),...strings(d.about,['preview','full']),text('preview',d.about.preview,'textarea'),text('full',d.about.full,'textarea'),{name:'linkGroups',type:'array',fields:[text('title'),{name:'links',type:'array',fields:[text('label'),text('href')],admin:{description:'Leave URL empty to open an enquiry popup headed with the link label.'}}]}])]},
  {label:'Airport transfer',fields:[group('airport',[toggle('enabled'),...strings(d.airport,['decorationImage','carImage']),image('decorationImage'),image('carImage')])]},
  {label:'Footer',fields:[group('footer',[toggle('enabled'),...strings(d.footer,['logo']),image('logo'),...['mainLinks','quickLinks','legalLinks'].map(name=>({name,type:'array' as const,fields:linkFields}))])]},
  {label:'SEO',fields:[itinerarySEO]},
]}]};

for(const field of HomePage.fields){
  if(field.type!=='tabs')continue;
  for(const tab of field.tabs)tab.fields=tab.fields.map(group=>{
    if(group.type!=='group'||!('name' in group)||!group.name||!group.fields.some(child=>'name' in child&&child.name==='enabled'))return group;
    const visibilityPath=`${group.name}.enabled`;
    const fields=group.fields.map(child=>{
      if(child.type==='checkbox'&&child.name==='enabled'){child.admin={...child.admin,hidden:true};return child;}
      return child.type==='array'?sectionMenu(child,visibilityPath):child;
    });
    return sectionMenu({...group,fields},visibilityPath);
  });
}

import type {CollectionConfig} from 'payload';
import {itineraryPageFields} from './itinerary-fields';
import {itinerarySEO} from './itinerary-seo';
import {pageSections} from './page-fields';
import {leadTableFields, populateLeadColumns, readLeadColumns} from './lead-fields';
import {adminField,isAdmin,isEditor,isStaff,ownUser,published} from './access';
import {revalidateContent,revalidateDeletedContent,seo,slug,slugHook} from './fields';
import {secureUpload} from './secure-upload';
import {passwordPolicy} from './password-policy';
import {sectionAction,sectionMenu} from './section-menu';

const editorial:CollectionConfig['access']={read:published,create:isEditor,update:isEditor,delete:isAdmin};
const contentHooks={beforeValidate:[slugHook],afterChange:[revalidateContent],afterDelete:[revalidateDeletedContent]};
const versions={drafts:{autosave:{interval:1500}},maxPerDoc:30};
export const Users:CollectionConfig={slug:'users',auth:{tokenExpiration:3600,maxLoginAttempts:5,lockTime:600000,cookies:{sameSite:'Lax',secure:process.env.NODE_ENV==='production'}},admin:{useAsTitle:'name',group:'Administration'},access:{admin:isStaff,read:ownUser,create:isAdmin,update:ownUser,delete:isAdmin},fields:[{name:'name',type:'text',required:true,maxLength:100},{name:'phone',type:'text',index:true},{name:'role',type:'select',required:true,defaultValue:'customer',options:['admin','editor','support','customer'],access:{create:adminField,update:adminField}},{name:'offersConsent',type:'checkbox',defaultValue:false},{name:'termsAcceptedAt',type:'date',access:{update:adminField}}]};
export const Media:CollectionConfig={slug:'media',admin:{useAsTitle:'alt',group:'Content'},access:{read:()=>true,create:isEditor,update:isEditor,delete:isAdmin},upload:{staticDir:'.data/media',mimeTypes:['image/jpeg','image/png','image/webp','image/avif'],imageSizes:[{name:'card',width:640,height:480,position:'centre'},{name:'hero',width:1600,height:600,position:'centre'}],adminThumbnail:'card'},fields:[{name:'alt',type:'text',required:true,maxLength:200},{name:'credit',type:'text'}]};
export const PrivateFiles:CollectionConfig={slug:'private-files',admin:{group:'Enquiries'},access:{read:isStaff,create:isStaff,update:isStaff,delete:isAdmin},upload:{staticDir:'.data/private-files',mimeTypes:['application/pdf','image/jpeg','image/png']},fields:[{name:'purpose',type:'select',required:true,options:['resume','review-photo']}]};
export const Destinations:CollectionConfig={slug:'destinations',admin:{useAsTitle:'title',group:'Content'},access:editorial,versions,hooks:contentHooks,fields:[{name:'title',type:'text',required:true},slug,{name:'description',type:'textarea'},{name:'image',type:'upload',relationTo:'media'},seo]};
export const Categories:CollectionConfig={slug:'categories',admin:{useAsTitle:'title',group:'Content'},access:{read:()=>true,create:isEditor,update:isEditor,delete:isAdmin},fields:[{name:'title',type:'text',required:true},slug],hooks:contentHooks};
export const Itineraries:CollectionConfig={slug:'itineraries',admin:{useAsTitle:'title',group:'Content',defaultColumns:['title','destination','days','price','_status']},access:editorial,versions,hooks:contentHooks,fields:[{name:'title',type:'text',required:true,index:true},slug,{name:'destination',type:'relationship',relationTo:'destinations',required:true,index:true},{name:'categories',type:'relationship',relationTo:'categories',hasMany:true},{name:'days',type:'number',min:1,max:365,required:true},{name:'price',type:'number',min:0,required:true},{name:'previousPrice',type:'number',min:0},{name:'image',type:'upload',relationTo:'media'},{name:'legacyImage',type:'text',admin:{description:'Existing local asset used during the initial content migration.'}},{name:'overview',type:'richText'},{name:'highlights',type:'array',fields:[{name:'text',type:'text',required:true}]},{name:'schedule',type:'array',fields:[{name:'day',type:'number',min:1,required:true},{name:'title',type:'text',required:true},{name:'description',type:'richText'}]},{name:'inclusions',type:'array',fields:[{name:'text',type:'text',required:true}]},{name:'exclusions',type:'array',fields:[{name:'text',type:'text',required:true}]},{name:'featured',type:'checkbox'},{name:'religious',type:'checkbox'},{name:'detailData',type:'json',admin:{description:'Existing itinerary layout data imported during migration.'}},seo]};
export const Guides:CollectionConfig={slug:'guides',admin:{useAsTitle:'title',group:'Content'},access:editorial,versions,hooks:contentHooks,fields:[{name:'title',type:'text',required:true,index:true},slug,{name:'destination',type:'relationship',relationTo:'destinations',required:true,index:true},{name:'summary',type:'textarea'},{name:'content',type:'richText',required:true},{name:'image',type:'upload',relationTo:'media'},seo]};
export const Pages:CollectionConfig={slug:'pages',admin:{useAsTitle:'title',group:'Content',defaultColumns:['title','slug','_status'],description:'Edit page content using sections and text editors. Publish to update the website.'},access:editorial,versions,hooks:contentHooks,fields:[{name:'title',type:'text',required:true},slug,{name:'content',label:'Introduction (optional)',type:'richText'},{name:'visibility',label:'Page section visibility',type:'group',fields:['navigation','introduction','sections'].map(name=>({name,label:`Show ${name}`,type:'checkbox' as const,defaultValue:true}))},pageSections,{name:'layoutBlocks',type:'json',admin:{hidden:true}},itinerarySEO]};
export const FAQs:CollectionConfig={slug:'faqs',admin:{useAsTitle:'question',group:'Content'},access:editorial,versions,hooks:{afterChange:[revalidateContent],afterDelete:[revalidateDeletedContent]},fields:[{name:'question',type:'text',required:true},{name:'answer',type:'textarea',required:true},{name:'category',type:'text',required:true,index:true},{name:'categoryTitle',type:'text',required:true},{name:'categoryChip',type:'text',required:true},{name:'order',type:'number',defaultValue:0,index:true}]};
export const Testimonials:CollectionConfig={slug:'testimonials',admin:{useAsTitle:'name',group:'Content'},access:editorial,versions,hooks:{afterChange:[revalidateContent],afterDelete:[revalidateDeletedContent]},fields:[{name:'name',type:'text',required:true},{name:'designation',type:'text',required:true},{name:'text',type:'textarea',required:true},{name:'rating',type:'number',min:1,max:5,defaultValue:5},{name:'avatar',type:'upload',relationTo:'media'},{name:'order',type:'number',defaultValue:0}]};
export const Leads:CollectionConfig={slug:'leads',admin:{useAsTitle:'name',group:'Enquiries',defaultColumns:['name','kind','status','createdAt']},access:{read:isStaff,create:()=>false,update:isStaff,delete:isAdmin},fields:[{name:'name',type:'text',required:true,maxLength:100},{name:'email',type:'email'},{name:'phone',type:'text',required:true},{name:'kind',type:'select',required:true,index:true,options:['itinerary','callback','corporate','partner','airport-transfer','car-rental']},{name:'itinerary',type:'relationship',relationTo:'itineraries'},{name:'adults',type:'number',min:1,max:99},{name:'children',type:'number',min:0,max:98},{name:'details',type:'json',required:true},{name:'status',type:'select',required:true,defaultValue:'new',index:true,options:['new','contacted','qualified','closed']},{name:'notes',type:'textarea'}]};
export const Applications:CollectionConfig={slug:'applications',admin:{useAsTitle:'name',group:'Enquiries'},access:{read:isStaff,create:()=>false,update:isStaff,delete:isAdmin},fields:[{name:'name',type:'text',required:true},{name:'email',type:'email',required:true},{name:'phone',type:'text',required:true},{name:'position',type:'text',required:true},{name:'resume',type:'upload',relationTo:'private-files',required:true},{name:'status',type:'select',defaultValue:'new',options:['new','reviewing','interviewing','accepted','declined']}]};
export const Reviews:CollectionConfig={slug:'reviews',hooks:{afterChange:[revalidateContent],afterDelete:[revalidateDeletedContent]},admin:{useAsTitle:'title',group:'Enquiries'},access:{read:({req})=>req.user && ['admin','editor','support'].includes(req.user.role)?true:{status:{equals:'published'}},create:()=>false,update:isStaff,delete:isAdmin},fields:[{name:'itinerary',type:'relationship',relationTo:'itineraries',required:true,index:true},{name:'rating',type:'number',required:true,min:1,max:5},{name:'title',type:'text',required:true},{name:'review',type:'textarea',required:true},{name:'name',type:'text',required:true},{name:'bookingId',type:'text',access:{read:({req})=>!!req.user && ['admin','support'].includes(req.user.role)}},{name:'travelMonth',type:'text'},{name:'companion',type:'select',options:['Family','Couple','Friends','Solo','Business']},{name:'photos',type:'relationship',relationTo:'private-files',hasMany:true,access:{read:({req})=>!!req.user && ['admin','editor','support'].includes(req.user.role)}},{name:'status',type:'select',defaultValue:'pending',index:true,options:['pending','published','rejected']},{name:'verified',type:'checkbox',defaultValue:false}]};

Itineraries.fields.push(...itineraryPageFields);
Leads.fields.push(...leadTableFields);
Leads.admin = {...Leads.admin, defaultColumns: ['name','phone','tripDuration','travelStyle','enquirySource','editLead','status']};
Leads.admin.components = {views: {edit: {default: {Component: '@/components/lead-details-view#default'}}}};
const leadPhone = Leads.fields.find(field => 'name' in field && field.name === 'phone');
if (leadPhone && 'name' in leadPhone) leadPhone.label = 'Mobile number';
Leads.hooks = {...Leads.hooks, beforeChange: [populateLeadColumns], afterRead: [readLeadColumns]};
const leadFieldOrder = ['name','phone','tripDuration','travelStyle','enquirySource','email','kind','itinerary','adults','children','status','notes','details','editLead'];
Leads.fields.sort((a,b) => leadFieldOrder.indexOf('name' in a ? a.name : '') - leadFieldOrder.indexOf('name' in b ? b.name : ''));
Itineraries.fields = Itineraries.fields.map(field => 'name' in field && field.name === 'seo' ? itinerarySEO : field);
const itineraryFieldOrder = ['title','slug','destination','categories','days','startCity','endCity','price','previousPrice','thumbnail','image','gallery','overview','highlights','schedule','inclusions','exclusions','tourFAQs','reviewManagement','policies','attractionsTitle','attractions','activitiesTitle','activities','sectionVisibility','featured','religious','legacyImage','detailData','seo'];
Itineraries.fields.sort((a,b) => itineraryFieldOrder.indexOf('name' in a ? a.name : '') - itineraryFieldOrder.indexOf('name' in b ? b.name : ''));
Reviews.access = {...Reviews.access, create: isEditor};
Reviews.admin = {...Reviews.admin, defaultColumns: ['title', 'name', 'itinerary', 'shared', 'rating', 'status']};
const reviewItinerary = Reviews.fields.find(field => 'name' in field && field.name === 'itinerary');
if (reviewItinerary && reviewItinerary.type === 'relationship') {
  reviewItinerary.required = false;
  reviewItinerary.validate = (value: unknown, {siblingData}: {siblingData: {shared?: boolean}}) => siblingData?.shared || !!value || 'Select an itinerary or enable shared review.';
}
Reviews.fields.push(
  {name: 'shared', label: 'Show on every itinerary', type: 'checkbox', defaultValue: false},
  {name: 'displayDate', label: 'Review date', type: 'text', admin: {description: 'Optional display date, e.g. 2024.12.15.'}},
  {name: 'displayOrder', label: 'Display order', type: 'number', defaultValue: 100},
);

const itineraryMainPhoto=Itineraries.fields.find(field=>'name' in field && field.name==='image');
if(itineraryMainPhoto && 'name' in itineraryMainPhoto){itineraryMainPhoto.label='Main itinerary photo';itineraryMainPhoto.admin={...itineraryMainPhoto.admin,description:'Shown inside the itinerary gallery. The listing thumbnail is managed separately.'};}

Users.hooks = {...Users.hooks, beforeOperation: [passwordPolicy]};
for (const collection of [Media, PrivateFiles]) {
  collection.hooks = {...collection.hooks, beforeOperation: [secureUpload]};
  if (collection.upload && typeof collection.upload === 'object') collection.upload.pasteURL = false;
}

const sectionFields:Record<string,string>={title:'introduction',image:'gallery',gallery:'gallery',overview:'overview',highlights:'highlights',schedule:'itinerary',inclusions:'inclusions',exclusions:'exclusions',tourFAQs:'faqs',policies:'policies',attractions:'attractions',activities:'activities'};
Itineraries.fields=Itineraries.fields.map(field=>{
  if(field.type==='group' && 'name' in field && field.name==='sectionVisibility'){field.admin={...field.admin,hidden:true};return field;}
  return 'name' in field && sectionFields[field.name]?sectionMenu(field,`sectionVisibility.${sectionFields[field.name]}`):field;
});
Pages.fields=Pages.fields.map(field=>{
  if(!('name' in field))return field;
  if(field.type==='group' && field.name==='visibility'){field.admin={...field.admin,hidden:true};return field;}
  if(field.name==='sections')return sectionMenu(field,'visibility.sections');
  if(field.name==='content')return sectionMenu(field,'visibility.introduction');
  return field;
});
for(const [after,name,label] of [['price','enquiry','Enquiry form'],['gallery','featuredReview','Featured review below photos'],['featuredReviewControl','navigation','Section navigation'],['reviewManagement','signup','Sign-up banner'],['policies','related','Related destinations'],['activities','floatingEnquiry','Floating enquiry bar']]){
  const index=Itineraries.fields.findIndex(field=>'name' in field&&field.name===after);
  Itineraries.fields.splice(index+1,0,sectionAction(`${name}Control`,label,`sectionVisibility.${name}`));
}
Pages.fields.unshift(sectionAction('navigationControl','Company information navigation','visibility.navigation'));

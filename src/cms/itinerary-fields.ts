import type {Field} from 'payload';
import {itineraryVisibilityField} from './section-visibility';

const links = (name: string, label: string): Field => ({
  name, label, type: 'array', fields: [
    {name: 'label', type: 'text', required: true},
    {name: 'href', type: 'text', admin: {hidden: true, description: 'Legacy URL; labels now open enquiries.'},
      validate: (value: string | null | undefined) => !value || (/^\/(?!\/)/.test(value) || /^https?:\/\//.test(value)) || 'Enter a site path or an HTTP URL.'},
  ],
});

export const itineraryPageFields: Field[] = [
  {name:'thumbnail',label:'Thumbnail image (listing cards)',type:'upload',relationTo:'media',admin:{description:'Used on homepage, search and package cards. This does not change photos inside the itinerary. If empty, the main image is used.'}},
  itineraryVisibilityField,
  {name: 'startCity', label: 'Start city', type: 'text'},
  {name: 'endCity', label: 'End city', type: 'text', admin: {description: 'Leave empty when the trip ends in the start city.'}},
  {name: 'gallery', label: 'Gallery photos', type: 'array', admin: {description: 'Add and reorder photos. These appear after the main package image.'}, fields: [
    {name: 'image', type: 'upload', relationTo: 'media', required: true},
  ]},
  {name: 'tourFAQs', label: 'Itinerary FAQs', type: 'array', fields: [
    {name: 'question', type: 'text', required: true},
    {name: 'answer', type: 'textarea', required: true},
  ]},
  {name: 'attractionsTitle', type: 'text', label: 'Attractions section heading'},
  links('attractions', 'More attractions'),
  {name: 'activitiesTitle', type: 'text', label: 'Things to do section heading'},
  links('activities', 'More things to do'),
  {name: 'policies', label: 'Booking policies', type: 'array', defaultValue: [
    {title: 'Confirmation Policy', content: ''}, {title: 'Refund Policy', content: ''},
    {title: 'Cancellation Policy', content: ''},
    {title: 'Payment Terms Policy', content: '100.0% of total tour cost will have to be paid 0 days before the date of booking'},
  ], fields: [{name: 'title', type: 'text', required: true}, {name: 'content', type: 'textarea'}]},
  {name: 'reviewManagement', type: 'ui', admin: {components: {Field: '@/components/cms-review-link#default'}}},
];

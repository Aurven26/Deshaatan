import type {CollectionBeforeChangeHook, CollectionAfterReadHook, Field} from 'payload';

const labels: Record<string, string> = {
  itinerary: 'Custom itinerary', callback: 'Request a callback', corporate: 'Corporate tour',
  partner: 'Partnership enquiry', 'airport-transfer': 'Airport transfer', 'car-rental': 'Car rental',
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

export function leadColumns(doc: Record<string, unknown>) {
  const details = object(doc.details);
  return {
    tripDuration: text(doc.tripDuration) || text(details.duration),
    travelStyle: text(doc.travelStyle) || text(details.style),
    enquirySource: text(doc.enquirySource) || text(details.title) ||
      (doc.kind === 'itinerary' && text(details.destination) ? `Custom itinerary — ${text(details.destination)}` : labels[text(doc.kind)] || text(doc.kind)),
  };
}

export const populateLeadColumns: CollectionBeforeChangeHook = ({data, originalDoc, operation}) => {
  const merged = {...originalDoc, ...data};
  const derived = leadColumns(merged);
  const details = {...object(merged.details)};
  const mapping = {name: 'name', phone: 'phone', email: 'email', adults: 'adults', children: 'children', tripDuration: 'duration', travelStyle: 'style', enquirySource: 'title'};
  const supplied = (field: string) => Object.prototype.hasOwnProperty.call(data, field)
    && (operation !== 'create' || data[field] !== null && data[field] !== undefined && data[field] !== '');
  for (const [field, key] of Object.entries(mapping)) {
    if (supplied(field)) details[key] = data[field];
  }
  return {...data, ...Object.fromEntries(Object.entries(derived).map(([key, value]) => [key, supplied(key) ? data[key] : value])), details};
};

export const readLeadColumns: CollectionAfterReadHook = ({doc}) => ({...doc, ...leadColumns(doc)});

export const leadTableFields: Field[] = [
  {name: 'tripDuration', label: 'Trip duration', type: 'text'},
  {name: 'travelStyle', label: 'Travel style', type: 'text'},
  {name: 'enquirySource', label: 'Enquiry for / source', type: 'text', admin: {description: 'The requested package or service, for example Golden Triangle or Car rental.'}},
  {name: 'editLead', label: 'Edit', type: 'ui', admin: {components: {Cell: '@/components/lead-edit-cell#default'}}},
];

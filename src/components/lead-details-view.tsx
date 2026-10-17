import type {DocumentViewServerProps} from 'payload';
import type {Lead} from '@/payload-types';
import LeadDetailsEditor from './lead-details-editor';

export default function LeadDetailsView({doc}: DocumentViewServerProps) {
  return <LeadDetailsEditor initialLead={doc as Lead} />;
}

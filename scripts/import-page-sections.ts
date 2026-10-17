import {getPayload} from 'payload';
import config from '../src/payload.config';
import {backfillPageSections} from '../src/cms/page-content';
const payload=await getPayload({config});
await backfillPageSections(payload);
console.log('Existing page content imported into editable sections, including drafts.');
await payload.destroy();process.exit(0);

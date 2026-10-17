import {getPayload} from 'payload';
import config from '../src/payload.config';
import {backfillThumbnails} from '../src/cms/backfill-thumbnails';
const payload=await getPayload({config});
await backfillThumbnails(payload);
console.log('Existing listing thumbnails preserved separately from itinerary photos.');
await payload.destroy();process.exit(0);

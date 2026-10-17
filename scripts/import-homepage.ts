import {getPayload} from 'payload';
import config from '../src/payload.config';
import {importHomepage} from '../src/cms/import-homepage';
const payload=await getPayload({config});
await importHomepage(payload);
console.log('Home Page and original website images imported. Existing edits preserved.');
await payload.destroy();
process.exit(0);

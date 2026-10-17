import config from '@payload-config';
import {REST_GET,REST_POST,REST_DELETE,REST_PATCH,REST_PUT,REST_OPTIONS} from '@payloadcms/next/routes';
import {securedRoute} from '@/cms/secured-route';

export const GET=securedRoute(REST_GET(config));
export const POST=securedRoute(REST_POST(config));
export const DELETE=securedRoute(REST_DELETE(config));
export const PATCH=securedRoute(REST_PATCH(config));
export const PUT=securedRoute(REST_PUT(config));
export const OPTIONS=securedRoute(REST_OPTIONS(config));

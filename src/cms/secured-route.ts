import type {NextRequest} from 'next/server';
import {requestGuard} from './request-security';

type Context = {params: Promise<{slug?: string[]}>};
type Handler = (request: NextRequest, context: Context) => Promise<Response>;

export function observePublicRoute(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    const route = new URL(request.url).pathname;
    try {
      const response = await handler(request);
      if (response.status === 400 || response.status >= 500) {
        const entry = JSON.stringify({event: response.status === 400 ? 'invalid_request' : 'api_failure', timestamp: new Date().toISOString(), route, status: response.status});
        if (response.status >= 500) console.error(entry); else console.warn(entry);
      }
      return response;
    } catch {
      console.error(JSON.stringify({event: 'api_exception', timestamp: new Date().toISOString(), route}));
      return Response.json({error: 'Something went wrong.'}, {status: 500});
    }
  };
}

/** Wrap Payload's REST entry point, including its built-in auth and upload endpoints. */
export function securedRoute(handler: Handler): Handler {
  return async (request, context) => {
    const pathname = new URL(request.url).pathname;
    const auth = /^\/cms-api\/users\/(login|forgot-password|reset-password|first-register|refresh-token)\/?$/.test(pathname);
    const upload = ['POST', 'PATCH', 'PUT'].includes(request.method) && request.headers.get('content-type')?.startsWith('multipart/form-data');
    const rejection = await requestGuard(request, auth ? `auth:${pathname}` : upload ? 'uploads' : 'cms', auth || upload ? 5 : 60, auth ? 900 : 60);
    if (rejection) return rejection;
    // Payload's development fallback prints reset links to stdout. Never trigger it
    // through a public endpoint when a real mail transport has not been configured.
    if (/^\/cms-api\/users\/forgot-password\/?$/.test(pathname) && !process.env.SMTP_HOST) return Response.json({error: 'Password recovery is temporarily unavailable.'}, {status: 503});
    try {
      const response = await handler(request, context);
      if (response.status >= 500) {
        console.error(JSON.stringify({event: 'api_failure', timestamp: new Date().toISOString(), route: pathname, status: response.status}));
        return Response.json({error: 'Something went wrong.'}, {status: response.status});
      }
      if (response.status === 400) console.warn(JSON.stringify({event: 'invalid_request', timestamp: new Date().toISOString(), route: pathname}));
      return response;
    } catch {
      // Do not log request bodies, auth headers, or database exceptions containing credentials.
      console.error(JSON.stringify({event: 'api_exception', timestamp: new Date().toISOString(), route: pathname}));
      return Response.json({error: 'Something went wrong.'}, {status: 500});
    }
  };
}

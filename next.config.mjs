import {withPayload} from '@payloadcms/next/withPayload';

const production = process.env.NODE_ENV === 'production';
const csp = [
  "default-src 'self'",
  // Next hydration and Payload's editor require inline scripts/styles. No external script hosts.
  `script-src 'self' 'unsafe-inline'${production ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.blob.vercel-storage.com${production ? '' : ' ws: wss:'}`,
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'",
  ...(production ? ['upgrade-insecure-requests'] : []),
].join('; ');

export default withPayload({
  poweredByHeader: false,
  async headers() {
    return [{source: '/:path*', headers: [
      {key: 'Content-Security-Policy', value: csp},
      {key: 'X-Frame-Options', value: 'DENY'},
      {key: 'X-Content-Type-Options', value: 'nosniff'},
      {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
      {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
      ...(production ? [{key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains'}] : []),
    ]}];
  },
});

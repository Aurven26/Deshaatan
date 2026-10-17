import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {getCMS} from '../src/cms/client';
import {requestGuard} from '../src/cms/request-security';

const base = 'http://127.0.0.1:3000';
const payload = await getCMS();
const users: number[] = [];
let mediaID: number | undefined;
const originalHeader = process.env.TRUSTED_PROXY_IP_HEADER;
try {
  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.equal(home.headers.get('x-frame-options'), 'DENY');
  assert.equal(home.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(home.headers.get('x-powered-by'), null);
  assert.ok(home.headers.get('content-security-policy')?.includes("object-src 'none'"));
  for (const collection of ['leads', 'applications', 'private-files', 'users', 'request-limits']) {
    assert.equal((await fetch(`${base}/cms-api/${collection}`)).status, 403);
  }
  assert.equal((await fetch(`${base}/cms-api/users/login`, {method: 'POST', headers: {'Content-Type': 'application/json', Origin: 'https://untrusted.example'}, body: '{}'})).status, 403);
  const suffix = randomUUID();
  const password = `${randomUUID()}9!`;
  for (let i = 0; i < 2; i++) {
    const user = await payload.create({collection: 'users', overrideAccess: true, data: {name: 'Disposable security check', email: `security-${suffix}-${i}@example.invalid`, password, role: 'customer'}});
    users.push(user.id);
  }
  const login = await payload.login({collection: 'users', data: {email: `security-${suffix}-0@example.invalid`, password}});
  assert.ok(login.token);
  assert.ok(login.exp && login.exp - Math.floor(Date.now() / 1000) <= 3600);
  const headers = {Authorization: `JWT ${login.token}`, 'Content-Type': 'application/json', Origin: base};
  const own = await fetch(`${base}/cms-api/users/${users[0]}`, {headers});
  assert.equal(own.status, 200);
  const other = await fetch(`${base}/cms-api/users/${users[1]}`, {headers});
  assert.ok([403, 404].includes(other.status));
  const escalation = await fetch(`${base}/cms-api/users/${users[0]}`, {method: 'PATCH', headers, body: JSON.stringify({role: 'admin'})});
  assert.ok([200, 403].includes(escalation.status));
  assert.equal((await payload.findByID({collection: 'users', id: users[0], overrideAccess: true})).role, 'customer');
  assert.equal((await fetch(`${base}/cms-api/leads`, {headers})).status, 403);

  const png = await sharp({create: {width: 2, height: 2, channels: 3, background: '#fff'}}).png().toBuffer();
  await assert.rejects(payload.create({collection: 'media', overrideAccess: true, data: {alt: 'Invalid fixture'}, file: {data: png, name: 'disguised.jpg', mimetype: 'image/jpeg', size: png.length}}));
  await assert.rejects(payload.create({collection: 'media', overrideAccess: true, data: {alt: 'Invalid fixture'}, file: {data: png, name: 'script.html', mimetype: 'image/png', size: png.length}}));
  const media = await payload.create({collection: 'media', overrideAccess: true, data: {alt: 'Disposable security check'}, file: {data: png, name: 'original-personal-name.png', mimetype: 'image/png', size: png.length}});
  mediaID = media.id;
  assert.match(media.filename || '', /^[a-f0-9-]{36}\.png$/);

  // Isolate direct guard tests from the browser's IP and never exhaust its minute bucket.
  process.env.TRUSTED_PROXY_IP_HEADER = 'x-security-check';
  for (const [scope, limit, seconds] of [['general', 60, 60], ['uploads', 5, 60], ['auth', 5, 900]] as const) {
    const request = new Request(`${base}/api/security-check`, {headers: {'x-security-check': randomUUID(), Origin: base}});
    const isolatedScope = `security-check:${scope}:${suffix}`;
    for (let i = 0; i < limit; i++) assert.equal(await requestGuard(request, isolatedScope, limit, seconds), null);
    const rejected = await requestGuard(request, isolatedScope, limit, seconds);
    assert.equal(rejected?.status, 429);
    const retry = Number(rejected?.headers.get('Retry-After'));
    assert.ok(retry >= 1 && retry <= seconds);
  }
  // Check the actual built-in Payload auth endpoint, not only the helper.
  for (let i = 0; i < 5; i++) {
    const response = await fetch(`${base}/cms-api/users/first-register`, {method: 'POST', headers: {'Content-Type': 'application/json', Origin: base}, body: '{}'});
    assert.ok([403, 429].includes(response.status));
    if (response.status === 429) break; // A previous local test may still own this 15-minute bucket.
  }
  const limited = await fetch(`${base}/cms-api/users/first-register`, {method: 'POST', headers: {'Content-Type': 'application/json', Origin: base}, body: '{}'});
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('Retry-After')) > 0);
  console.log('Security checks passed: headers, CORS, ownership, role escalation, uploads, one-hour tokens, API/auth/upload limits.');
} finally {
  if (originalHeader === undefined) delete process.env.TRUSTED_PROXY_IP_HEADER; else process.env.TRUSTED_PROXY_IP_HEADER = originalHeader;
  if (mediaID) await payload.delete({collection: 'media', id: mediaID, overrideAccess: true});
  for (const id of users) await payload.delete({collection: 'users', id, overrideAccess: true});
  await payload.destroy();
}
process.exit(0);

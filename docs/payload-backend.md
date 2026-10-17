# Deshaatan CMS

Payload 3.90.2 is integrated with the existing Next.js application. PostgreSQL stores CMS content,
accounts, reviews, applications, enquiries and request-limit counters. Existing website data was
imported by `scripts/seed-cms.ts`; that data includes the original design reference copy and must
be reviewed editorially before publishing a production travel catalogue.

## Local setup

PostgreSQL 17 was installed with Homebrew. The dedicated database cluster lives in
`.data/postgres/cluster`, listens only on `127.0.0.1:5433`, and requires SCRAM authentication.
`deshaatan_app` owns only its database and has no superuser, role-creation or database-creation permissions.
Connection settings and the Payload secret are stored in ignored `.env.local`.

```sh
npm install
npm run db:local
npm run cms:seed
npm run cms:importmap
npm run dev
```

Website: http://127.0.0.1:3000/. Admin: http://127.0.0.1:3000/admin.
The first local administrator's generated credentials are in `.data/local-admin.json`.
This account is for local development; create your production administrator through a controlled
bootstrap workflow using production credentials, not by copying the local account.

The previous pnpm dependencies and build cache were preserved in `.data/pre-cms-*`.
`package-lock.json` is the active npm lockfile. The old pnpm lockfile was removed so Vercel selects npm.

## Collections and access

| Collection | Public access | Editors | Support | Administrators |
| --- | --- | --- | --- | --- |
| Itineraries, guides, destinations, pages, FAQs, testimonials | Published records | Edit drafts and publish | Published records | Full access |
| Media | Read images | Upload/edit | Read | Full access |
| Leads, applications, private files | None | Read/update enquiries | Read/update enquiries | Full access |
| Reviews | Published reviews | Moderate | Moderate | Full access |
| Users | Own record after login | Own record | Own record | Manage users and roles |

Public collection creation is disabled for enquiries and accounts. Validated application routes
perform narrowly scoped Local API writes. The registration endpoint always creates the customer
role and cannot assign staff roles. Session cookies are HTTP-only and secure in production.
Payload hashes passwords, limits login attempts and provides token expiration and authentication endpoints.

## Frontend and APIs

The frontend layout loads published CMS content with the Local API and provides it to the existing
components. Its public routes retain their existing URLs and use a 60-second revalidation interval.
Content collection hooks revalidate the frontend when an editor saves content. Admin HTML and CSS
are isolated in their own route group. Policy pages and the existing itinerary page load CMS records.

Existing form endpoints retain their paths and now write database records. Callback forms additionally
use `/api/callback-requests`. The REST API lives at `/cms-api`; the application owns `/api` routes.
`/api/account/login`, `/register`, `/logout` and `/forgot-password` handle customer account operations.
Forgot-password delivery requires SMTP. Google and SMS/OTP providers are not configured.

Private files are accessed through Payload permission checks. Local uploads use `.data/media` and
`.data/private-files`, which are outside the public directory. Public images have generated card and
hero sizes. Applications accept PDFs up to 2 MB. Reviews accept up to six JPG/PNG photos with a
combined 3 MB limit, checked in the browser and API. CMS uploads are capped at 3 MB to leave room
for multipart metadata below Vercel's function request limit.

Admin Live Preview is available for the existing itinerary and information-page layouts. Preview
routes require an administrator or editor session and query drafts with access checks enabled.
The original detailed itinerary and policy layouts are preserved in JSON fields during migration;
new page/layout types need corresponding frontend renderers.

## Production providers

Fill the variables documented in `.env.example`. Do not commit secrets.

* Use a hosted PostgreSQL URL accessible to the Vercel build and runtime. The local database is not
  reachable from Vercel. Generate a separate production `PAYLOAD_SECRET` and configure the public URL.
* `BLOB_READ_WRITE_TOKEN` must belong to a public Vercel Blob store used for website images.
* `PRIVATE_BLOB_READ_WRITE_TOKEN` must belong to a private Blob store used for CVs and unmoderated
  review photos. `src/cms/private-blob.ts` uses the Vercel SDK because Payload's stock Blob adapter
  supports public files only. Public links cannot retrieve these private blobs.
* Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `SMTP_FROM`.
  Provider delivery and Blob operations cannot be verified until those credentials are supplied.

Development schema push is disabled in production. Run the migrations against the production
database before serving traffic. The initial migration was verified against a separate fresh local
PostgreSQL database. Generate and review further migrations when modifying collection schemas.

## Verification and remaining work

```sh
npm run typecheck
npm run lint
npm run build
node scripts/check-cms.mjs
node scripts/check-migration.mjs
```

The integration checks exercise real HTTP requests, PostgreSQL persistence, role escalation protection,
private record and file access, image resizing, CV uploads and validation. Test records are removed
after successful checks. The migration check retains its isolated database for inspection.

Production is not ready for deployment until provider credentials are verified, the hosted database
is migrated, the remaining dependency advisory is resolved or reviewed, and imported content is approved.
The audit report is in `docs/production-audit-2026-10-13.md`. Eight historic filesystem enquiries/reviews were
imported using `scripts/import-historic-records.ts`; their original files remain preserved under `.data`.

The dependency audit reports an upstream `braces` stack-exhaustion advisory with no published fix
(GHSA-vfj7-8cjw-p6xm). Available patches for Next.js, sharp, undici, DOMPurify, nodemailer and esbuild
were applied. Do not use `npm audit fix --force` without reviewing its proposed CMS downgrade.

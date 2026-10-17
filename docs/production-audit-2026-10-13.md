# Production audit — 13 October 2026

## Decision

**Local verification passes; production sign-off is blocked.** This report records the fixes and tests performed, not a claim that every possible defect or security vulnerability has been eliminated. No deployment, Git push, or production data change was performed.

The installed stack is Next.js 16.3.8, React 19.3.0, Payload 3.90.2 and PostgreSQL 17, rather than the Next.js 15 version described in the brief. The existing compatible stack was retained.

## 1. Issues found

| Finding | Cause | Resolution |
| --- | --- | --- |
| CMS-generated itinerary URLs could return 404 | Only a single hardcoded tour route existed | Added a published-content dynamic route |
| Tour title, price, duration and image edits did not consistently reach the detail view | Renderer read the migrated JSON rather than collection fields | Collection values now take precedence |
| Structured tour text edits were ignored | Overview/schedule/inclusion fields were not connected to the legacy renderer | Connected populated fields, retaining legacy content when migration arrays are empty |
| Tour ratings, review counts and review cards were sample data | UI read design fixtures | Public tour pages now read moderated, published CMS reviews; counts and ratings are computed from those records |
| JSON request limits were checked after allocation | Endpoints called `request.text()` first | Shared reader stops at the byte limit while streaming |
| Invalid callback email and punctuation-only phone could reach persistence | Incomplete validation | Invalid values receive HTTP 400 |
| Uploads could remain unlinked after a failed application/review save | File and record creation were separate operations | Added cleanup on failed record creation |
| Review uploads could exceed Vercel's request limit | UI allowed six 5 MB files in one request | Shared 3 MB combined limit with visible UI guidance; CMS uploads also capped at 3 MB |
| Reviews accepted only one hardcoded itinerary | API checked a literal slug | Validates the slug and checks the published itinerary in PostgreSQL |
| Invalid review image content returned a service failure | Validation and persistence errors shared one response | Invalid files return HTTP 400; persistence failures return HTTP 503 |
| Guide edits and new guide thumbnails were disconnected | Dialog/search used static summaries and array-position image names | Both use CMS guide summaries/images with safe legacy fallbacks |
| Missing/unpublished destination relation could crash content loading | Null treated as an object | Added null guards |
| Deleted content and global edits could leave stale public pages | Missing revalidation hooks | Added deletion/global invalidation hooks, including review moderation |
| Enquiry errors could be inaccessible inside a modal | Error was shown outside the modal | Inline alert, accessible dialog title and pending-state safeguards |
| Repeated account/enquiry submissions were possible | Missing disabled/busy state | Added pending-state protection |
| Contact page/social settings differed from the CMS | Hardcoded contact values | Connected email, phone, address and Instagram URL |
| Expired August 2026 promotion remained visible | Static promotional copy | Replaced with a general tour-package link |
| CLI scripts required `.env.local` even in hosted environments | Mandatory Node env-file flag | Optional env-file loading; direct `tsx` dependency and Node engine constraint |
| Tour TypeScript shape incorrectly depended on sample-object inference | Inferred union required unrelated optional fields | Explicit reusable `Tour` type |

## 2. Issues fixed

The resolutions above are implemented. Temporary records created by the integration checks were removed. Existing user data and unrelated working-tree changes were preserved. Invalid imported tour JSON is checked before rendering rather than blindly asserted to be a valid tour.

## 3. Files modified

Changes from this audit, separate from the earlier CMS implementation:

- `package.json`, `package-lock.json`
- `src/cms/request-body.ts`, `src/cms/tour.ts`, `src/cms/content.ts`, `src/cms/fields.ts`, `src/cms/collections.ts`
- `src/payload.config.ts`, `src/data/golden-triangle.ts`, `src/lib/upload-limits.ts`, `src/lib/vehicle-enquiries.ts`
- `src/app/api/account/[action]/route.ts`, `src/app/api/callback-requests/route.ts`, `src/app/api/itinerary-requests/route.ts`, `src/app/api/contact-requests/route.ts`, `src/app/api/reviews/route.ts`
- `src/app/(frontend)/tours/[slug]/page.tsx` replaces the single hardcoded tour route
- `src/app/(frontend)/preview/[type]/[slug]/page.tsx`, `src/app/(frontend)/(information)/contact-us/page.tsx`
- `src/components/site-dialog.tsx`, `src/components/tour-detail.tsx`, `src/components/auth-popup.tsx`, `src/components/write-review-popup.tsx`, `src/components/search-popup.tsx`, `src/components/site-footer.tsx`, `src/components/site-chrome.tsx`
- `scripts/check-audit.mjs`, this report and `docs/payload-backend.md`

## 4. Remaining risks and launch blockers

1. **Production services are unverified.** Both Blob tokens and SMTP credentials are absent. No remote upload, email delivery or password-reset email round trip has been verified. The configured PostgreSQL database is local and cannot serve Vercel. A hosted database, production URL, production secret, migrations and actual deployment testing are still required.
2. **Dependency advisory remains.** `npm audit` reports ten high-severity dependency entries arising from one underlying `braces` advisory. The [GitHub advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) lists no patched version. No application endpoint intentionally accepts brace/glob patterns, but this is not proof of non-exploitability throughout the dependency graph. Do not apply npm's suggested incompatible CMS downgrade automatically.
3. **Editorial approval is required.** Imported itinerary content includes inconsistent trip lengths, unrelated Iceland/Thailand inclusions, sample FAQs and booking-policy copy. These were supplied as design content. Correct contractual tour details must come from the business. Sample review cards were removed from the public tour renderer; other imported testimonials/catalogue claims still need editorial review.
4. **Integration boundaries remain.** Detailed pages use the existing imported layout format. Entirely new layout types are not implemented. Policy pages still rely on their imported JSON structure and static route metadata. A complete live-preview refresh/edit workflow has not been browser-tested. Google/OTP sign-in providers are not configured; email/password login is tested.
5. **Scale and coverage limits.** No production load test, exhaustive accessibility certification, independent penetration test, or byte-by-byte manual review of every generated/binary/dependency file was performed. Public content queries have finite catalogue limits, and the tour review view currently loads up to 100 published reviews. Pagination and aggregates should be extended before exceeding those capacities. Successful checks do not establish that no other defects exist.
6. **Install warnings.** npm blocked optional `esbuild`/`fsevents` installation scripts. The actual build, TypeScript execution and CMS tests succeeded. Production CI must still be checked on its own platform.

The new upload limits leave space beneath Vercel's documented [4.5 MB request-body limit](https://vercel.com/docs/functions/limitations#request-body-size). Remote Blob behavior still requires provider verification.

## 5. Performance improvements

- Itinerary lookup is deduplicated within a render using React cache.
- Dynamic tour routes support on-demand generation and a 60-second revalidation interval.
- Save/delete/global hooks invalidate public content; moderation invalidates displayed reviews.
- Request bodies are bounded during reading, and review upload buffering is substantially reduced.
- PostgreSQL pool remains capped at five connections per application instance. Hosted pool capacity must be checked against Vercel instance concurrency.

## 6. Security improvements and evidence

- Streaming request limits, cross-origin rejection, input validation and database-backed rate limiting were exercised through HTTP requests.
- Public access to users, leads, applications, private files and request counters was denied.
- Public users could not publish reviews directly; new reviews remained hidden until moderation.
- Booking IDs and private photo relationships were absent from public review responses.
- Customer registration could not assign an administrator role. Authentication issued an HttpOnly cookie.
- Anonymous access to an uploaded CV was denied; public image upload and resizing worked.
- `.env.local` and local administrator credentials remain Git-ignored.
- Database inspection found 41 primary keys, 62 foreign keys and 239 indexes. The application role has no superuser, database-creation or role-creation privileges.
- Static import inspection covered 60 source modules and found no runtime import cycles in the inspected import declarations.

## 7. Build status

`npm install` and `npm run build` pass. Production output contains public static/ISR pages, on-demand itinerary pages and dynamic admin/API/preview routes. The audit warning described above remains; installation success is not a clean security audit.

## 8. TypeScript status

`npm run typecheck` passes with strict TypeScript enabled.

## 9. Lint status

`npm run lint` passes. Generated Payload types, migration files and import maps are excluded by the existing lint configuration.

## 10. Payload status

Local Payload starts. Browser login reaches the dashboard with collections and globals visible and no recorded console errors. HTTP integration tests cover authentication, access checks, image resizing, CV uploads, persisted enquiries, drafts, publishing, versions, review moderation and request throttling.

## 11. PostgreSQL status

Local PostgreSQL starts on `127.0.0.1:5433` and application queries work. Both committed migration definitions ran against a fresh isolated database and produced 41 tables. Verification database `deshaatan_migration_check_1fe95ebc` was retained for inspection; the application's original database was not replaced.

## 12. Overall project health

**70/100 — engineering assessment, not a security certification.** Local build and principal workflows are working. Production service verification, editorial correctness, dependency risk resolution and the coverage limitations above prevent production sign-off.

All nine public top-level pages plus the existing tour page were opened in the browser. No console errors or broken loaded images were recorded during those checks. A 390 px package-page viewport had no horizontal overflow; its custom-trip modal and traveller count were exercised. This does not substitute for a full cross-browser/device matrix.

### Repeatable checks

```sh
npm install
npm run db:local
npm run dev
# In another terminal:
npm run lint
npm run typecheck
npm run build
node scripts/check-cms.mjs
node scripts/check-audit.mjs
node scripts/check-migration.mjs
```

The tests use local administrator credentials and disposable records. The migration test intentionally retains a separate database. Do not point these local scripts at production.

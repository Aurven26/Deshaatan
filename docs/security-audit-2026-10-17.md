# Security audit — 17 October 2026

This is a local code hardening and regression report, not a production security certification. No deployment, Git push, remote credential rotation, or production data change was performed.

## Implemented and retained controls

- No hardcoded provider keys or database credentials were found by the source/assets pattern scan. The only database-URL pattern matches were scripts constructing URLs from generated local passwords, not embedded credentials. `.env.local` and `.data/local-admin.json` are ignored; neither environment file appears in the checked Git history. This is not a guarantee against every possible secret format or a scan of a remote deployment.
- `.env.example` lists application configuration names with empty values. `NEXT_PUBLIC_SERVER_URL` is the only application public environment variable; it contains a public origin, not a credential. Payload and storage credentials remain server-side. Issued login session tokens are authentication responses, not provider secrets.
- Database-backed, atomic rate counters cover every exported custom API and Payload REST method. All share a 60 requests/minute/IP bucket. Auth endpoints have an additional 5 requests/15-minute/IP bucket; multipart CMS uploads, reviews, and contact forms have 5/minute limits. Existing enquiry limits remain stricter than the general limit. A 429 includes the remaining fixed-window seconds in `Retry-After`. Counters survive restarts and work across app instances sharing the database; database failures fail closed.
- CORS and CSRF use an explicit origin list. Cross-origin requests outside it return 403. REST exports are limited to supported methods; each custom public route supports POST only. No GraphQL route is exposed by this application.
- Public forms retain server-side required-field, length, enum, date, traveller-count, phone, email, body-size and file validation. Integer parsing now rejects booleans, arrays, null and non-decimal strings instead of coercing them. Payload validates CMS data using its field schemas and uses the PostgreSQL adapter; rate counter queries are parameterized SQL.
- CMS role and ownership rules remain enforced by Payload: customers can access their own user record, cannot grant themselves a role, and cannot read leads, applications or private uploads. Staff roles are explicitly scoped; public content must be published and customer reviews cannot bypass moderation. PostgreSQL RLS was not enabled: this server-managed Payload pool does not carry an end-user database identity. Payload's per-request access filters are the authorization boundary; the database must not be exposed directly to clients.
- Payload authentication is retained. Installed version 3.90.2 uses versioned PBKDF2-SHA256 with 600,000 iterations for new passwords, not plaintext or a custom application hash. This deliberately retains the supported library rather than introducing an incompatible bcrypt/argon2 replacement. New/changed passwords must be 8–128 characters, sessions now expire after one hour, cookies are HttpOnly/SameSite=Lax and Secure in production, and five failed logins trigger the existing ten-minute account lockout. No refresh credentials are stored in browser localStorage. Existing saved-tour preferences there are not authentication tokens.
- Built-in password recovery refuses requests when SMTP is absent, preventing Payload's development fallback from printing reset emails through the public endpoint. The custom recovery endpoint already had this guard.
- Security headers now include CSP, DENY framing, nosniff, strict-origin-when-cross-origin and Permissions-Policy. Production additionally gets HSTS and upgrade-insecure-requests. X-Powered-By is disabled. CSP blocks external scripts/objects and limits connections; inline scripts/styles remain allowed for Next hydration and Payload editor compatibility. It is not a strict nonce-based CSP. DENY framing intentionally prevents embedded/iframe previews; open previews directly if needed.
- Media and private files run a shared hook before storage: extension/type agreement, byte size, PDF signature or Sharp image metadata validation, image pixel limits, and UUID filenames. Remote-URL uploads are disabled. CMS image limit is 5 MiB and PDF limit 25 MiB. Existing public form limits remain intentionally stricter (3 MiB combined review photos, 2 MiB resumes), compatible with the hosting request-body ceiling. Local uploads stay outside `public/`, and private Vercel Blob downloads require a staff role. Storage files are served as data, not executed. Existing filenames are preserved; new uploads receive UUID names.
- Custom API errors remain generic, and unexpected CMS API failures are replaced with generic responses. Structured server logs record timestamp, route and status without request bodies, passwords, headers, or raw database exception messages. No third-party logging service was connected without credentials or a provider choice.
- No application LLM endpoints, provider SDKs, or LLM keys were found. Token budgets and prompt-injection mitigations are therefore not applicable.

## Local verification

- TypeScript and focused ESLint checks passed.
- The optimized production build passed. Production-mode localhost responses were checked for HSTS, CSP without unsafe-eval, DENY framing and no X-Powered-By. The temporary production server was stopped; the normal dev server remains running.
- All 76 generated browser JavaScript files were scanned against configured database, Payload, storage and SMTP secret values; no matches were found.
- `scripts/check-security.ts`: headers, disallowed origins, anonymous private-collection reads, cross-user access, role escalation, one-hour session expiry, rejected disguised uploads, UUID image storage, and general/upload/auth 429 limits passed. Temporary test users and media were removed in `finally`.
- `scripts/check-audit.mjs`: existing forms, request limits, private collections, draft publication/versioning, review moderation and private review fields passed. Temporary records were removed.

Run locally with the configured local database and dev server:

```sh
node --env-file=.env.local --import tsx scripts/check-security.ts
node scripts/check-audit.mjs
```

The checks create and delete disposable local records. Do not point them at production. The auth test can leave the first-user-registration endpoint rate-limited for up to 15 minutes; normal CMS login uses a separate bucket.

## Deployment actions still required

1. Set the real HTTPS `NEXT_PUBLIC_SERVER_URL` and optional comma-separated `ALLOWED_ORIGINS` (origins only, no paths or wildcard). Configure secrets directly in hosting settings. Do not commit environment files.
2. On Vercel, the guard uses the platform IP header ([official header reference](https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for)). Elsewhere set `TRUSTED_PROXY_IP_HEADER` only to a header the trusted ingress overwrites; block direct access that bypasses ingress. Without that setting traffic shares a conservative bucket. Never trust a client-supplied forwarded header.
3. Configure and test SMTP and Vercel Blob credentials, password recovery, private-file downloads and upload size limits in the actual hosting environment. The local configuration has no SMTP adapter. Vercel function request-size limits still apply even if the CMS allows a larger PDF.
4. Restrict PostgreSQL network access to the application/administration network; require TLS for remote database connections and use a least-privilege app role. Local setup binds PostgreSQL to loopback. Production firewall, TLS and backup policy cannot be verified from this checkout.
5. Verify HTTPS, HSTS, headers, origin handling, session cookies and multi-instance rate limits after deployment. Production debug/schema-push mode is disabled by `NODE_ENV=production`. Review operational limits before increasing traffic.
6. Dependency advisory status is documented below. Do not apply an incompatible CMS downgrade or an unreviewed third-party fork automatically.
7. Connect a log collector/alerting provider if desired; this change emits structured server logs but does not provision Sentry or external monitoring. A strict nonce-based CSP is a separate compatibility improvement.

## Dependency advisory status

The approved `npm audit` on 17 October 2026 reports 10 high-severity package findings, all attributed to the single advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) for `braces <=3.0.3`. The lockfile contains `braces@3.0.3`. The report lists no patched version and no automatic fix for the vulnerable `braces` path. Its one suggested change would downgrade `@payloadcms/richtext-lexical` from 3.90.2 to 0.11.4 across a major-version boundary, which is incompatible with this Payload 3 application and was not applied.

The ten entries arise from these two dependency paths:

- `@payloadcms/next → sass@1.77.4 → chokidar@3.6.0 → braces@3.0.3`
- `@payloadcms/storage-vercel-blob → @payloadcms/plugin-cloud-storage → find-node-modules → findup-sync → micromatch → braces@3.0.3`

The app source has no direct use of `braces`, `micromatch`, or glob-pattern compilation. The installed Payload cloud-storage package's published `dist` files also contain no reference to its declared `find-node-modules` dependency; this unused dependency path is tracked upstream in [Payload issue #18623](https://github.com/payloadcms/payload/issues/18623). Sass is used by the framework's stylesheet build path. Based on these code paths, no public request field currently supplies a brace/glob pattern to the vulnerable parser. This narrows the demonstrated exposure, but it does not remove the package findings or replace an upstream fix.

No dependency override, forced downgrade, or third-party fork was installed. The `braces` maintainer disputes the reported scenario in [upstream issue #70](https://github.com/micromatch/braces/issues/70), while the advisory remains published. Keep the finding visible in CI; reconsider an official dependency update when Payload or the affected packages publish a compatible release. Avoid passing user-controlled glob/brace patterns to these libraries in the meantime.

# Neon database setup

This application uses Payload's existing `@payloadcms/db-postgres` adapter
(node-postgres and Drizzle) on the Next.js Node runtime. The Neon configuration
declares Postgres only. Payload continues to manage authentication; uploaded
files continue to use the configured storage adapter.

## Configuration

- `.neon` links project `falling-mouse-55712702`, organization
  `org-dark-field-30617051`, branch `production`. It is Git ignored.
- `neon.ts` declares the branch policy. It contains no credentials.
- `DATABASE_URL` is the pooled application connection provided by `neon deploy`.
- `DATABASE_URL_UNPOOLED` is the direct connection for migrations and data transfer.
- `PAYLOAD_SECRET` must stay unchanged when moving existing CMS accounts.
- `npm run cms:migrate` selects the direct connection and refuses a pooled Neon
  connection. Automatic development schema push is disabled for Neon databases.
- On Vercel, Payload's pool is registered with `attachDatabasePool` for Fluid
  compute connection lifecycle management. The pool is limited to five connections.

## Deploy configuration changes

The CLI is authenticated. For future service configuration changes:

```sh
neon config plan
neon deploy
```

Review the plan before applying it to the production branch. Deployment pulls
Neon-managed environment variables into `.env.local` (or `.env` when present).
The previous local environment was backed up in the ignored `.data` directory.

Before any future data import, inspect the target database. Do not overwrite
existing application data. Test new migrations on a Neon branch before applying
them to production with `npm run cms:migrate`.

Run `npm run build`, start the app, then run `npm run cms:check-neon`.
For a separate local port, use
`CHECK_BASE_URL=http://127.0.0.1:3001 npm run cms:check-neon`.
The check verifies content, CMS login, enquiry creation, authenticated CMS reads
and edits, and deletion. It checks the enquiry directly in Neon to prove that
the HTTP app is using the configured remote database. It removes its fixture.

## Completed setup — 2026-10-17

- Neon CLI 8.8.0 installed at `~/.local/bin/neon`.
- Codex Neon plugin installed, including its skills and OAuth MCP configuration.
- Initial `neon init` created `neon.ts` and an offline link. After the owner
  signed in, `neon config plan` and `neon deploy` verified the production branch:
  no service changes were needed; Postgres was already provisioned.
- Deployment pulled `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `NEON_BRANCH`.
  All unrelated environment values were preserved.
- With the owner's explicit approval, copied the existing local CMS database
  first to a temporary Neon verification branch, then to the empty production
  branch. Both copies passed exact row-count checks across all 106 tables.
- Preserved 1 user, 11 itineraries (10 published), 17 leads, and 39 media records,
  along with all other content, draft/version records, and relationships.
- The restored schema matched the latest committed snapshot: 106 tables,
  1,146 columns, and all enum definitions. Replaced the development schema-push
  marker with the nine already-applied migrations. The normal migration runner
  was tested on the temporary branch and completed without schema changes.
- `npm run build` passed with the Neon production database. The production app
  started in 76 ms. End-to-end checks passed for the pooled connection, content,
  CMS login, lead access control, and enquiry create/read/edit/delete. No fixture
  enquiry remains. Existing media also returned HTTP 200.
- Focused ESLint passed for the Payload config and new scripts.
- Removed the temporary verification branch after success. The production
  branch and original local database remain. The localhost dev app was restarted
  at `http://127.0.0.1:3000` using Neon.
- The original local env and a consistent 666 KB PostgreSQL backup are retained
  in the Git-ignored `.data` directory. The dump has owner-only permissions.
- Dependency installation reported 10 high-severity advisories; no forced
  dependency upgrades were performed as part of this database setup.
- The current pg driver emits a forward-looking SSL-mode notice; connections
  succeed with its present full-certificate-verification behavior.

## Files changed for the integration

- `neon.ts`: CLI-created Postgres-only policy, preserved during verification.
- `.gitignore`: excludes the local `.neon` project link.
- `.env.example`: documents `DATABASE_URL_UNPOOLED`.
- `src/payload.config.ts`: retains Payload's pg adapter, configures pool timeouts,
  attaches Vercel Fluid pool lifecycle handling, and disables schema push on Neon.
- `package.json` / `package-lock.json`: Neon config/env packages, Vercel pool
  helper, direct pg dependency, migration command, and Neon verification command.
- `scripts/migrate-cms.mjs`: direct-connection migration runner.
- `scripts/transfer-local-to-neon.mjs`: refuses non-local sources and populated
  or pooled targets; backs up, restores transactionally, and compares row counts.
- `scripts/baseline-cms-migrations.mjs`: validates the migration snapshot before
  adopting an existing development schema into migration history.
- `scripts/check-neon.mjs`: HTTP/database integration verification and cleanup.
- User-level Codex Neon plugin: installed previously, then confirmed enabled;
  includes nine skills and the OAuth MCP server at `https://mcp.neon.tech/mcp`.
  No duplicate per-project MCP or skill installation was created. Live MCP tools
  were not available in this running agent session; remote operations used the CLI.

## Remaining hosting configuration

The existing media files remain in local storage; only their database metadata
was migrated. Blob and SMTP credentials are not configured. Before a Vercel
deployment, configure persistent media storage, SMTP, the production server URL,
allowed origins, the same Payload secret, and the Neon database variables in the
Vercel project. This task did not redeploy the Vercel website.

References:
- https://neon.com/.well-known/agent-skills/neon/SKILL.md
- https://neon.com/docs/guides/vercel-connection-methods
- https://neon.com/docs/connect/connection-pooling

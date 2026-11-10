# CasoAberto — Cause Collaboration API (private, not deployed)

A separate Cloudflare Worker + D1 service for **consent-led collaboration on civic causes**, without changing the public Astro website. This source code is a deployment candidate; it is NOT a live service, production user account system or operational public reporting channel.

## Core security boundaries

- Every API route except /health requires a **cryptographically verified Cloudflare Access application JWT**, checked against the correct issuer, audience and current signing key (JWKS); no unsigned header/body identity.
- Actor IDs are HMAC-SHA-256 hashes derived from the verified Access subject and a private server-side pepper. The database does not store member email, name, phone, religion, political views or raw Access tokens.
- Every cause is restricted to its membership. Owners can invite; editors can add private tasks, evidence links and request drafts; viewers can only read; a member can leave, and an owner can revoke memberships.
- Invites are random 256-bit tokens stored only as hashes, one use, valid 24 hours. The token is returned once; do not put it in public posts, query strings, logs or analytics.
- No automatic messages, email, WhatsApp, mass political outreach, public allegations, payments, AI tool calls, uploads, profile scraping or public database endpoint.
- Requests are private **drafts**, not evidence of delivery. Evidence links are not independently verified.
- D1 prepared statements and per-cause role checks enforce isolation. D1 batch groups create events; minimal audit table logs actor pseudonym, event type and timestamp, not content payload.
- Writes require an exact HTTPS Origin matching the Access-protected private application. No cross-origin cookies/CORS. The Access JWT header must be verified regardless of the Worker hostname.
- A native rate limit binding is required. Cloudflare rate limits are approximate and local to each Cloudflare location, so invite tokens still use one-time conditional SQLite updates.
- There is no raw file upload; unredacted private documents and highly sensitive participant information must not be entered. The service needs security and LGPD review before real-world use.

## Local checks

This service has **no third-party runtime dependencies**:

    npm --prefix services/cause-api run verify

The test suite uses signed fixture JWTs with generated ephemeral RSA keys, validates issuer/audience/expiry, checks origin and configuration fail-closed behavior, validates input limits, and executes D1-compatible schema with Node SQLite.

## Required configuration and manual deployment gates

1. Provision **separate** Cloudflare Access application for the private collaborator interface and private Worker hostname. Block unauthenticated access at the edge, including workers.dev bypass. **Do not attach this service to the public Astro site.**
2. Copy wrangler.example.toml to a private local configuration file and replace all placeholders. Never commit the configured copy, D1 UUIDs, JWT tokens or secrets. The sample intentionally cannot be deployed as is.
3. Create a D1 database with a real private database ID. Apply migration 0001_private_causes.sql using Wrangler D1 migrations in the selected account/environment.
4. Configure ACCESS_TEAM_DOMAIN (bare team.cloudflareaccess.com), ACCESS_AUDIENCE (from Access application settings), CAUSE_APP_ORIGIN (the single HTTPS private app origin), D1 binding DB and rate-limit binding API_RATE_LIMIT.
5. Set IDENTITY_PEPPER as a Worker secret, randomly generated and at least 32 characters; safeguard backups/rotation, since changing it changes all pseudonymous member IDs.
6. Configure security headers and restrict account/device access, deployment approvals, secrets read access, logs, D1 backup/restore and incident response.
7. Connect a proper private UI only after Access is working; the public local-first Workspace is not automatically connected. Do not turn on migrations or live deployment until a staging review, abuse testing, consent notices, retention/deletion and correction policies are approved.
8. Provide incident-reporting, content correction, escalation, owner-transfer/closure and privacy request workflows before inviting real participants. No public launch otherwise.

Cloudflare reference for JWT validation: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
Cloudflare D1 batch and transaction reference: https://developers.cloudflare.com/d1/worker-api/d1-database/
Cloudflare rate-limit binding (approximate, PoP-local): https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/

## API surface — protected, no public release

- GET /api/causes — member's causes
- POST /api/causes — create restricted cause, owner membership and minimal audit (requires accept_public_safe=true)
- GET /api/causes/:id — cause details if member
- PATCH /api/causes/:id — editor/owner status change
- GET/POST /api/causes/:id/tasks — task list and creation
- PATCH /api/causes/:id/tasks/:taskId — mark task done/undone
- GET/POST /api/causes/:id/evidence — public HTTPS source links and typed descriptions
- GET/POST /api/causes/:id/requests — private institutional request drafts, no outbound communication
- GET/POST /api/causes/:id/invites — owner invitation inventory and one-use token creation
- DELETE /api/causes/:id/invites/:hash — cancel an unclaimed invitation
- POST /api/invites/claim — accept a one-use token with explicit rules consent
- GET /api/causes/:id/members — owner-only pseudonymous active membership roster
- DELETE /api/causes/:id/members/:actorId — owner revokes non-owner membership
- POST /api/causes/:id/leave — viewer/editor removes own access
- GET /api/causes/:id/audit — owner-only minimal history
- GET /health — public status only, no secrets

All state-changing API requests must come from the configured private Origin and include the Access-signed JWT header. Never use the public site to collect secret invite tokens or participant identities.

## Production launch checklist (owner ops — not an open product backlog item)

Repo acceptance for the collaboration API candidate is complete: Access JWT verification, D1 schema, role isolation, invite/revoke/leave/audit paths and fail-closed tests ship under `npm run verify:cause-api`. No full production readiness claim until the owner authorizes infrastructure: security review, consent language, retention/deletion, owner transfer, abuse moderation, rate-limit stress validation, incident runbooks, CORS/Access end-to-end test and verified live deployment with real Cloudflare identifiers. The public Astro site stays disconnected until that ops gate passes.

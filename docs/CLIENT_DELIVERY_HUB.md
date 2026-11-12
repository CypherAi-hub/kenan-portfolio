# Client Delivery Hub

First increment, 2026-11-12. Built on discovery handoff commit `e7326192393a005846b6007e1c9fb4a230f12eae`. This branch is not deployed and does not include the separately owned contracts or software-care branches.

## Working flow

The designated owner opens `/studio/delivery`, chooses an existing client project, selects a project type and enters up to eight additional agreed requirements. Types cover websites, web apps/dashboards, mobile apps and existing-software maintenance. The client opens `/portal/delivery` through their existing account. Both routes are linked from the existing workspace.

Preparation can be saved before commercial prerequisites are satisfied. After the existing commercial system reports readiness, opening or refreshing the hub automatically issues an authenticated, idempotent initialization request. This creates the checklist once. This increment has no background webhook consumer or outbound notifications.

Clients save notes and HTTPS reference links, submit items and respond to owner feedback. Kenan accepts or returns submissions and records a separate access/material verification. All required items must be accepted before the owner can approve a start date. Starting development is a separate owner action, allowed only on or after that approved date in America/Chicago, with commercial readiness checked again.

The next-action view derives its stage, responsible role, required-item count and approved start from saved records. The client sees remaining client work while the owner sees submissions awaiting review. The owner queue spans existing projects and prioritizes commercial blockers and review work. Project context and the latest update reuse the portal project record. This does not rewrite the legacy `Project.phase` field or invent delivery milestones.

## Persistence and authorization

No new database or identity system is introduced. Records use the existing private Blob namespace at `delivery/clients/<client UUID>.json`. They contain prepared projects, onboarding tasks, commercial source fingerprints, revisions, schedule/start records, activity events and operation receipts. The existing `editPrivate` compare-and-swap transaction atomically saves a mutation and its audit event/receipt.

Identity is derived from existing sessions on every read and mutation. Client access is restricted to their existing account and projects; the owner uses the existing designated-owner rule. Additional project contact names are informational and do not grant account access. POST requires the configured origin, JSON, bounded input, an operation UUID and (except refresh) the current project revision. A repeated operation with the same digest is safe; the same ID with different input is rejected. No submitted `ready`, `paid`, `signed`, actor or role flag grants authority.

The per-client record retains 1,000 operation receipts and fails closed at 5,000 activity events rather than deleting audit history. Stale revisions prevent an evicted mutation receipt from replaying a state change; refresh itself is idempotent. The owner roster is limited to 100 clients until pagination is added. The current adapter fetches at most four clients in parallel; production latency needs measuring before approaching that ceiling.

Notes and links are private. Recognizable secret formats are rejected, but this is best-effort input validation, not a secrets-sharing service. Use provider invitations or an approved secure process for access. URLs require HTTPS and no embedded credentials; the application never fetches submitted links. Binary uploads, scanning and signed download access are deferred.

## Commercial source contract

`lib/delivery/commercial.ts` reads only `GET /api/portal/business?client=<existing client UUID>` at the trusted `PORTAL_ORIGIN`. It forwards only the existing session cookie, disallows redirects, bypasses caches, limits the response to 2 MB and times out after six seconds. The source must work with that session and return JSON. Deployment protection that blocks same-origin server requests needs to be resolved during integration, not bypassed with a browser-supplied host.

The adapter expects the existing business view:

- `workspace.client.id` equals the authorized portal client ID.
- Exactly one non-completed `workspace.engagements` entry maps to the portal project ID.
- `gates[engagement.id]` supplies boolean `ready`, boolean `paymentDefined` and a reasons array, calculated from provider-verified commercial records.
- The linked proposal is accepted by that client, has a revision and acceptance hash, and belongs to the same engagement.
- Required agreements are completed, with matching current version, signing version and completion version; completion includes the DocuSign provider, environment, signed artifact and certificate references.
- The root `sandbox` boolean agrees with each agreement completion environment.

The contracts source remains authoritative for proposal-content integrity, payment settlement, deposit requirements, refunds and provider evidence. Delivery performs additional identity/version/evidence consistency checks; it does not create another payment/signature verifier. Manual commercial exceptions alone cannot satisfy the delivery checks. No source, incompatible records, missing required agreements or ambiguous engagement mapping blocks activation. The source cannot currently represent a delivery project with zero required agreements through this adapter.

The fingerprint binds client, project, engagement, accepted proposal revision/hash, required agreement versions and sandbox mode. If it changes, the owner must explicitly adopt the new scope. Existing answers remain available, accepted items reopen for review, and schedule/start approvals are removed. History remains recorded. If readiness is revoked or unavailable, further progression is blocked and the summary shows commercial review.

The contract/invoice workspace link appears when this authenticated source is available. Existing project messaging/reviews/payments remain in `/portal` and `/studio`. Care/support consolidation is future integration work.

## Configuration and integration

Reuse the existing `BLOB_READ_WRITE_TOKEN`, `PORTAL_NAMESPACE`, `PORTAL_SIGNING_KEY`, authentication and canonical `PORTAL_ORIGIN`. This increment needs no new OpenAI, Stripe or DocuSign secret. It neither creates charges nor sends notifications. Do not merge or copy another worker's uncommitted contracts code.

When the contracts branch is ready, verify its final API against the contract above in an isolated integration branch. Preserve the new delivery navigation link together with care and operations links. Keep one authoritative billing system across contracts and software care. With separate sandbox accounts, verify the accepted proposal → completed signature evidence → confirmed deposit → onboarding → owner review → scheduled start chain, including duplicate events, refunds and changed scope. Browser QA below uses synthetic commercial records and is not evidence that this real provider chain has passed.

## Verification

```sh
npm run test:unit
npm run lint
npx tsc --noEmit
npm run build
```

`tests/delivery.test.mjs` covers authorization, tenant isolation, forged readiness, missing/invalid commercial evidence, duplicate initialization, stale writes, lost-response replay, draft/resubmit/review, distinct owner/client actions, scope change, scheduling, early starts and revoked readiness.

The opt-in `tests/delivery-live.mjs` uses actual private Blob storage in a fresh `kjl-qa-delivery-*` namespace, fresh test sessions and a temporary authenticated commercial fixture. It refuses to overwrite an existing business route and disables provider credentials in its child process. Run it only in an isolated worktree without the real business route, with a test storage token in the environment:

```sh
RUN_DELIVERY_LIVE=1 DELIVERY_EVIDENCE_DIR=/absolute/path/to/evidence node tests/delivery-live.mjs
```

The test exercises real routes and browser workflows at desktop/phone widths, plus concurrent initialization. Its `finally` cleanup removes test storage, fixture files and the temporary route. If execution is forcibly terminated, inspect for `DELIVERY_QA_ONLY` and the generated QA namespace before building. Never package that route; run the final production build only after its removal.

## Release boundaries and rollback

This release has no binary uploads, organization/team membership, reminder delivery, immutable milestone versions, change orders, handoff automation, time/expense ledger, profitability report or care capacity calculation. Those follow in later increments; no inactive buttons imply they are present.

To roll back, remove the delivery routes and navigation link while retaining private delivery records and audit history. Existing clients, projects, invoices, subscriptions and agreements require no migration or reversal. Do not delete receipts or completed submissions to resolve a retry. Diagnose the current project revision and recorded operation instead.

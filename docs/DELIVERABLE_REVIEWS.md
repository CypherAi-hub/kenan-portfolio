# Versioned deliverables and client approvals

This additive release follows `3ae4690` (client onboarding and delivery hub). It adapts the supplied AgencyOS extension to the existing Next.js/passkey/private-Blob application. No Prisma schema fragment, sample price or billing ledger is installed.

## Working routes and flow

Both `/studio/delivery` and `/portal/delivery` now include milestones. The owner designates the existing client account as approver, creates a milestone with acceptance criteria and an optional real due date, and publishes a file after approved onboarding/start and current commercial readiness. The owner cannot approve on the client's behalf.

Client review identifies the exact version and filename. Clients download privately and explicitly approve or request changes. The server rechecks current account, project ownership, designated approver, project revision, latest version, finalized-decision state and scope fingerprint. A version superseded while its review page is open cannot be approved. One finalized decision is retained per version, including actor, name, timestamp, authority, version ID, checksum, scope fingerprint and feedback.

Requested changes create a linked revision task. Kenan records an included/more-information/change-order decision and a reason shown to the client. A change-order classification creates an internal scope draft, redacted from the client API. It contains no accepted price or payment authority. Further publication is blocked until either an explicit documented owner scope reclassification or a changed verified commercial baseline, renewed onboarding/start approval, and explicit owner confirmation that the amendment covers the request. The history of triage decisions remains available in stored records.

Approved milestones are closed to replacement. Newly authorized work uses a separate milestone. Rejected or unreviewed versions can be followed by another immutable version; earlier bytes and decisions stay available. Delivery stage can remain `In progress` while the next action belongs to the client for review or to the owner for revision triage. This is not an automatic update to the legacy portal phase.

The view also exposes an independent `deliveryStage` alongside its action/gate stage. A project that has started remains `In progress` when its commercial readiness needs attention; the UI shows both conditions and the development count retains that actual started project. Full sales, individual contract/payment and support dimensions belong to the combined business/care integration.

## API and evidence storage

- `POST /api/portal/delivery`: existing JSON endpoint, extended with `designate-approver`, `create-milestone`, `review-version` and `triage-revision`. Existing session/origin/size/operation/revision rules still apply.
- `POST /api/portal/delivery/artifact`: designated owner only, same-origin multipart input containing one `input` JSON field and one `file`. The server ignores browser artifact metadata and computes SHA-256 and private path itself. JSON-only publication is rejected.
- `GET /api/portal/delivery/artifact?client=…&project=…&version=…`: current authenticated account and project access checked before resolving a stored version. No caller-supplied storage path is fetched. Historical downloads remain available after payment readiness changes, preserving already-shared evidence.

Files are limited to 3 MiB, below the deployment request ceiling including form overhead. Accepted types are matching PDF, PNG, JPEG, WebP and UTF-8-style plain text with basic signature/content checks. Obvious active PDF actions, HTML/SVG content in text and other formats are rejected. Files are not antivirus-scanned; do not label them as such. They are never embedded as active application content. Downloads use `application/octet-stream`, attachment disposition, `nosniff`, a sandbox CSP and private/no-store caching. Every download verifies the stored size and SHA-256 before returning bytes. File names are normalized for response headers.

Objects use server-generated paths under `<existing namespace>/delivery/artifacts/<client>/<project>/<operation>-<checksum>`. Uploads are private, without random suffixes and without overwrite. The operation ID and file hash make publication retries reproducible; a changed payload under the same ID is rejected. Existing raw artifact paths and internal change drafts are removed from client view data.

The client retries temporary network and 502/503/504 failures at most twice, reusing the exact operation ID and payload. This covers a successful write followed by a lost response without creating another version or review. Authorization, validation and stale-version failures are not retried. After the retry limit, the interface preserves unsaved input and exposes the failure.

## Additive migration and transaction boundaries

The existing `delivery/clients/<client>.json` aggregate gains optional project `approver` and `milestones`, and optional held `outbox` entries. No existing record needs rewriting: absent arrays are initialized lazily. Existing accounts, projects, proposals, agreements, invoices, subscriptions and legacy project phases retain their IDs and data.

The manifest transaction saves the version or review, linked revision, audit event, held outbox event and operation receipt together through the existing Blob CAS. Outbox entries contain minimal actor/project/type/time metadata, are held, and have no email sender. No client message is sent by this feature.

Artifact upload and manifest write are separate storage operations. Preflight validates the command before upload. If the final manifest write fails or its response is lost, the object is retained; a retry can use the same immutable bytes. An unreferenced object is not downloadable through the application. Do not delete on an uncertain write. Future reconciliation should list private objects, compare against all manifests, apply a retention grace period and produce a reviewed dry-run report before any deletion.

Limits are 100 milestones/project, 50 versions/milestone, 50 triage records/revision and 5,000 held outbox events/client. Existing audit and roster limits still apply. These are bounded studio records, not a load-test claim for large agency scale.

## Provider integration and launch

Reuse existing portal origin, private Blob token, namespace, signing key and account sessions. No new OpenAI, Stripe or DocuSign key is needed. The same read-only commercial adapter still depends on the final contracts `/api/portal/business` interface. Other active contracts/care worktrees must remain untouched.

No production deployment, live charge, agreement modification or real notification is performed by this release. The next integrated release must verify the complete real sandbox proposal → signature evidence → payment → onboarding → deliverable approval chain. Local synthetic commercial records do not prove provider acceptance. Preserve all relevant delivery, care and operations navigation links when merging.

## Tests and isolated browser verification

Run `npm run test:unit`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Milestone tests cover actual route/service authorization, immutable metadata/bytes, private downloads, corrupted objects, file limits/type rejection, stale and concurrent decisions, authority revocation, lost-response retry, duplicate review/outbox prevention, revision scope and changed commercial baselines.

For the real private-storage/browser walkthrough, use the existing isolated harness in a worktree without the real business route:

```sh
RUN_DELIVERY_LIVE=1 RUN_MILESTONE_LIVE=1 DELIVERY_EVIDENCE_DIR=/absolute/path/to/evidence node tests/delivery-live.mjs
```

Supply authorized storage access through the environment. The harness uses fresh synthetic accounts and a unique QA namespace, strips provider credentials from its server process, and creates an exclusive temporary development-only commercial fixture. It tests onboarding plus V1/V2 stale review, private download access, revision/V3 approval, additional-scope blocking and approver revocation. Cleanup removes the namespace and temporary route. Confirm that route is absent before the final production build. No test sends email or verifies a real signature/payment.

## Deferred work and rollback

Multi-person client organizations, team invitations, antivirus integration, private onboarding uploads, binding commercial change orders/invoices, care allowance integration, capacity/economics, notification dispatch, final handoff and production deployment remain separate increments. An internal scope draft is not a completed change-order system.

Rollback reverts this release's routes/UI/domain additions while retaining artifact objects, milestone/review records, operation receipts and held events. Do not restore an older aggregate over newer data or delete evidence. The preceding onboarding implementation tolerates the added optional fields; archive and migrate evidence deliberately before removing storage.

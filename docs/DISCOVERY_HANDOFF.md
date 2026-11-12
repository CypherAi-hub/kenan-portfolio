# Reviewed discovery → client project

This increment extends `/studio/inquiries` on top of the adaptive discovery implementation. The owner selects an existing passkey client account and either creates a project in Discovery or connects an existing project. Account creation continues through the existing studio invitation flow.

## Owner workflow

1. Open an inquiry, edit the working brief and choose **Save & mark reviewed**.
2. In **Connect this inquiry to a project**, select the intended client account. A self-reported inquiry email never selects or creates an account automatically.
3. Choose a new project or one of that client's existing projects. For a new project, write the title and the client-visible discovery summary explicitly. The private working brief and original answers are not copied to the client workspace.
4. Check the sharing confirmation and connect. An existing project's scope, progress and payment records stay unchanged.
5. If interrupted, reload the inquiry and choose **Resume project handoff**. The reserved destination is reused. Do not create a replacement project manually while a handoff is pending.

The resulting Discovery workspace is preparation for commercial review. It does not accept a proposal, sign a contract, create an invoice, send a message, collect money or activate a paid service. This increment has no Stripe dependency or billing call.

## Persistence and recovery

`Inquiry.handoff` is optional, preserving compatibility with all previous inquiry records. It stores status (`pending`/`linked`), client identity, project ID, new/existing mode, owner, timestamp, request hash, source inquiry revision, a snapshot of the saved working brief, and the explicitly shared summary. The private inbox index contains only the handoff status.

The same inquiry UUID is the idempotency scope. A conditional inquiry write reserves the destination before any project write. New projects use a reserved UUID and the existing project shape. A conditional workspace write creates that UUID only if absent; a retry checks its creation timestamp and retains any subsequent project edits. The inquiry is then marked linked, and its derived index updated. These are resumable writes, not a cross-object transaction.

Real Blob concurrency testing exposed an additional provider conflict response: “The conditional request cannot succeed due to a conflicting operation against this resource.” The shared `lib/portal/store.ts` helper now recognizes that specific response as a conditional-write conflict, reloads the current record and retries with short jittered backoff. The existing six-attempt limit remains. Unknown provider errors are still surfaced, not retried as if known safe. This small shared storage fix must accompany the handoff commit when integrating the other branches.

Pending handoffs block brief changes and further AI generation. After completion, the owner may save later brief versions; the handed-off source snapshot stays unchanged. No reassignment endpoint is provided. A correction that moves a project to another client requires an explicit, audited workflow and a review of any downstream proposal or contract references.

If the account or existing project is removed outside these application flows during recovery, the operation fails closed. Restore the original record before retrying; do not edit the reserved IDs in place.

## API

All operations use the existing owner session plus the designated owner check. POST also requires the exact application origin, JSON content type and the existing bounded request reader. Public submissions and client accounts cannot use these actions.

- `GET /api/portal/inquiries?handoff=options` returns client ID/name/email only, without credentials, invitations or sessions.
- `GET /api/portal/inquiries?handoff=options&client=<uuid>` also returns that client's project ID/title/phase choices.
- `POST /api/portal/inquiries` with `action: "handoff"`, inquiry `id`, `revision`, `clientId`, `mode: "new"`, `title`, `summary`, and `confirmed: true` reserves and creates a Discovery project.
- Existing project mode uses `mode: "existing"` and `projectId`; the server verifies that the selected project belongs to the selected client. It ignores title/summary inputs in this mode.
- Recovery uses `action: "handoff"`, `id`, and `resume: true`. The destination comes exclusively from saved server state. Repeating the identical original request is also safe. A different request for an already reserved inquiry returns a conflict.

The UI prevents switching inquiries or reloading with unsaved brief/handoff fields without a discard confirmation. Failed writes reload saved state when possible; success is shown only when the saved handoff is linked.

## Contracts/care integration boundary

The commercial branches are separately owned and were not merged or edited for this increment. Use the existing `handoff.clientId` and `handoff.projectId`; do not provision a duplicate client or project. Resolve the inquiry server-side and verify its handoff matches the selected client and engagement before importing a source brief. Use `sourceRevision` and `sourceMarkdown`, not the latest mutable working brief. The commercial branch's current 30,000-character source field is smaller than the inquiry editor's 80,000-character limit: explicitly reject or ask the owner for a reviewed shorter source; do not silently truncate.

The contracts/care branches currently overlap on subscriptions. Resolve which module owns provider customers, subscription checkout and entitlements before a combined release. Discovery completion is not commercial authorization. Contract signature and payment verification must come from the relevant provider and match the accepted terms, client and environment.

## Verification

- `npm run test:unit`: existing regressions plus authorization, sharing limits, revision checks, simultaneous requests, existing-project preservation, stable source snapshots and injected failure at every write boundary.
- `npm run lint` and `npm run build`: static/type/build checks.
- `tests/intake-live.mjs`: optional isolated private-Blob/browser test, including manual discovery, owner review, both handoff modes, mobile layouts, client visibility, tenant isolation and concurrent Blob writes. It requires `RUN_INTAKE_LIVE=1`, creates a fresh `kjl-qa-intake-*` namespace, strips Stripe keys from its child server and deletes synthetic records in `finally`. OpenAI checks remain optional and separate from handoff.

## Release and rollback

This change depends on the adaptive intake baseline `8f25372b49007ab554fdba4853660fb1042c46e8`. It is kept on `codex/discovery-client-handoff-20261112`, separate from active contracts/care work. Integrate it into the shared release candidate and rerun combined checks before deploying that candidate. No production customer record migration or new environment variable is needed for the handoff itself.

A code revert removes the handoff UI but must retain historical inquiry/project data. Optional fields are compatible with the earlier discovery reader. Restore this code to finish pending operations; do not delete their intents or reserved projects as a rollback shortcut.

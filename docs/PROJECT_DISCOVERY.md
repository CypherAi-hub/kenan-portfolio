# Project discovery

Implemented November 12, 2026 on top of the existing KJL Designs client studio.

## Client and owner paths

- `/start-project`: seven discovery sections, optional AI follow-ups, and review/send. Questions branch by project type and features. “Not sure yet” is supported. Reference documents can be supplied as links; this version does not upload files.
- `/studio/inquiries`: owner-only inbox, search/status filters, original answers, editable brief, saved versions, review status, retry and Markdown export. Uses the existing studio passkey identity. Clients cannot list, read, change or export inquiries.
- `/api/inquiries`: same-origin JSON POST only. `clarify` requests up to five signed follow-ups; `submit` stores the original inquiry before attempting a draft.
- `/api/portal/inquiries`: existing owner identity required for all reads, writes and downloads. Updates use a revision check. No external communication is sent by submitting, generating, saving or reviewing.

The public header, pricing estimator and booking section link to discovery. The owner dashboard links to the inbox and receives inquiry notifications. Existing email contact, estimates, booking, client projects and payments remain available.

## Data and configuration

Reuses `BLOB_READ_WRITE_TOKEN`, `PORTAL_SIGNING_KEY`, `OPENAI_API_KEY`, `PORTAL_ORIGIN`, and `PORTAL_NAMESPACE`. No new required secret or backend is introduced. `OPENAI_INTAKE_MODEL` optionally overrides the existing assistant model setting; the default remains `gpt-5-mini`.

Private Blob keys, under the existing portal namespace:

- `inquiries/items/<uuid>.json`: immutable source answers and consent, follow-ups, review state, generation attempt and saved brief versions, in an inquiry envelope.
- `inquiries/index.json`: owner inbox summaries, updated only when the incoming revision is at least as new as the saved entry.
- `inquiries/limits/<UTC-day>.json`: daily global/public request counters and daily keyed connection digests, never raw addresses.
- `inquiries/ai-usage/<UTC-day>.json`: shared daily AI budget counter.

Storage uses the existing optimistic ETag compare-and-swap implementation. Submission IDs are browser-generated UUID v4 values. Replaying identical content repairs the index if necessary and returns the same receipt. Reusing an ID with different content fails. A failed AI request does not delete the inquiry or cause repeated submission retries to regenerate a brief.

AI calls use structured Responses output, `store:false`, no tools, a 38-second request timeout, bounded payload/output sizes and source-ID validation. Contact fields are excluded from AI input; contact information placed in free text is not automatically detected/redacted. Follow-up signatures expire after 24 hours and bind to the active project answers. Changing the core answers clears the follow-up questions in the browser. Missing or invalid AI output produces a visible failure with owner retry, not a pretend AI result.

AI-proposed scope is always labeled for review, even when it references source answers. The client's exact first-release priorities, later features, exclusions, budget and deadline are included separately. Export always appends the preserved original answers, even after an owner edits the brief. A review status is not a price commitment, approved contract, client invitation, or permission to begin development.

## Current limits and deliberate scope

- Maximum five AI follow-up questions per review. Clients may defer any of them.
- Daily per-connection caps: six follow-up requests and ten new submissions. Shared cap: 300 public requests and 100 AI calls per UTC day. Counters are durable, rather than process-local. On Vercel the connection bucket uses its platform-managed forwarded address header; non-Vercel testing uses one local bucket.
- Fields are bounded to 200 characters for contact text and 2,000 for project descriptions; public JSON bodies are limited to 65 KB.
- Maximum 30 saved brief versions; owner text up to 80,000 characters. Original submitted answers are retained independently of edits.
- Save/resume is explicitly opt-in browser storage for 30 days on that device. Follow-up tokens and consent checkboxes are not persisted. It is not cross-device resume.
- Attachments use reference links for now. The system does not fetch their contents or claim to have reviewed them.
- Notifications appear in the existing private studio; this feature does not automatically send emails, generate proposals, charge clients, or create a development job.
- Submitted inquiries are retained for discovery and project delivery. Deletion requests use the existing owner contact process; there is no automatic deletion schedule or new public delete API.

## Verification

`npm run test:unit` runs the existing tests plus the intake tests using mocked model and storage boundaries. Coverage includes branch pruning, schema validation, origin/size checks, owner isolation, signed follow-ups, consent, AI failure, idempotency, concurrent generation, version conflicts and export.

For explicitly authorized live verification, build first, then run `tests/intake-live.mjs` with `RUN_INTAKE_LIVE=1`, authorized `BLOB_READ_WRITE_TOKEN` and optionally `OPENAI_API_KEY` in the process. `INTAKE_OPENAI_ENV_FILE` may reference an existing authorized env file if the key is not in the process; it is read without copying or printing secrets. `INTAKE_EVIDENCE_DIR` optionally collects screenshots and synthetic sample output. The script starts the local production server on port 3217, creates only a random `kjl-qa-intake-*` namespace, exercises the browser, checks owner/client isolation, calls the real model when configured, and deletes its fixture namespace in `finally`. It strips payment and private project-connection credentials from the local server process. No real client messages or financial transactions are sent.

Browser screenshots and synthetic fixtures are local/provider test evidence, not evidence of deployment or real client acceptance. Recheck production routes after an authorized deployment.

# KJL Designs — agency platform audit and incremental plan

Date: November 12, 2026. Implementation baseline: `8f25372b49007ab554fdba4853660fb1042c46e8` (adaptive discovery), on the `kenan-portfolio` repository. This audit describes checked source, not a certification of every provider setting or production customer record.

## Scope and ownership

The actual request is to audit the existing portfolio, reuse its working systems, and build the inquiry → proposal → signed agreement → verified deposit workflow in small tested increments. New billing work must remain in test mode. The two attached Markdown documents are architectural references; the referenced ZIP, Prisma schema, seed data, and 14 TypeScript files were not attached and have not been inspected.

The owner confirmed that `codex/contracts-billing-platform-20261112` and `codex/software-care-subscriptions-20261112` are being developed elsewhere. Their dirty worktrees are preserved. This increment owns only discovery-to-client/project handoff. It does not integrate, complete, or deploy the other branches.

## Existing architecture

Next.js 15 App Router, React 19 and TypeScript run on Vercel. The current site is KJL Designs at `https://kjl-designs.vercel.app`; the older `kenanlarry.dev` checkout is not the current implementation. Passkeys and signed server sessions provide separate owner and client access. Vercel private Blob holds the account directory, per-client project workspaces, and inquiry records, with conditional ETag writes and conflict retries. There is no relational database in this baseline.

Stripe Checkout handles fixed payment requests. Amounts originate from owner-authored records, use integer cents, and are reconciled through verified callbacks. These are not Stripe Invoicing records. Similarly, the assistant's existing `Proposal` type describes an owner-reviewed action, not a client-facing sales proposal. Keep those concepts distinct.

OpenAI structured output supports optional discovery follow-ups and draft briefs; the original answers, AI consent and subsequent owner versions are retained privately. Existing Google integrations are reviewed assistant actions, not an automated transactional notification queue.

## Reuse and gaps

| Area | Reuse now | Remaining work / ownership |
|---|---|---|
| Public acquisition | Portfolio, pricing, booking, `/start-project` | Later case-study and conversion refinements |
| Client identity | Passkey invitations, account IDs, owner/client sessions | Organization memberships and multiple contacts if needed; do not create a second identity system |
| Discovery | Adaptive questions, optional AI, consent, owner review, original answers and versions | This increment: bind reviewed discovery to an existing client and project |
| Lead management | Searchable private inbox and review statuses | Commercial lifecycle should derive from proposal, agreement and payment evidence |
| Project workspace | Existing project IDs, phase, updates and client review responses | Full milestones, task dependencies, onboarding checklist and handoff package |
| Sales proposal | Reviewed inquiry as input | Versioned commercial proposal and explicit acceptance; contracts branch owns this |
| Agreements | Existing authenticated client IDs and private storage patterns | Reviewed templates, real provider setup, signed callbacks, document/version/signer matching and evidence; contracts branch |
| Fixed payments | Stripe Checkout, server-calculated cents, verified payment processing | Real provider invoices, deposits and reconciliation; contracts branch |
| Maintenance | Existing client/project identity | Plans, recurring consent, service eligibility, usage and subscription events; care/contracts branches overlap and need one billing owner before integration |
| Notifications | In-app notifications, owner-reviewed Google actions | Transactional email provider, durable outbox, retry/deduplication and delivery state |
| Operations | Private routes, origin checks, bounded requests, storage concurrency | Restorable backups, reconciliation jobs, incident monitoring and append-only business audits |
| Profitability | No verified financial ledger in baseline | Eligible time, direct costs and billing-period matching before reporting effective earnings |

## First implementation: reviewed inquiry → client project

Add an owner-only handoff panel in the discovery inbox. The owner first saves and reviews the brief, selects an existing client account, and either selects one of that client's projects or creates a project in Discovery. New accounts continue to use the existing invitation flow.

For a new project, require an explicit title and a short client-visible discovery summary. Do not copy the full internal working brief or original answers into the portal. Linking an existing project leaves its title, brief, phase and payments unchanged. A handoff is preparation for a proposal; it is not proposal acceptance, an agreement signature, a paid-service entitlement or payment evidence.

Record the chosen account/project, approving owner, timestamp, source revision and a snapshot of the saved brief in the private inquiry. Once claimed, a handoff has one destination. Retries resume that destination, even after partial storage failure. The UI shows pending recovery instead of claiming completion. Subsequent brief edits do not silently change the captured handoff version.

## Data changes and secure integration contract

This increment is an additive optional `Inquiry.handoff` object. Old inquiries have no handoff and remain readable. It reuses existing account and project IDs, and adds no new authentication tables, payment configuration or production migration. A new project uses the existing project shape and an empty payments list. Internal source snapshots remain in the owner-only inquiry store, not in the client workspace response.

The inquiry is the durable record of handoff intent. Save a pending claim using the existing conditional-write store, create the chosen project once using its reserved ID, then mark the inquiry linked. All retries use that same ID. This is a resumable multi-record operation, not a cross-Blob transaction. Operational recovery must retain the pending inquiry and retry it; do not delete a partial record to start over.

Implementation verification uncovered an additional Vercel Blob conditional-operation conflict response under simultaneous requests. A narrowly scoped shared storage fix now recognizes that response, reloads the latest state and retries after a short bounded delay. This is the only shared portal module changed by this increment; its regression checks cover preserving concurrent writes, the six-attempt bound and refusing to retry unrecognized errors.

The contracts implementation currently proposes PostgreSQL tables for business workspaces, operations, jobs, events and artifacts. That is work in progress, not an applied production migration. Its client ID must equal the existing account ID, and its engagement's project reference must equal the existing portal project ID. Proposal `sourceBrief` should carry the handoff's inquiry ID, source revision and captured text, checked server-side against the selected client/project. Never trust a client-submitted source ID alone. Care must reuse the same customer identity and billing authority instead of independently provisioning subscriptions for the same engagement.

Before combining those branches, decide whether the commercial schema is a normalized relational model or the current proposed per-client JSON business workspace inside PostgreSQL. Both require transaction-protected operation IDs, unique provider event/record IDs, environment markers, immutable versioned acceptance evidence, and durable jobs. Do not replace existing authentication or migrate live customer data implicitly.

The eventual domain needs client/contact membership, projects/engagements, inquiries, immutable proposal versions/acceptances, agreement versions/envelopes/evidence, provider customers, invoices, subscriptions, payment attempts, milestones, requests, eligible time entries, direct costs, entitlements, audit events and delivery jobs. Stripe remains authoritative for provider payment state. Every row/document access must resolve through the authenticated client's ownership.

## Dependency order and acceptance gates

1. **Discovery handoff (this increment):** owner authorization, explicit sharing, correct account/project binding, idempotency, partial failure recovery, old-record compatibility, mobile UI and zero payment side effects.
2. **Commercial review (contracts branch):** use stable client/project IDs, immutable offer versions, exact-version client acceptance, expiry, price/deposit validation and reviewed SOW drafts. Editing accepted terms creates a new version.
3. **Signature sandbox (contracts branch):** connect a chosen provider and reviewed templates; verify envelope, client, document hash/version, signer and environment. Reject forged, duplicate and stale callbacks. Store completed documents and evidence privately.
4. **Invoice sandbox (contracts branch):** separate test configuration from existing live Checkout, reserve durable operation IDs, create actual provider invoice records, reconcile current provider state, and verify correct customer/currency/amount/required deposit. Redirects do not activate services.
5. **Integrated acceptance:** synthetic inquiry → invited client → reviewed proposal → real sandbox signature → real test invoice/payment. Repeat callbacks, simulate partial failures, and test a second client's denied access. No first-paying-client success claim before this chain passes.
6. **Delivery and care:** onboarding, milestones, signoff, handoff, maintenance contract and approved plan; then recurring entitlements, tickets and period-specific time allowances. No automatic overages.
7. **Operations and analytics:** transactional outbox, reconciliation, backup restore drill, monitoring and capacity limits. Compute profitability only from reconciled revenue, eligible time and actual direct costs; label estimates.

## Important risks and checks

- Two separately active commercial branches overlap on subscriptions and client portal UI. Their owners must reconcile that ownership before merging or deployment; this discovery increment avoids editing those modules.
- The current owner-created project is visible during Discovery, even before a commercial agreement exists. This is workspace preparation. Commercial service activation must use separately verified evidence, not this phase or the existence of a project.
- Existing live Checkout remains untouched. New invoice/subscription paths need explicit sandbox enforcement and separate provider keys/IDs. This increment performs no billing calls.
- The lead's email is self-reported. Never automatically bind an inquiry to an account by matching email; the owner selects and confirms the intended client.
- Blob operations are atomic per object only. Persist intent first and make later steps repeatable; test interruption after each write.
- Internal working briefs can contain private notes and unapproved assumptions. Only owner-composed client summaries cross into new project records.
- Proposal approval, contract signature and payment are separate facts. All three must match the same client, project and scope version before paid work starts.
- No verified backup restore, e-sign account, production contract templates or end-to-end invoice sandbox run is established by this audit.

## Rollback and release

Keep this increment on a separate branch based on the existing discovery commit. Reverting its code removes the new handoff UI; existing optional handoff fields remain harmless. Do not delete the inquiry or project records as a code rollback: they are historical evidence and may be referenced by commercial work. Repair pending handoffs through retries on the same destination. Reassignment requires a separate audited correction workflow, not a silent overwrite.

Do not deploy these independently active branches over one another. Integrate the tested discovery commit into a shared release candidate, preserve the contracts/care work, then rerun the combined authorization and provider test matrix. Production financial activation and sending real agreements remain separate decisions.

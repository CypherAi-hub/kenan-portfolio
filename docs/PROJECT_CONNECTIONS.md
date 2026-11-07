# Owner project assessment

All 30 portfolio entries supply their actual briefs, portfolio links, published URLs where available, repository references and vetted media to the owner assistant. These are distinct from paid client workspaces. Saved media is identified as saved evidence, not a fresh authenticated app screenshot.

The owner can open Your projects in /portal, search, inspect, view private records where connected and ask for an assessment. The assistant uses a bounded read-only inspect_projects tool and attaches actual source cards. General assessment retrieves counts only; customer-directory reads require an explicit current-message request. Model actions continue through existing review/apply proposals.

Live sources:

- FoFit and its web/coach products share a dedicated Supabase function exposing aggregate counts and a ten-record page of basic account-directory fields.
- UltraFlips web/mobile products share the equivalent bridge. Counts use cards, holdings and native_research_sales. Seed/QA rows are not adoption or revenue evidence.
- Maryville General Services has an additive read-only endpoint exposing request status counts and ten registered requester accounts per page. Request contents, attachments, credentials and sessions are excluded.
- KJL’s own studio reads its existing owner-authorized workspaces.

Every bridge has a separate random bearer secret kept only in encrypted KJL server configuration. The source stores a SHA256 digest. KJL never receives the source service-role credential. Fixed endpoint allowlists, bounded payloads, request deadlines and server owner checks apply. Public project checks follow only same-host HTTPS redirects and do not authenticate or bypass gates.

Meridian Atlas is an explicitly dated count-only snapshot from a read-only SQLite connection. scripts/sync-atlas-project.mjs refreshes private Blob storage without starting Atlas or collectors. No notebooks, chat messages or trading actions are copied or triggered.

HireCrate remains browser-local. Its existing Export JSON action creates a backup; the KJL owner import saves a private dated snapshot and whitelists basic company/person contact fields. Source records are unchanged. The initial November 7 export from the current Comet profile contained zero rows in all four collections; this does not describe other browsers’ data. It requires another export/import to refresh.

Archived/local projects and media tools have saved evidence and public checks where a URL exists, not invented live private backends. Source metadata and screenshots can inform assessments for every entry.

Checks: project catalog/media validation, owner/client API denial, wrong origin, unknown-project rejection, redirect boundary, private import whitelisting, bridge authorization and read-only methods, real model catalog and FoFit tool/screenshot assessment, existing proposal/concurrency/Calendar tests. Live source probes returned 200 for authorized reads and 401 without authorization. No real client email, invitation or payment was sent by this project-connection QA.

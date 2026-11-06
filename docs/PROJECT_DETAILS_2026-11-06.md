# Project detail expansion — November 6, 2026

All 30 collection entries now have a dedicated brief in `data/project-details.ts`: audience, role, problem, approach, feature descriptions, current availability, public resources, related work, and optional galleries. The same body renders on the five featured stories and their collection pages, so their details stay consistent.

Visitors can open the primary destination from the collection, inspect visible URLs in a project's resources section, copy its canonical portfolio URL, explore related products, and book a discovery call. Search includes audience and feature descriptions. Private/local projects retain a public portfolio overview and a contact route; they do not receive guessed demo URLs.

## Sources and corrections

The user explicitly requested consulting the owning project chats. FoFit, UltraFlips, and Meridian Atlas supplied read-only project briefs on November 6. These were combined with current repository README/source inspection, existing project records, and public endpoint checks.

- **FoFit:** mobile planning, logging, exercise discovery, Cypher disclosures/review, nutrition, and connected products. Public destinations are `www.fofit.app`, `app.fofit.app`, and `coach.fofit.app`. Personal Web and Coach have separate, specific descriptions. Do not claim a public App Store release, unrestricted anonymous access, a working 3D avatar, or generated body transformations.
- **UltraFlips:** camera/gallery intake, exact-version confirmation, dated research, completed-sales graphs, buying sessions, inventory/watchlists, and bounded photo review. The owning chat supplied an internal TestFlight release receipt for 0.1.0 (43); there is no verified public invitation. Deal Scout live eBay retrieval remains unconfigured. The dedicated web address is `app.ultraflips.com`; its seeded content and development stage are disclosed. Marketing-roadmap promises are not treated as implemented app features.
- **Meridian Atlas:** company networks, financial dossiers, corporate relationships, contracts/transactions, thesis investigations, and saved research. Kenan's role is creator/product lead with AI-assisted implementation. It is a local prototype with no public demo. New gallery imagery is a reviewed November local-build screenshot with dated public company data.
- **Maryville General Services:** six request types, protected copy-request PDF attachments, requester tracking, staff workflow, and the public department business card. This is the user's confirmed Maryville project.
- **AgentRoom:** current README describes a mock-data MVP. Public marketing design and mock interfaces are distinguished from active external integrations.
- **SOC Monitor:** offline defensive simulation, packet investigation, follow-stream, triage/MITRE, imports, and replay. Gallery imagery contains simulated data.
- **Netwatch:** schema, metrics simulator, database alerts, and offline detection. The dashboard is planned. The archived case study's dashboard claim was also corrected.
- **Get Funded / Ruflo OS:** limited archival evidence supports concept/archive descriptions, not claims of shipped feature sets.
- **Stack Mode / Omni / Cypher Form / Trench Copilot:** local or prototype boundaries are explicit. No bank integration, working cloud IDE backend, clinical validation, or live trading is implied.
- **Content and media tools:** describe preparation, generation, review, and local packaging without claiming automatic publishing.

Sean's Muse mockup remains excluded at the user's request. Public repository links are restricted to repositories verified accessible without authentication. No private repository, account, or product sharing settings were changed.

## Verification

- 30 library entries matched 30 detailed briefs, with 127 feature descriptions, valid related-project slugs, and existing gallery files.
- All 22 unique resource destinations returned HTTP 200, including the PDF, public repositories, documentation, and product entry points. This proves reachability, not authenticated product behavior.
- Production build/typecheck passed; lint had no errors and one existing PostCSS configuration warning.
- All 47 content routes passed local HTTP/headings/anchor checks.
- Browser review covered resource navigation, rendered screenshots, feature search, project URL copying, featured-story consistency, and responsive layouts.

Maintain content in `data/project-details.ts`, presentation in `components/studio/ProjectDetails.tsx` and `app/project-details.css`, and top-level library labels in `data/project-library.ts`. Refresh stage and URL claims from the owning source before future release announcements.

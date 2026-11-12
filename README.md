# KJL Designs — Portfolio

Personal portfolio for website, app, and digital product work. The public site is https://kjl-designs.vercel.app.

## Develop and verify

Run `npm ci`, then `npm run dev`. Run `npm run lint`, `npm run test:unit`, and `npm run build` before deploying. `npm run start` serves the production build. Uses Next.js 15, React 19, TypeScript, and Tailwind CSS 4.

## Content

- `app/page.tsx`: services, process, about, selected projects, and booking.
- `data/selected-work.ts`: current project descriptions, screenshots, and verified public links.
- `components/studio` and `app/studio.css`: shared visual design.
- `data/pricing.ts`: package budgets, optional extras, and the estimate calculation.
- `/pricing`: package comparison, ongoing support, and planning estimates. The email option opens the visitor’s email app. Detailed discovery submits directly through `/start-project`.
- `/start-project`: adaptive questionnaire, opt-in browser drafts, AI clarification, review and durable inquiry submission.
- `/studio/inquiries`: owner-only original answers, brief editing, review status, version history and Markdown export.
- `/studio` and `/portal`: separate owner/client workspaces with passkeys, projects, updates, appointments and Stripe-hosted checkout.
- `lib/booking.ts`: Google Calendar appointment URL.
- `/book`: shareable entry to booking. The provider handles availability, invitations, cancellations, and video links.
- `data/project-library.ts`: 30 project entries with status, categories, and public links.
- `/projects`: searchable full collection; `/projects/*`: individual overviews.
- `/case-studies/*`: preserved earlier technical notes.
- `/world`: preserved interactive portfolio experiment.

Only use real project screenshots, distinguish development previews from released products, and verify live URLs before adding them. Source notes and booking setup are in `docs/PORTFOLIO_REFRESH_2026-11-06.md`.

## Deploy

Reuse the linked Vercel project `kenan-portfolio`. Do not create a duplicate project or alias. The client studio uses private Vercel Blob storage, passkey authentication, Stripe, and the existing OpenAI configuration. Project discovery reuses those services and adds no required secret. Appointment booking is provided by Google Calendar. `vercel deploy --prod` publishes the current reviewed source.

## Project discovery

See `docs/PROJECT_DISCOVERY.md` for routes, storage, limits, consent, failure recovery and isolated provider/browser verification.

# KJL Designs — Portfolio

Personal portfolio for website, app, and digital product work. The public site is https://kjl-designs.vercel.app.

## Develop and verify

Run `npm ci`, then `npm run dev`. Run `npm run lint`, `npm run test:pricing`, and `npm run build` before deploying. `npm run start` serves the production build. Uses Next.js 15, React 19, TypeScript, and Tailwind CSS 4.

## Content

- `app/page.tsx`: services, process, about, selected projects, and booking.
- `data/selected-work.ts`: current project descriptions, screenshots, and verified public links.
- `components/studio` and `app/studio.css`: shared visual design.
- `data/pricing.ts`: package budgets, optional extras, and the estimate calculation.
- `/pricing`: package comparison, ongoing support, and interactive project brief builder. Email opens the visitor’s email app; the website does not submit messages or collect payments.
- `lib/booking.ts`: Google Calendar appointment URL.
- `/book`: shareable entry to booking. The provider handles availability, invitations, cancellations, and video links.
- `data/project-library.ts`: 30 project entries with status, categories, and public links.
- `/projects`: searchable full collection; `/projects/*`: individual overviews.
- `/case-studies/*`: preserved earlier technical notes.
- `/world`: preserved interactive portfolio experiment.

Only use real project screenshots, distinguish development previews from released products, and verify live URLs before adding them. Source notes and booking setup are in `docs/PORTFOLIO_REFRESH_2026-11-06.md`.

## Deploy

Reuse the linked Vercel project `kenan-portfolio`. Do not create a duplicate project or alias. The site has no new server secrets or form backend; appointment booking is provided by Google Calendar. `vercel deploy --prod` publishes the current reviewed source.

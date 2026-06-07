# Kenan Portfolio

Recruiter-ready personal portfolio for Kenan Larry, a Cybersecurity & AI student building applied AI products, cybersecurity tools, cloud projects, mobile apps, and business-facing software.

## Stack

- Next.js 15.5
- React 19
- TypeScript
- Tailwind CSS v4
- Motion
- Vercel-ready app router setup

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run start
```

Additional checks used for this build:

```bash
npm run lint
npx tsc --noEmit
npm audit --audit-level=moderate
```

## Project Data

All repository/project metadata lives in:

```text
data/projects.ts
```

Edit that file to update:

- featured projects
- repository descriptions
- tech stacks
- GitHub links
- live links
- screenshots/media
- statuses
- tags
- case-study availability
- display order

Do not add live URLs unless they are verified.

## Project Media

Project screenshots and media live in:

```text
public/media/projects/[project-slug]/
public/media/screenshots/
public/media/archive/
```

Use clear filenames such as:

```text
fofit-train.png
fofit-cypher-chat.png
fofit-workout-flow.png
fofit-coach-live.png
agentroom-dashboard.png
soc-monitor-dashboard.png
aws-image-label-generator-output-apple.png
```

After adding a screenshot, update the matching project object in `data/projects.ts`:

```ts
media: [
  projectImage(
    "/media/projects/project-slug/file-name.png",
    "Useful alt text that describes the screen",
    "Short label",
    "local",
  ),
];
```

Only use real screenshots, repo assets, or honest project outputs. If a project does not have UI media yet, leave `media: []` and keep the card in the archive with a conservative note.

## Resume PDF

Place the current resume PDF in `public/resume.pdf`, then set `resumeUrl` in `lib/data.ts`:

```ts
resumeUrl: "/resume.pdf";
```

The visible resume CTA is disabled until that value is set so the site does not ship a broken download link.

## Deploy To Vercel

1. Push this repo to GitHub.
2. In Vercel, create a new project from `CypherAi-hub/kenan-portfolio`.
3. Use the default Next.js framework preset.
4. Build command: `npm run build`.
5. Install command: `npm install`.
6. Output directory: leave default.
7. No environment variables are required.
8. Deploy, then set the production domain when ready.

## Content Still Needed

- Authenticated FoFit Coach dashboard screenshots once a safe demo workspace exists
- Netwatch dashboard screenshots if/when the planned frontend is built
- Additional screenshots for private/archive projects with no media yet: Cypher OS Archive, Ruflo OS, UltraFlips Mobile, Stack Mode, Get-funded, FoFit Content Lab
- Final case-study copy, annotated screenshots, and demo notes
- Any final live URLs that should replace temporary Vercel preview URLs

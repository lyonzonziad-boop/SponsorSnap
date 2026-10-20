# SponsorSnap

**Your creator profile. Ready for brands.**

SponsorSnap is a free media kit builder for content creators. You describe your work, enter the audience statistics you already have, set indicative packages, preview a professional document, and export a PDF.

The product is designed to stay usable without an account, without a cloud database for your kits, and without connecting to YouTube, TikTok, Instagram or any other social network.

This repository is a Next.js application so it can be developed and previewed in a modern React environment. Creator projects are still stored **in the browser** (IndexedDB + localStorage). They are not written to PostgreSQL.

## Concept

A media kit is a short commercial dossier. SponsorSnap helps you:

1. Present your activity
2. Highlight audience statistics you typed yourself
3. List public platforms
4. Build an indicative rate card
5. Compose an elegant dossier
6. Preview it immediately
7. Export a real A4 PDF
8. Save and edit multiple local projects
9. Adapt the layout with six templates
10. Download a JSON backup or copy a local data link

SponsorSnap does **not** promise that a brand will hire you, and it does **not** treat calculated prices as market truth.

## Technologies

- Next.js (App Router) and React
- TypeScript
- Tailwind CSS
- Lucide icons
- jsPDF for document generation
- IndexedDB for projects
- localStorage for preferences
- Vitest for unit tests

No paid AI API is required. No analytics tracker is bundled.

## Prerequisites

- Node.js 20 or later
- npm 10 or later

A PostgreSQL database is only used by the optional health check in this template (`/api/health`). You do not need it to edit media kits in the browser.

## Installation

```bash
npm install
```

Copy environment variables if you run the included health route:

```bash
# .env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

## Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a kit from the homepage or Dashboard. Your work is saved in this browser profile.

## Tests

```bash
npx vitest run
```

Covered areas:

- Engagement rate (including `null`, `0`, negatives, `NaN`)
- URL validation
- Indicative pricing
- Currency formatting
- JSON import / export
- Data migration
- Filename sanitization
- Missing values

## Production build

```bash
npm run build
```

Output directory: `.next/` (Next.js production build).

Start the production server:

```bash
npm run start
```

## Static hosting notes

The **editing experience requires JavaScript**. A `<noscript>` message explains this.

Creator data is not stored on the server. You can still deploy the UI on:

### GitHub Pages

GitHub Pages is a static host. This project currently uses Next.js server rendering for the app shell. For a purely static export:

1. Add `output: "export"` in `next.config.ts` if you remove server-only routes such as `/api/health`.
2. Run `npm run build`.
3. Publish the generated `out/` folder.

Until you enable static export, prefer Cloudflare Pages, Netlify or any Node host that can run `next start`.

### Cloudflare Pages

- Framework preset: Next.js
- Build command: `npm run build`
- The media kit data still lives in each visitor’s browser, not on Cloudflare.

### Netlify (static or Next runtime)

- Build command: `npm run build`
- If you use Netlify’s Next runtime, `/api/health` can stay.
- Do not enable forms or analytics that would collect kit contents.

## How local data works

| Data | Storage | Notes |
| --- | --- | --- |
| Projects, photos, logos | IndexedDB database `sponsorsnap` | Stays on this device |
| Theme, language, currency, last project id | `localStorage` | Small preferences |
| PDF / JSON downloads | Blob URLs | Revoked after download |

Nothing is uploaded automatically. Clearing site data in the browser deletes local kits.

## Backup

1. Open **Export Center**
2. Download the project JSON, or **Export all projects** in Settings
3. Keep the file on your computer or send it yourself

## Restore

1. Open **Export Center**
2. Import a `.json` file
3. Invalid files are refused
4. If the id already exists, you are asked before replacement
5. Compatible older fields are migrated

## Limitations

- Statistics are **manual**. There is no live connection to social platforms.
- Follower totals add accounts, not unique people.
- Suggested prices are **indicative starting hypotheses**, not verified market rates.
- Local kits do **not** sync across devices or browsers.
- A local data URL is not a public share link; it only encodes JSON in this browser.
- jsPDF uses standard fonts; very rare Unicode glyphs may not render.
- Large photos increase IndexedDB usage. Images are resized, but a quota error can still happen.
- The first version has no payments, no accounts, and no cloud collaboration.

## Add a template

1. Add an id to `TemplateId` in `src/types/index.ts`
2. Describe it in `src/lib/templates.ts`
3. Add CSS under `.kit-yourid` in `src/app/globals.css`
4. Extend `templatePalette` in `src/lib/pdf.ts` if the print version needs different colors

Switching templates never deletes profile, platforms, offers or rates.

## Add a platform

Platform types live in `PlatformType` and `PLATFORM_META` (`src/lib/templates.ts`).  
Custom platforms are already supported (`type: "custom"`).

## Change pricing calculations

Edit `src/lib/pricing.ts`. Default coefficients are in `DEFAULT_ASSUMPTIONS`.  
The calculator UI exposes every coefficient. **Reset assumptions** restores defaults.  
Update `src/lib/pricing.test.ts` when you change a formula.

## Features actually tested

Automated (Vitest):

- Engagement math and invalid inputs
- Pricing ranges, overrides, missing views
- JSON round-trip, invalid JSON, migration
- Filenames with accents and illegal characters
- Currency / number formatting

Manual path you can run in the browser:

1. Open the site
2. Create a project
3. Choose a template
4. Add a profile
5. Add a platform
6. Enter statistics
7. Create a package
8. Calculate a rate
9. Add it to the media kit
10. Preview
11. Change theme
12. Save
13. Refresh and confirm restore
14. Export PDF
15. Export JSON
16. Re-import
17. Duplicate
18. Delete the copy (confirmation required)

## License

Source provided for the SponsorSnap product. Use and adapt as needed for your own deployment.

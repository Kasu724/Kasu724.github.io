# Portfolio

My personal portfolio [(Kevin Lui)](https://github.com/Kasu724), built with React, TypeScript, and Vite.

It contains my experience, skills, education, projects, and some food photography. It is deployed as a static site to GitHub Pages.

## Features

- Responsive pages with sections for an intro, skills, experience, projects, education, and additional information
- Additional `/about/`, `/projects/`, and `/food/` pages
- Client-side page transitions with browser history support and reduced-motion handling
- Project and profile content stored in typed data modules under `src/data/`
- Location map powered by Leaflet
- Food gallery with responsive WebP thumbnails and full-resolution originals stored in Cloudflare R2
- [Catpuccin](https://catppuccin.com) theme controls and GitHub contribution/commit data sections
- Automatic deployment through GitHub Actions and GitHub Pages

## Tech stack

- React 19
- TypeScript
- Vite
- CSS
- Leaflet
- Cloudflare R2 and Sharp for food-photo processing
- GitHub Actions for deployment

## Running development environment

### Requirements

- Node.js LTS
- npm
- Git, if you want deployment metadata to be populated locally

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values needed for the local app and food-photo synchronization:

```powershell
Copy-Item .env.example .env.local
```

The frontend only uses variables prefixed with `VITE_`. The R2 variables are read by the local sync script and must not be exposed in client-side code. `.env.local` is ignored by Git.

Set `VITE_CARTO_API_KEY` to the CARTO Basemaps key provided for this site. For GitHub Pages, add the same value as the `CARTO_API_KEY` GitHub Actions secret so the deployment build can include it.

### Run locally

```bash
npm run dev
```

Vite serves the portfolio locally with hot module replacement. The development pre-script also runs the food-photo synchronization step.

### Build and preview

```bash
npm run build
npm run preview
```

The production build is written to `dist/` and includes the four HTML entry points:

- `/`
- `/about/`
- `/projects/`
- `/food/`

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Synchronize food photos, type-check, and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run food:sync` | Process and upload new food photos |

## Managing content

Most portfolio content is kept separate from layout code:

- `src/data/experience.ts` — work experience
- `src/data/projects.ts` — project cards and links
- `src/data/foodPhotos.ts` — food-gallery metadata
- `src/data/githubContributions.ts` and `src/data/githubCommits.ts` — GitHub activity data
- `src/data/socialLinks.ts` — contact and social links
- `src/components/` — reusable sections and UI components
- `src/pages/` — dedicated page compositions
- `src/styles/` — base, theme, layout, and component styles

To update the portfolio, edit the relevant data module or component, then run `npm run lint` and `npm run build`.

## Food photo workflow

1. Copy uniquely named source images into `public/images/food/`.
2. Run `npm run food:sync`, or add images while `npm run dev` is running.
3. Complete the generated entries at the top of `src/data/foodPhotos.ts`.
4. Include a valid `YYYY-MM-DD` date before a photo appears in the gallery.

The sync script uploads originals to Cloudflare R2, generates 400px and 800px WebP thumbnails, and skips objects that already exist. Gallery cards load responsive thumbnails; opening a card loads the full original.

R2 credentials live only in the ignored `.env.local` file, so they do not follow a clone to another computer. Before adding photos on a new computer, copy `.env.example` to `.env.local` and restore all five `R2_*` values from secure storage. Do not commit `.env.local`. The sync command now stops instead of creating undeployable local image references when those credentials are unavailable.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which:

1. Installs dependencies with `npm ci`
2. Builds the site with the GitHub commit SHA as deployment metadata
3. Uploads `dist/` as a GitHub Pages artifact
4. Deploys the artifact to GitHub Pages

The repository’s GitHub Pages environment must be configured to use GitHub Actions. R2 credentials are needed only on the computer that adds food photos; deployment uses the public R2 URLs written into `src/data/foodPhotos.ts`.

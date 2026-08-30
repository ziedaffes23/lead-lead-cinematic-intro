# Cloud Run + Cloudflare Pages Deployment

This deployment keeps the Node/Express API on Google Cloud Run and serves the large cinematic assets from Cloudflare Pages. Registrations continue to go to the existing Google Apps Script `/exec` endpoint, and uploaded documents are sent directly to Apps Script as data URLs.

## 1. Deploy the API to Cloud Run

Create a Cloud Run service from this repository and build from the root `Dockerfile`.

Set these runtime variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `VITE_APP_TITLE` | `Lead&Lead2K26` |
| `VITE_SHEETS_WEB_APP_URL` | The Google Apps Script web-app URL ending in `/exec` |
| `FRONTEND_ORIGIN` | The final Cloudflare Pages URL, for example `https://lead-lead.pages.dev` |
| `PUBLIC_APP_URL` | The Cloud Run service URL |

Do not set `BUILT_IN_FORGE_API_URL` or `BUILT_IN_FORGE_API_KEY` unless Manus Forge storage is intentionally being used. Cloud Run supplies `PORT` automatically; the application listens on `0.0.0.0`.

Allow unauthenticated access to the Cloud Run service because the public registration page must call the API.

## 2. Deploy the frontend to Cloudflare Pages

Create a Pages project from the same GitHub repository with these settings:

| Setting | Value |
|---|---|
| Framework preset | Vite, or None if Vite is not listed |
| Build command | `corepack enable && pnpm install --frozen-lockfile && pnpm build` |
| Output directory | `dist/public` |
| Root directory | `/` |
| Node version | `22` |

Set these build variables in Cloudflare Pages:

| Variable | Value |
|---|---|
| `VITE_APP_TITLE` | `Lead&Lead2K26` |
| `VITE_API_BASE_URL` | The Cloud Run service URL, without a trailing slash |
| `VITE_DIRECT_SHEETS_UPLOAD` | `true` |

After the first Pages deployment, copy its `pages.dev` URL into Cloud Run’s `FRONTEND_ORIGIN` variable and redeploy Cloud Run. This enables secure cross-origin API requests.

## 3. Registration verification

Open the Cloudflare Pages URL and verify `/`, `/home`, `/register`, and `/hall-of-banners`. Submit one test registration with small attachments. A successful result must show a receipt, append one row to the configured spreadsheet, and place the three documents in the configured Google Drive folder.

Keep identity documents in a restricted Drive folder. Do not use `Anyone with the link — Viewer` for CIN or passport files.

## 4. Updating the site

Push changes to the `main` branch. Cloudflare Pages rebuilds the frontend and Cloud Run should be redeployed when backend changes are made. If the Cloud Run URL changes, update `VITE_API_BASE_URL` in Cloudflare Pages and `FRONTEND_ORIGIN` in Cloud Run.

The split is intentional: Cloudflare serves the large audio and image assets from its CDN, while Cloud Run handles only API and registration requests. This avoids using the API host’s bandwidth for every cinematic asset download.

## 5. Billing note

Cloud Run is pay-per-use and has a monthly free tier, but Google Cloud requires a billing account and charges any usage beyond the free tier. Set a budget alert and keep minimum instances at zero. Cloudflare Pages is used for the static frontend and its documented Free plan supports static asset hosting.

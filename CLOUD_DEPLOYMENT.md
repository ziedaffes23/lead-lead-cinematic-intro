# GitHub Pages + Google Cloud Run Deployment

This deployment avoids Railway, Render, and Cloudflare dashboard verification. GitHub Pages serves the cinematic frontend and its large assets from GitHub’s CDN. Google Cloud Run runs the Node/Express API. Registrations and documents continue to use the existing Google Apps Script `/exec` endpoint.

## Architecture

- **Frontend:** GitHub Pages at `https://ziedaffes23.github.io/lead-lead-cinematic-intro/`
- **Backend:** Google Cloud Run service URL
- **Registration data:** Existing Google Apps Script web app and Google Sheet
- **Documents:** Existing Google Drive workflow

The frontend does not send large cinematic audio/image files through Cloud Run. It also uses `VITE_DIRECT_SHEETS_UPLOAD=true`, so registration attachments are sent to the existing Apps Script flow instead of being uploaded twice through the API.

## 1. Deploy the API to Cloud Run

Use Google Cloud Run’s **Deploy from source** flow with this repository and the root `Dockerfile`, or deploy the container from Cloud Build.

Set these runtime variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `VITE_APP_TITLE` | `Lead&Lead2K26` |
| `VITE_SHEETS_WEB_APP_URL` | The Google Apps Script web-app URL ending in `/exec` |
| `FRONTEND_ORIGIN` | `https://ziedaffes23.github.io` |
| `PUBLIC_APP_URL` | The Cloud Run service URL |

Do not set `BUILT_IN_FORGE_API_URL` or `BUILT_IN_FORGE_API_KEY` unless Manus Forge storage is intentionally being used. Cloud Run supplies `PORT` automatically, and the server listens on `0.0.0.0`.

Allow unauthenticated access to the Cloud Run service because the public registration page must call it. Set minimum instances to zero to avoid idle charges.

## 2. Configure GitHub Pages

The repository contains `.github/workflows/deploy-pages.yml`. In the GitHub repository, open **Settings → Pages** and select **GitHub Actions** as the source.

Add this repository secret:

| Secret | Value |
|---|---|
| `VITE_SHEETS_WEB_APP_URL` | The existing Google Apps Script `/exec` URL |

Add this repository variable:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | The Cloud Run service URL, without a trailing slash |

Pushes to `main` automatically build and deploy the frontend. The workflow builds to `dist/public` and uses the `/lead-lead-cinematic-intro/` base path required by GitHub Pages.

## 3. Registration verification

Open `https://ziedaffes23.github.io/lead-lead-cinematic-intro/` and verify the home page, `/register`, `/mission`, `/principles`, `/hall-of-banners`, `/mirage`, and `/game`.

Submit one test registration with small attachments. A successful submission must display a receipt, append one row to Google Sheets, and place the uploaded documents in Google Drive.

Keep identity documents in a restricted Drive folder. Do not use `Anyone with the link — Viewer` for CIN or passport files.

## 4. Updating the site

Push frontend changes to `main` and GitHub Pages will rebuild automatically. Redeploy Cloud Run when backend files change. If the Cloud Run URL changes, update the `VITE_API_BASE_URL` repository variable and redeploy Pages.

## 5. Billing and limits

Cloud Run is pay-per-use and includes a monthly free tier, but Google Cloud requires a billing account and may charge usage beyond the free tier. Create a Google Cloud budget alert and keep minimum instances at zero. GitHub Pages is used only for static frontend delivery, which prevents large audio and image downloads from consuming Cloud Run bandwidth.

# Railway deployment

The project can run on Railway without Manus Forge storage. The registration page now tries the storage upload when Forge is configured and automatically falls back to sending the selected files as base64 data to the Google Apps Script endpoint. The Apps Script source in `LeadLeadRegistrationEndpoint.gs` must be deployed as a new version for that fallback to store files in Drive.

## 1. Update the Apps Script endpoint

Replace the deployed Apps Script source with `LeadLeadRegistrationEndpoint.gs`, then choose **Deploy → Manage deployments → Edit → New version → Deploy**. Keep the same `/exec` URL and the existing access setting. The endpoint must have access to the spreadsheet and the Drive folder identified by `DRIVE_FOLDER_ID`.

## 2. Set Railway variables

In the Railway service variables, set the following values. `VITE_SHEETS_WEB_APP_URL` is a build-time variable, so trigger a new deployment after changing it.

| Variable | Required | Value |
|---|---:|---|
| `NODE_ENV` | Yes | `production` |
| `VITE_APP_TITLE` | Yes | `Lead&Lead2K26` |
| `VITE_SHEETS_WEB_APP_URL` | Yes | The Apps Script web-app `/exec` URL |
| `PUBLIC_APP_URL` | Recommended | The public Railway URL, including `https://` |
| `PORT` | No | Leave unset so Railway can provide it, or use `3000` |
| `BUILT_IN_FORGE_API_URL` | No | Only needed if you want the original Manus storage assets and storage uploads |
| `BUILT_IN_FORGE_API_KEY` | No | Only needed together with the Forge URL |

Do not add a trailing slash to the Apps Script URL. A valid value resembles `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`.

## 3. Original artwork on Railway

The repository now includes local brand and background fallbacks, so images no longer fail when `/manus-storage/*` is unavailable. To restore the original storage-backed artwork, upload those original files to a public object-storage bucket and set `VITE_PUBLIC_ASSET_BASE_URL` to the bucket directory containing the files. The app will use the filename portion of each original `/manus-storage/...` reference. Because this variable is embedded during `pnpm build`, redeploy after setting it.

## 4. Verify after deployment

Open the Railway URL and confirm that `/`, `/home`, `/register`, and `/hall-of-banners` render without broken image icons. Submit a test registration using small files first. The Apps Script endpoint should return a receipt and the spreadsheet should contain one new row; the three files should appear in the configured Drive folder.

If a test still fails, inspect the Railway deployment logs for the tRPC request to `/api/trpc/registration.submit` and confirm that the Apps Script deployment was updated to the new source.

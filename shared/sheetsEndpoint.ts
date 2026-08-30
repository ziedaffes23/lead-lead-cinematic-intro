export const DEFAULT_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbztUHdla2ycMjqGiXMoTpjTRAQ2QwZuCvLzSsHSw1EaKUjeh0Xte7_1gz_rfoWf2qY8BA/exec";

const LEGACY_SHEETS_WEB_APP_URLS = new Set([
  "https://script.google.com/macros/s/AKfycbwQ40qc9TDpAlz0g6GQ1-CbXDDkiMA3crhafU7pdIZxK-kOy7_lfZwdaphS8uax1l5IlQ/exec",
]);

export function getSheetsWebAppUrl() {
  const configured = process.env.VITE_SHEETS_WEB_APP_URL || process.env.SHEETS_WEB_APP_URL;
  return configured && !LEGACY_SHEETS_WEB_APP_URLS.has(configured)
    ? configured
    : DEFAULT_SHEETS_WEB_APP_URL;
}

export function getSheetsLeaderboardUrl() {
  return getSheetsWebAppUrl();
}

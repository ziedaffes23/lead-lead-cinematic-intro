export const DEFAULT_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbztUHdla2ycMjqGiXMoTpjTRAQ2QwZuCvLzSsHSw1EaKUjeh0Xte7_1gz_rfoWf2qY8BA/exec";

export function getSheetsWebAppUrl() {
  return process.env.VITE_SHEETS_WEB_APP_URL || process.env.SHEETS_WEB_APP_URL || DEFAULT_SHEETS_WEB_APP_URL;
}

export function getSheetsLeaderboardUrl() {
  return getSheetsWebAppUrl();
}

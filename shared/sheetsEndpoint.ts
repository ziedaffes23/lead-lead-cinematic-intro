export const DEFAULT_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwnRQqEqaSZ0SmzZlxdRO3Es1yQjHj3pGQwtiU948RpgNpGlOWJr2l_IFp8T9rsEkhMKg/exec";

export function getSheetsWebAppUrl() {
  return process.env.VITE_SHEETS_WEB_APP_URL || process.env.SHEETS_WEB_APP_URL || DEFAULT_SHEETS_WEB_APP_URL;
}

export function getSheetsLeaderboardUrl() {
  return getSheetsWebAppUrl();
}

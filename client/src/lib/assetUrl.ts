const publicAssetBase = String(import.meta.env.VITE_PUBLIC_ASSET_BASE_URL ?? "").replace(/\/+$/, "");

export function assetUrl(storagePath: string, fallbackPath: string) {
  if (!publicAssetBase) return fallbackPath;
  const filename = storagePath.split("/").pop() ?? storagePath;
  return `${publicAssetBase}/${filename}`;
}

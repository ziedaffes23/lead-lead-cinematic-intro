export type DriveDocumentLink = { name: string; url: string };
export type SheetsDeliveryConfirmation = { ok: true; row?: number; documents?: Partial<Record<"photo" | "cv" | "identity", DriveDocumentLink>> };

type SheetsResponse = { ok?: unknown; row?: unknown; error?: unknown; documents?: unknown };

function decodeAppsScriptEnvelope(body: string): string {
  const direct = body.trim();
  if (direct.startsWith("{")) return direct;

  // Apps Script ContentService responses are wrapped by Google in an HTML
  // bootstrap page. The actual JSON is stored in the escaped `userHtml` field.
  const match = body.match(/userHtml\\x22:\\x22([\s\S]*?)\\x22,\\x22ncc/);
  if (!match) return direct;

  let decoded = match[1].replace(/\\x([0-9a-fA-F]{2})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
  while (decoded.includes("\\\\")) decoded = decoded.replaceAll("\\\\", "\\");
  return decoded.replaceAll('\\"', '"');
}

export function confirmSheetsDelivery(httpOk: boolean, body: string): SheetsDeliveryConfirmation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeAppsScriptEnvelope(body));
  } catch {
    throw new Error("The registration service returned an unreadable response. Please try again shortly.");
  }

  const response = parsed && typeof parsed === "object" ? parsed as SheetsResponse : {};
  if (!httpOk || response.ok !== true) {
    const message = typeof response.error === "string" && response.error.trim()
      ? response.error.trim()
      : "The registration service did not confirm your record.";
    throw new Error(message);
  }

  const documents = response.documents && typeof response.documents === "object"
    ? response.documents as Partial<Record<"photo" | "cv" | "identity", DriveDocumentLink>>
    : undefined;
  return { ok: true, row: typeof response.row === "number" ? response.row : undefined, documents };
}

export function parseSheetsDeliveryBody(body: string): SheetsResponse {
  return JSON.parse(decodeAppsScriptEnvelope(body)) as SheetsResponse;
}

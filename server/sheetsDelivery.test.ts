import { describe, expect, it } from "vitest";
import { confirmSheetsDelivery } from "@shared/sheetsDelivery";

describe("Sheets delivery confirmation", () => {
  it("accepts only an explicit successful Apps Script response", () => {
    expect(confirmSheetsDelivery(true, '{"ok":true,"row":4}')).toEqual({ ok: true, row: 4 });
  });

  it("rejects a JSON failure response even when Apps Script uses HTTP 200", () => {
    expect(() => confirmSheetsDelivery(true, '{"ok":false,"error":"Missing required field: department."}'))
      .toThrow("Missing required field: department.");
  });

  it("accepts the HTML-wrapped JSON returned by Google Apps Script", () => {
    const body = '<script>var x={"userHtml\\x22:\\x22\\x7b\\\\\\x22ok\\\\\\x22:true,\\\\\\x22row\\\\x22:50\\x7d\\x22,\\x22ncc"};</script>';
    expect(confirmSheetsDelivery(true, body)).toEqual({ ok: true, row: 50, documents: undefined });
  });

  it("rejects unreadable response bodies instead of allowing a false receipt", () => {
    expect(() => confirmSheetsDelivery(true, "not-json")).toThrow("unreadable response");
  });
});

import { describe, expect, it } from "vitest";
import {
  INTERNATIONAL_EB_EUR,
  INTERNATIONAL_MMB_EUR,
  SINGLE_ROOM_SUPPLEMENT_EUR,
  SINGLE_ROOM_SUPPLEMENT_TND,
  TUNISIAN_EB_TND,
  TUNISIAN_MMB_TND,
  getContribution,
} from "@/data/conferencePricing";

describe("conference pricing", () => {
  it("keeps the confirmed package rates", () => {
    expect(TUNISIAN_MMB_TND).toBe(160);
    expect(TUNISIAN_EB_TND).toBe(240);
    expect(INTERNATIONAL_MMB_EUR).toBe(65);
    expect(INTERNATIONAL_EB_EUR).toBe(90);
    expect(SINGLE_ROOM_SUPPLEMENT_TND).toBe(50);
    expect(SINGLE_ROOM_SUPPLEMENT_EUR).toBe(20);
  });

  it("calculates Tunisian MMB and EB packages", () => {
    expect(getContribution("Tounsi", "MMB")).toMatchObject({ price: 160, currency: "TND" });
    expect(getContribution("Tounsi", "EB")).toMatchObject({ price: 240, currency: "TND" });
  });

  it("adds exactly 50 TND when a Tunisian delegate selects a single room", () => {
    expect(getContribution("Tounsi", "MMB", true)).toMatchObject({ price: 210, currency: "TND" });
    expect(getContribution("Tounsi", "EB", true)).toMatchObject({ price: 290, currency: "TND" });
    expect(getContribution("Tounsi", "MMB", true)?.note).toContain("Single room supplement: +50 TND");
  });

  it("adds exactly 20 EUR when an international delegate selects a single room", () => {
    expect(getContribution("Other", "MMB", true)).toMatchObject({ price: 85, currency: "EUR" });
    expect(getContribution("Other", "EB", true)).toMatchObject({ price: 110, currency: "EUR" });
    expect(getContribution("Other", "MMB", true)?.note).toContain("Single room supplement: +20 EUR");
  });

  it("calculates international MMB and EB packages in euros", () => {
    expect(getContribution("Other", "MMB")).toMatchObject({ price: 65, currency: "EUR" });
    expect(getContribution("Other", "EB")).toMatchObject({ price: 90, currency: "EUR" });
    expect(getContribution("Other", "EB")?.note).toContain("all three days");
  });
});

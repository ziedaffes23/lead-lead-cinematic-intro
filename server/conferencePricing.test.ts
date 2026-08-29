import { describe, expect, it } from "vitest";
import {
  ACCOMMODATION_PER_NIGHT_TND,
  EB_DURATION_DAYS,
  MMB_DURATION_DAYS,
  TUNISIAN_EB_TND,
  TUNISIAN_MMB_TND,
  getContribution,
} from "@/data/conferencePricing";

describe("conference pricing", () => {
  it("keeps the Tunisian track rates and durations", () => {
    expect(TUNISIAN_MMB_TND).toBe(160);
    expect(TUNISIAN_EB_TND).toBe(240);
    expect(MMB_DURATION_DAYS).toBe(3);
    expect(EB_DURATION_DAYS).toBe(4);
    expect(ACCOMMODATION_PER_NIGHT_TND).toBe(80);
  });

  it("calculates Tunisian MMB and EB packages", () => {
    expect(getContribution("Tounsi", "MMB")).toMatchObject({ price: 160, currency: "TND" });
    expect(getContribution("Tounsi", "EB")).toMatchObject({ price: 240, currency: "TND" });
  });

  it("adds a 50 TND single-room surcharge", () => {
    expect(getContribution("Tounsi", "MMB", true)).toMatchObject({ price: 210, currency: "TND" });
    expect(getContribution("Tounsi", "EB", true)).toMatchObject({ price: 290, currency: "TND" });
    expect(getContribution("Tounsi", "MMB", true)?.note).toContain("+50 TND");
  });

  it("does not calculate a contribution for an incomplete or non-Tunisian selection", () => {
    expect(getContribution("", "MMB")).toBeNull();
    expect(getContribution("Tounsi", "")).toBeNull();
  });
});

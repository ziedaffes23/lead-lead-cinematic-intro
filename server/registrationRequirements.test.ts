import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const registerSource = await readFile(new URL("../client/src/pages/Register.tsx", import.meta.url), "utf8");
const appSource = await readFile(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const headerSource = await readFile(new URL("../client/src/components/ConferenceHeader.tsx", import.meta.url), "utf8");
const dataSource = await readFile(new URL("../client/src/data/conferenceSections.ts", import.meta.url), "utf8");

describe("registration requirements and dark-only presentation", () => {
  it("uses a generic required email with the requested example", () => {
    expect(registerSource).toContain('label>Email');
    expect(registerSource).toContain('placeholder="foulen.fouleni@mail.com"');
    expect(registerSource).toContain("Use a valid email address.");
    expect(registerSource).not.toContain("@aiesec.net");
    expect(dataSource).not.toContain("@aiesec.net");
  });

  it("marks core registration inputs as required", () => {
    expect(registerSource).toContain('placeholder="Foulen" required');
    expect(registerSource).toContain('placeholder="Fouléni" required');
    expect(registerSource).toContain('placeholder="Keep as text" required');
    expect(registerSource).toContain('<select required value={form.lc}');
    expect(registerSource).toContain('Country code<select value={form.phoneCountry}');
    expect(registerSource).toContain('inputMode="tel" required');
    expect(registerSource).toContain('CIN / passport');
    expect(registerSource).toContain('accept="image/jpeg,image/png,application/pdf,.pdf" required');
    expect(registerSource).toContain('accept="image/jpeg,image/png,image/webp" required');
    expect(registerSource).toContain('accept="application/pdf,.pdf" required');
    expect(registerSource).toContain('placeholder="List allergies or dietary concerns, or enter None" required');
    expect(registerSource).toContain('placeholder="Add a note for the organising team, or enter None" required');
    expect(registerSource).toContain('"Other"');
    expect(registerSource).toContain('receipt-summary');
    expect(dataSource).toContain('name: "SU Bullaregia"');
    expect(registerSource).toContain('autoComplete="email" required');
    expect(registerSource).toContain('<select required value={form.nationality}');
    expect(registerSource).toContain('<select required value={form.position}');
    expect(registerSource).toContain('<select required value={form.department}');
  });

  it("locks the public site to dark mode and removes the navigation toggle", () => {
    expect(appSource).toContain('defaultTheme="dark" switchable={false}');
    expect(headerSource).not.toContain("ThemeToggle");
  });
});

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const pageSource = await readFile(new URL("../client/src/pages/ConferenceHome.tsx", import.meta.url), "utf8");
const lighthouseStyles = await readFile(new URL("../client/src/styles/lighthouse-hero.css", import.meta.url), "utf8");
const restoreStyles = await readFile(new URL("../client/src/styles/lighthouse-restore.css", import.meta.url), "utf8");
const contrastStyles = await readFile(new URL("../client/src/styles/light-mode-contrast.css", import.meta.url), "utf8");

describe("ConferenceHome lighthouse hero", () => {
  it("places Answer the Call with the title instead of duplicating it in the mission console", () => {
    expect(pageSource).toContain('className="world-hero__directive"');
    expect(pageSource).toContain("ANSWER THE CALL");
    expect(pageSource).toContain("FOLLOW THE SIGNAL");
    expect(pageSource).not.toContain("<h2>ANSWER THE CALL</h2>");
  });

  it("keeps the lighthouse beam animated while providing a reduced-motion fallback", () => {
    expect(lighthouseStyles).toContain("animation:lighthouse-float");
    expect(lighthouseStyles).toContain(".world-hero__beacon b");
    expect(lighthouseStyles).toContain("transform:rotate(25deg)");
    expect(lighthouseStyles).toContain("@media(prefers-reduced-motion:reduce)");
    expect(lighthouseStyles).toContain("animation:none");
  });

  it("restores the larger abstract beacon and targets the title on desktop and mobile", () => {
    expect(pageSource).toContain('<div className="world-hero__beacon" aria-hidden="true"><span /><i /><b /></div>');
    expect(pageSource).not.toContain("world-hero__tower");
    expect(restoreStyles).toContain("width:16rem;height:34rem");
    expect(restoreStyles).toContain("transform:rotate(25deg)");
    expect(restoreStyles).toContain("transform:rotate(49deg)");
    expect(restoreStyles).toContain("@media(prefers-reduced-motion:reduce)");
  });

  it("defines a deliberate readable light-mode palette for public surfaces and actions", () => {
    expect(contrastStyles).toContain("--light-canvas:#f4f0e6");
    expect(contrastStyles).toContain("--light-ink:#122b3f");
    expect(contrastStyles).toContain(".game-primary");
    expect(contrastStyles).toContain(".registration-site");
    expect(contrastStyles).toContain(".conference-section-page");
  });
});

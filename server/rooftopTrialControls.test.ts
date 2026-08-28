import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const gameSource = await readFile(new URL("../client/src/pages/Game.tsx", import.meta.url), "utf8");
const runSource = await readFile(new URL("../client/src/components/RooftopRun.tsx", import.meta.url), "utf8");
const commandStyles = await readFile(new URL("../client/src/styles/rooftop-command-deck.css", import.meta.url), "utf8");

describe("Rooftop Trial command controls", () => {
  it("presents the tactical command deck and an explicit primary strike key", () => {
    expect(gameSource).toContain("trial-command-deck");
    expect(gameSource).toContain("RUN PROTOCOL");
    expect(runSource).toContain("KEYBOARD LOADOUT");
    expect(runSource).toContain("<kbd>F</kbd> STRIKE");
    expect(commandStyles).toContain(".trial-command-deck");
  });

  it("binds the F key to strike while retaining touch and legacy strike controls", () => {
    expect(runSource).toContain('"KeyF", "KeyJ", "KeyX"');
    expect(runSource).toContain('code: "KeyF"');
    expect(runSource).toContain('aria-label="Touch controls"');
    expect(runSource).toContain("strikeFrames = 17");
  });
});

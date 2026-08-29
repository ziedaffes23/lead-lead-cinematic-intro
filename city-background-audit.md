# City background visual audit

- Copied the user-provided 730x273 city artwork to `client/public/assets/lead-lead-city-background.jfif`.
- The home route (`/home`) now visibly uses the city skyline behind the hero composition with a dark blue/black readability overlay; the white/gold title, facts, CTA buttons, and mission console remain legible.
- The registration route remains excluded from the city background and is still a normal scrolling page.
- The intro (`/`) and game (`/game`) are excluded by scoping the new layer to `.game-home:not(.chase-route)`.
- The selected page background is implemented in the final `layout-system.css` cascade with responsive mobile positioning and stronger dark overlays.

## Final route check

The home route is now scoped back to its original cinematic background treatment. The Mission route visibly uses the newly provided 16:9 tower-and-city artwork with a dark overlay that keeps the heading, body copy, cards, and navigation readable. The navigation links remain present in the desktop route markup, and the mobile override now explicitly keeps every link visible in a horizontally scrollable row rather than applying the earlier hide rule.

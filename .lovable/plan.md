# Selectable Romantic Themes

The proposal page gets a theme picker. Each theme changes the whole mood at once: colors, fonts, background, and the floating animation.

## Themes

1. **Rose Garden** — blush pinks and deep rose, elegant serif headings, drifting rose petals.
2. **Starlit Night** — midnight blue and gold, airy modern type, twinkling stars and a soft glow.
3. **Sunset Dream** — peach, coral and warm amber, rounded friendly type, slow gradient haze with floating hearts.
4. **Vintage Love** — cream, dusty mauve and gold, typewriter-style type, gentle paper grain with falling confetti hearts.

## How it works for the visitor

- A small theme selector sits on the page (a row of colored dots with names) so the sender can pick the mood before sharing.
- Picking a theme instantly restyles everything: page background, heading font, buttons, card styling, and the animated background effect.
- The chosen theme is remembered in the shareable link, so whoever opens the link sees the same look.
- All themes work on phone and desktop, with animations toned down on small screens and respecting reduced-motion settings.

## Technical notes

- Add a theme layer in `src/styles.css`: each theme is a `[data-theme="..."]` block overriding the existing semantic tokens (background, foreground, primary, accent, card, border, radius) plus new font and glow variables. No hardcoded colors in components.
- Fonts loaded via a `<link>` in `src/routes/__root.tsx` head; map to `--font-display` / `--font-body` tokens registered in `@theme inline`.
- `src/lib/themes.ts` holds the theme registry (id, label, swatch colors, background effect name).
- `src/components/ThemeProvider.tsx` sets `data-theme` on the page root; `src/components/ThemePicker.tsx` renders the swatch selector.
- `src/components/backgrounds/` holds one lightweight component per effect (petals, stars, haze, confetti), CSS/Motion driven, gated behind `prefers-reduced-motion`.
- Theme id syncs to a URL search param on the proposal route so the link carries it.
- Keyframes for each effect live alongside the existing animation setup in `src/styles.css`.

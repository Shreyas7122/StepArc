# ST Fitness — Claude Project Brief

React + Vite fitness/nutrition tracker. Capacitor wraps it for Android. Supabase backend. Playwright + Vitest tests.

## Stack
- React 19, Vite 8, plain CSS (no Tailwind, no CSS-in-JS)
- lucide-react for icons
- Supabase for auth + data
- Playwright (e2e + a11y), Vitest (unit)

## Design system
Tokens live in [src/index.css](src/index.css) under `:root`. Always reference them via `var(--token)` — never hardcode hex. The token set is canonical; the `--purple-*` and `--gold-*` aliases exist only for backward compat with older components and should not be used in new code.

**Palette** — near-black surfaces (`--black`, `--ink-900/800/700`), single yellow accent (`--yellow-500`), white text, gray for secondary. Macro data viz uses dedicated colors (`--protein-color`, `--carbs-color`, `--fats-color`, `--fibre-color`).

**Fonts**
- `--font-display` (Saira Condensed) — hero numbers, identity moments
- `--font-heading` (Saira) — section labels, nav
- `--font-body` (Inter) — body copy, UI
- `--font-mono` (JetBrains Mono) — measurements, data

**Spacing** — strict 8pt grid: 4, 8, 12, 16, 24, 32, 48, 64. No arbitrary values.

**Radii** — `--r-sm/md/lg/xl/pill`. Pick from the set.

## Components
Live flat in [src/components/](src/components). Each is a single `.jsx` with co-located logic; styles go in [src/App.css](src/App.css) or [src/index.css](src/index.css) using BEM-ish class names. Keep it that way — no component-scoped CSS modules.

## UI rules (non-obvious)
- One loud accent per card max. Yellow does the work; gray carries the rest.
- Reserve `--glow-yellow` / `--shadow-lift` for hero/CTA only — not every card.
- All interactive elements must style all 5 states (default, hover, active, disabled, focus-visible). Focus rings are required for a11y tests.
- Touch targets ≥ 44px. Mobile-first; verify at 320px.
- Macro colors are data-viz only — don't use them as UI accents.

## Testing
- `npm run test` runs both suites. e2e tests under [tests/user-flows/](tests/user-flows) are flow-level (the artifacts/ and test-results/ noise is expected churn — don't commit it unless asked).
- a11y suite ([tests/accessibility.spec.js](tests/accessibility.spec.js)) uses axe. Don't regress contrast or aria labels.

## Anti-patterns to avoid here
- Hardcoded hex (use tokens)
- New `--purple-*` references (legacy alias only)
- Gradients stacked on gradients
- `opacity: 0.7` as a hover state — use background shift or translate
- Adding shadow/glow to every card

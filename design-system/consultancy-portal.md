# Lattice Engineering — Portal Design System

> Built for builders. A design system for a **software consultancy** portal — engagements, services, environments, and the engineers shipping them.

**Version** 1.0.0 · **Updated** 2026-05-26 · **Primary** `#0097A7`

---

## 1. Voice

This is a portal for delivery teams, not a marketing site.

| Trait | We are | We are not |
|---|---|---|
| Tone | Direct, technically precise, low-ego | Hype, "digital transformation", buzzword stacking |
| Posture | Senior IC next to you in the war room | Suit holding a clipboard |
| Promise | "Ship the systems your business runs on" | "End-to-end enterprise solutions" |
| Surfaces | Dense, signal-rich, scannable at a glance | Decorative, marketing-flavored |

Copy reads like a staff engineer wrote it. Specific numbers. Real commands. No "leveraging."

---

## 2. Color

A two-color system: **teal** for brand and identifiers, **slate** for everything structural. Semantic colors (green/amber/red) are reserved exclusively for **system health** — never used decoratively.

### Teal (brand)
| Token | Hex | Use |
|---|---|---|
| `--c-teal-950` | `#00272D` | Dark hero washes |
| `--c-teal-900` | `#003D44` | Text on light surfaces |
| `--c-teal-800` | `#005662` | Strong accents |
| `--c-teal-700` | `#006D7A` | Small text on white (AA-safe) |
| `--c-teal-600` | `#007E8C` | Button hover |
| **`--c-teal-500`** | **`#0097A7`** | **Primary** — buttons, brand mark, focus |
| `--c-teal-400` | `#2BAEBD` | Highlights |
| `--c-teal-300` | `#5BC4D1` | Accents on dark |
| `--c-teal-200` | `#9DDDE6` | Avatar fills |
| `--c-teal-100` | `#D4F0F4` | Tinted badge backgrounds |
| `--c-teal-50`  | `#EBF8FA` | Hover wash for ghost buttons |

### Slate (neutrals)
| Token | Hex | Use |
|---|---|---|
| `--c-slate-900` | `#0D1117` | Primary text, dark app surfaces |
| `--c-slate-700` | `#2A3441` | Secondary text, form labels |
| `--c-slate-500` | `#5C6975` | Helper text, captions |
| `--c-slate-300` | `#A3ADB7` | Disabled states |
| `--c-slate-200` | `#CFD5DC` | Input borders |
| `--c-slate-100` | `#E8ECF0` | Card borders, table rules |
| `--c-slate-50`  | `#F5F7F9` | App background, table headers |

### Semantic (health only)
| Token | Hex | Means |
|---|---|---|
| `--c-success` | `#10B981` | Healthy, on-track |
| `--c-warning` | `#F59E0B` | Degraded, at-risk |
| `--c-danger`  | `#EF4444` | Down, critical, destructive |

### Stack pill colors (data-viz only)
`Go #00ADD8 · TS #3178C6 · Python #FFD43B · Rust #DEA584 · K8s #326CE5 · AWS #FF9900 · Postgres #336791 · Redis #DC382D`

**Never** use stack colors as UI accents. They identify technologies, nothing else.

**Rules**
- Never pure `#000` — use `--c-slate-900`.
- Teal is for **identity**, not running text. Use slate for body copy.
- Semantic colors appear only in status badges, deltas, and the health column. No "amber CTAs."
- No gradients except the teal glow in the dark hero and the engineer-avatar fill.

---

## 3. Typography

| Family | Token | Role |
|---|---|---|
| **Space Grotesk** | `--font-display` | Display headlines, hero, KPI numbers |
| **Inter** | `--font-body` | All UI, buttons, body, labels |
| **JetBrains Mono** | `--font-mono` | Identifiers, metrics, captions, code |

Why Space Grotesk over a serif: software consulting reads as engineered, not editorial. A geometric display sans signals "we ship" — a serif signals "we present."

### Scale

| Style | Family · Weight | Size · LH · Tracking | Use |
|---|---|---|---|
| Display XL | Space Grotesk 600 | 60 · 60 · −3.5% | Hero only |
| Display LG | Space Grotesk 600 | 44 · 46 · −2.5% | Section openers |
| Display MD | Space Grotesk 600 | 32 · 37 · −2% | Page titles |
| Heading LG | Inter 700 | 22 · 28 · −1.5% | Section headings |
| Heading MD | Inter 600 | 17 · 23 · −0.5% | Card titles |
| Heading SM | Inter 600 | 14 · 20 | Subheadings, table heads |
| Body LG | Inter 400 | 17 · 27 | Lede paragraphs |
| Body | Inter 400 | 14 · 22 | Default UI text |
| Body SM | Inter 400 | 13 · 20 | Metadata |
| Mono | JetBrains 400 | 13 · 20 | Service names, identifiers |
| Caption | JetBrains 500 | 11 · 16 · +12% UPPER | Eyebrows, KPI labels, env tags |

**No italics.** Engineering brands don't italicize — emphasis comes from color or weight.

**Numerics** always use mono with `font-feature-settings: 'tnum'` so columns align.

---

## 4. Spacing

Strict **8pt grid**. Dense surfaces (dashboards, tables) live at 4/8/12. Narrative surfaces (project detail pages) breathe at 24/32/48.

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96` → `--s-1` through `--s-24`

---

## 5. Radii

Sharper than typical consumer apps. Reads as engineered, not friendly.

| Token | Value | Use |
|---|---|---|
| `--r-xs` | 4px | Chips, tags, kbd, env labels |
| `--r-sm` | 6px | Status badges, tight buttons |
| `--r-md` | 8px | Buttons, inputs, dropdowns |
| `--r-lg` | 12px | Cards, stat tiles, top nav |
| `--r-xl` | 20px | Hero, full-page panels |
| `--r-pill` | 999px | Rare — only the loading bar |

---

## 6. Components

### Buttons
Five variants. Default 36px, small 28px, large 44px. Five states required.

| Variant | Background | Border | Text | Use |
|---|---|---|---|---|
| **Primary** | `--c-teal-500` | — | white | The one main action |
| **Secondary** | white | slate-200 | slate-900 | Alternates, cancel |
| **Ghost** | transparent | — | teal-700 | Tertiary, dense surfaces |
| **Dark** | slate-900 | — | white | Deploy, run, execute — destructive-but-intended |
| **Danger** | white → red on hover | slate-200 | red | Archive, delete |

Buttons can embed a `<span class="kbd">⌘K</span>` keyboard hint — important for a portal that engineers use daily.

### Health badges
Always **dot + word**. Color alone is never enough — accessibility and printing both require the label.

| Type | Means |
|---|---|
| Healthy | Live, passing all checks (dot pulses) |
| Degraded | SLO breach, intermittent errors |
| Down | Service unreachable / critical |
| Draft / Building | Not yet deployable |
| Pinned | Manually flagged |

### Stack chips
Mono 11px, slate-50 background, slate-100 border. Optional colored dot identifies the technology. **Never** use as a CTA, always informational.

### Stat tile
Mono caps label → Space Grotesk 36px value with smaller unit suffix → mono delta with semantic color + mono sub-text. Squared accent block in the label, **not** a colored top stripe.

### Engagement card
Replaces the generic "project card" with a software-engagement layout:
- **Engagement type** (mono, teal): `⚙ Modernize · ▲ Build · ▼ Audit · ⊕ Embed`
- **Title** (display 20px) + **client** (slate-500)
- **Status badge** + **engagement ID** (`eng-26q2-atlas`) top-right
- **One-line description**
- **Tech stack** as chips
- **Meta footer** — sprint progress, close date, team avatars

### Engineer card
Replaces "person card":
- Square avatar (12px radius, gradient teal) with **mono initials** — feels like a Git contributor avatar
- Name + **seniority chip** (Staff / Principal / Senior / Mid / Junior)
- Discipline + years (`Backend · Distributed systems · 11y`)
- Stack chips (max 3)

### Service health table
- Service name in **mono**
- Env tag (`prod` red / `staging` amber / `dev` teal) — small, mono caps
- Version in mono
- P95 latency as right-aligned mono number
- Status as health badge
- Row hover lifts to slate-50

### Top nav
White card on slate-50 page. Logo left, primary nav center, **search with ⌘K hint** + **+ New** primary action right. Active link gets teal-50 fill + teal-700 text.

---

## 7. Iconography

- **Lucide** as the icon set (`lucide-react`)
- Stroke 1.75px, sizes 14 / 16 / 20 / 24 aligned to the type scale
- Color inherits from text — never colored except in stat-delta arrows and the engagement-type glyph
- For type/engagement glyphs (⚙ ▲ ▼ ⊕), use real Lucide icons (`Settings, ArrowUp, Search, Plus`) rather than Unicode in production

---

## 8. Motion

| Token | Value | Use |
|---|---|---|
| `--t-fast` | 120ms | Press, micro-feedback |
| `--t-base` | 180ms | Hover, focus, tooltip |
| `--t-slow` | 280ms | Sheet / modal enter, route |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default |
| `--ease-snap` | `cubic-bezier(0.22, 1, 0.36, 1)` | Drawers |

Hover lifts use `translateY(-1px)` + shadow swap. The "live" pulse on healthy badges is the only ambient motion permitted — and it's how an engineer can see at a glance that the dashboard isn't stale.

---

## 9. Accessibility

- WCAG **AA** minimum on every text/background pair.
- `--c-teal-500` on white = **3.4:1** — passes only for large text + non-text UI. **Use `--c-teal-700` (5.2:1) for any small teal text.**
- `--c-slate-900` on white = **17:1** ✓
- `--c-slate-900` on `--c-slate-50` = **16:1** ✓
- Focus rings (3px teal @ 30%) required on every interactive element.
- Min touch target **44×44px** on touch surfaces; 36×28px ok on desktop dense controls.
- Verify at **375px** (mobile) and **1280px** (default desktop).
- **Status never conveyed by color alone** — always pair dot + label, env always shows text tag.
- The pulsing "healthy" dot respects `prefers-reduced-motion` (add this in production CSS).

---

## 10. Portal information architecture

A software consultancy portal lives on five surfaces:

1. **Dashboard** — DORA-ish KPIs + active engagements + bench + service health snapshot
2. **Engagements** — list / detail, sprint board, deliverables, retro notes
3. **Services** — catalogue of every system the firm operates or co-owns, with environments and SLOs
4. **Engineers** — directory, skills matrix, utilization, on-call rotations
5. **Playbooks** — internal IP: architecture patterns, runbooks, slide masters, code templates

If a feature doesn't fit one of these five, it probably belongs in Linear / GitHub / PagerDuty, not in this portal.

---

## 11. Anti-patterns

- ❌ Hardcoded hex — always tokens
- ❌ Pure `#000` or pure white text on teal
- ❌ Teal as a background for body copy
- ❌ Stack pill colors used as UI accents
- ❌ Semantic colors (green/amber/red) used decoratively
- ❌ Italics anywhere — emphasis is weight or color, never slant
- ❌ Gradients on cards (only the dark hero glow + engineer avatar)
- ❌ Status conveyed by color alone — always pair with a word
- ❌ Any radius or spacing value not on the scale
- ❌ Sentence-case for mono captions — they're always UPPER + tracked
- ❌ Decorative animations — only the live-health pulse is permitted

---

## 12. File layout

```
design-system/
├── consultancy-portal.html   ← live component showcase + tokens in :root
└── consultancy-portal.md     ← this document
```

The HTML's `:root` block is the **source of truth**. Copy it into the app's global stylesheet to adopt the system.

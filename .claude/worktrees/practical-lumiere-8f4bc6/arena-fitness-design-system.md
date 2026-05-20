# Arena Fitness — Design System

A bold, high-energy visual system for a fitness brand. Built around a saturated purple palette, gold accent, and heavy condensed display type. The mood is athletic, premium, and modern — designed for social-first marketing (Instagram posts, story banners, web hero sections).

Structured with **atomic design**: Foundations → Atoms → Molecules → Organisms → Templates.

---

## 1. Brand Principles

| Principle | Description |
|---|---|
| **Bold** | Headlines dominate. Type is heavy, uppercase, and tight. |
| **Energetic** | Saturated purples and glowing gradients carry motion and intensity. |
| **Premium** | Dark backgrounds, geometric cuts, and a single gold accent signal quality. |
| **Direct** | Short imperative copy: "Join us today", "Start now", "Shape your body". |

---

# FOUNDATIONS

## 2. Color

### Purple scale

| Token | Hex | Usage |
|---|---|---|
| `--purple-900` | `#1A0B2E` | Deepest background, near-black |
| `--purple-800` | `#2D1B4E` | Card and panel background |
| `--purple-700` | `#4A1D8C` | Mid-tone surfaces, gradient stop |
| `--purple-600` | `#5B1F9E` | Primary brand purple |
| `--purple-500` | `#7B2FBE` | Hover / lift states |
| `--purple-400` | `#9B4DDB` | Highlights, accent gradients |
| `--purple-300` | `#B57BE8` | Soft glow, subtle highlights |
| `--violet-glow` | `#A855F7` | Neon glow / radial gradient core |

### Accent

| Token | Hex | Usage |
|---|---|---|
| `--gold-500` | `#FFB800` | Primary accent — CTAs, highlights, key headlines |
| `--gold-400` | `#FFC83D` | Hover state for gold elements |

### Neutrals & semantic

| Token | Hex | Usage |
|---|---|---|
| `--white` | `#FFFFFF` | Primary text on dark backgrounds |
| `--off-white` | `#F4F4F5` | Secondary copy |
| `--gray-300` | `#D4D4D8` | Tertiary copy / metadata |
| `--gray-500` | `#71717A` | Muted text, dividers |
| `--black` | `#0A0612` | True black, used sparingly |
| `--success` | `#22C55E` | Positive states |
| `--danger` | `#EF4444` | Errors, sold-out states |

### Gradients

```css
--gradient-hero: linear-gradient(135deg, #2D1B4E 0%, #5B1F9E 50%, #8B3FD4 100%);
--gradient-card: linear-gradient(180deg, #4A1D8C 0%, #1A0B2E 100%);
--gradient-glow: radial-gradient(circle at 50% 50%, #A855F7 0%, transparent 70%);
--gradient-cta:  linear-gradient(90deg, #FFB800 0%, #FFC83D 100%);
```

## 3. Typography

| Role | Family | Weights | Notes |
|---|---|---|---|
| **Display** | `Anton` (fallback `Bebas Neue`, `Impact`) | 400 | Condensed, all-caps, tight tracking |
| **Heading** | `Oswald` (fallback `Arial Narrow`) | 500–700 | Semi-condensed for sub-heads |
| **Body** | `Inter` (fallback system-ui) | 400–700 | Clean, legible at small sizes |
| **Mono** | `JetBrains Mono` | 400, 600 | Pricing, plan codes, badges |

### Scale

| Token | Size | Line height | Use |
|---|---|---|---|
| `display-xl` | 128px | 0.9 | Hero headlines ("FITNESS") |
| `display-lg` | 72px | 0.95 | Section headers |
| `display-md` | 56px | 1.0 | Sub-hero |
| `h1` | 40px | 1.1 | Page titles |
| `h2` | 32px | 1.2 | Card titles |
| `body-lg` | 18px | 1.5 | Lead paragraphs |
| `body` | 16px | 1.5 | Default copy |
| `caption` | 12px | 1.4 | Tags, footnotes |

Display type: `text-transform: uppercase; letter-spacing: -0.02em;`. Headlines pair white + one gold word for emphasis. Body stays sentence case.

## 4. Spacing

8-pt base scale: `space-1` 4px · `space-2` 8px · `space-3` 12px · `space-4` 16px · `space-5` 24px · `space-6` 32px · `space-7` 48px · `space-8` 64px · `space-9` 96px.

## 5. Radius

| Token | Value | Use |
|---|---|---|
| `--r-sm` | 4px | Tags, chips |
| `--r-md` | 8px | Inputs, small buttons |
| `--r-lg` | 16px | Cards |
| `--r-xl` | 24px | Hero panels |
| `--r-pill` | 999px | Pills, CTA buttons |

## 6. Elevation & Glow

```css
--shadow-card:  0 10px 30px rgba(0, 0, 0, 0.4);
--shadow-lift:  0 20px 60px rgba(91, 31, 158, 0.4);
--glow-purple:  0 0 40px rgba(168, 85, 247, 0.5);
--glow-gold:    0 0 24px rgba(255, 184, 0, 0.45);
```

---

# ATOMS

The smallest, indivisible building blocks. Each atom does one thing.

| Atom | Variants | Notes |
|---|---|---|
| **Button** | `primary` (gold), `secondary` (purple), `ghost` (outline), `angular` (skewed white), sizes `sm` / `lg` | Heading font, uppercase, pill radius |
| **Input** | text, email, select, search | Translucent fill; gold focus ring |
| **Label** | — | Uppercase, tracked, gray-300 |
| **Checkbox** | default, checked | `accent-color: gold` |
| **Toggle** | off, on | Gold track when on |
| **Pill / Badge** | `gold`, `white`, `purple`, `ghost`, `success`, `danger` | Uppercase caption size |
| **Icon** | dumbbell, heart, timer, pulse, location, phone, plus, check | 2px line stroke, 24px grid |
| **Avatar** | sizes 32 / 48 / 64 / 80, optional gold ring | Gradient fill, initials |
| **Divider** | thin, gold, glow | 1–2px |
| **Progress** | linear bar, circular ring | Gold fill on track |

---

# MOLECULES

Atoms wired together into small, reusable units.

| Molecule | Composed of |
|---|---|
| **Search bar** | Input + primary button |
| **Stat** | Display number + delta pill + label |
| **Form group** | Label + input + helper text |
| **Profile chip** | Avatar + name + meta |
| **Alert** | Icon + title + description on tinted surface |
| **Breadcrumb** | Linked text atoms + separators |
| **Session row** | Icon tile + title/meta + action button |
| **Pagination** | Row of ghost/primary buttons |

---

# ORGANISMS

Self-contained sections composed of multiple molecules.

| Organism | Composed of |
|---|---|
| **Top nav** | Brand lockup + nav links + auth buttons |
| **Plan comparison row** | Two plan cards (tag, title, feature list, CTA); Pro card uses gold border |
| **Pricing tiles** | Black tile, purple ring, large display amount, glow |
| **Testimonial strip** | Eyebrow + grid of profile chips with quotes |
| **Site footer** | Brand block + link columns + newsletter molecule + legal bar |

### Card anatomy

- Background `--gradient-card`, radius `--r-lg`, padding `space-6`
- Tag (gold), display title, body copy, feature list, full-width CTA
- Featured variant: gold border + `--shadow-lift` + gold glow

---

# TEMPLATES

Page-level compositions assembled from organisms. Wireframes — replace placeholders with real content.

| Template | Layout |
|---|---|
| **T-01 · Marketing Landing** | Nav → Hero → 3 feature blocks → Pricing row → Testimonial strip → Footer |
| **T-02 · Member Dashboard** | Sidebar nav + (3 stats → today's session → progress chart) |
| **T-03 · Social Post (1:1)** | Square grid: hero crop, product, pricing |

### Hero pattern

The signature layout: gradient backdrop + radial glow, condensed display headline, **one gold word** for emphasis, single primary CTA plus optional ghost CTA.

---

## Voice & Tone

- **Imperative, short:** "Shape your body." "Start now." "Join us today."
- **Bilingual-friendly:** Portuguese and Spanish copy patterns are common in source material.
- **Avoid:** corporate jargon, long sentences, hedging.

## Do / Don't

| Do | Don't |
|---|---|
| Pair white headlines with one gold word for emphasis | Use more than one accent color per layout |
| Layer subjects over purple gradients | Place subjects on flat solid purple |
| Use condensed display type uppercase | Mix multiple display families in one layout |
| Keep CTAs gold and singular | Stack multiple equal-weight CTAs |

---

*Live reference: see `arena-fitness-design-system.html` for the rendered system.*

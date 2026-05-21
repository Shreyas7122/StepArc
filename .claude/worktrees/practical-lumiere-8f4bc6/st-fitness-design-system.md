# ST Fitness Academia — Design System

A high-contrast, aggressive visual system for a gym brand. Built on a near-black canvas, a single electric-yellow accent, and heavy italic condensed display type. The mood is intense, motivational, and bold — designed for social-first content (square Instagram posts, story carousels, educational Q&A graphics).

Structured with **atomic design**: Foundations → Atoms → Molecules → Organisms → Templates.

---

## 1. Brand Principles

| Principle | Description |
|---|---|
| **Aggressive** | Italic headlines lean forward — motion and urgency in the type itself. |
| **High-contrast** | Pure black background, pure yellow accent. No mid-tone clutter. |
| **Motivational** | Copy poses questions and challenges the reader directly. |
| **Editorial** | Q&A / educational layouts — headline question, supporting answer. |

---

# FOUNDATIONS

## 2. Color

### Brand

| Token | Hex | Usage |
|---|---|---|
| `--yellow-500` | `#F4C20D` | Primary brand accent — headlines, highlights, CTAs |
| `--yellow-400` | `#FFD426` | Hover / lift state |
| `--yellow-600` | `#C99A05` | Pressed state, shadows on yellow |
| `--yellow-glow` | `#FFE066` | Glow / outer light on dark |

### Neutrals

| Token | Hex | Usage |
|---|---|---|
| `--black` | `#0A0A0A` | Primary background |
| `--ink-900` | `#141414` | Card / panel background |
| `--ink-800` | `#1F1F1F` | Raised surfaces |
| `--ink-700` | `#2E2E2E` | Borders, dividers |
| `--gray-400` | `#9A9A9A` | Secondary copy |
| `--gray-200` | `#D6D6D6` | Tertiary copy |
| `--white` | `#FFFFFF` | Primary text on dark |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `--success` | `#3DD68C` | Positive states |
| `--danger` | `#FF4D4D` | Errors, pain-point highlights (e.g. back/neck graphics) |

### Gradients

```css
--gradient-hero:   linear-gradient(135deg, #0A0A0A 0%, #1F1F1F 60%, #C99A05 140%);
--gradient-yellow: linear-gradient(90deg, #F4C20D 0%, #FFD426 100%);
--gradient-fade:   linear-gradient(180deg, rgba(244,194,13,0) 0%, rgba(244,194,13,0.12) 100%);
--gradient-glow:   radial-gradient(circle at 50% 50%, rgba(255,224,102,0.35) 0%, transparent 70%);
```

## 3. Typography

| Role | Family | Weights | Notes |
|---|---|---|---|
| **Display** | `Saira Condensed` (fallback `Oswald`, `Impact`) | 700–900 **italic** | Condensed, italic, all-caps — the signature look |
| **Heading** | `Saira` (fallback `Arial Narrow`) | 600–700 | Upright for sub-heads |
| **Body** | `Inter` (fallback system-ui) | 400–600 | Clean, legible |
| **Mono** | `JetBrains Mono` | 400, 600 | Tokens, metadata, tags |

### Scale

| Token | Size | Line height | Use |
|---|---|---|---|
| `display-xl` | 104px | 0.92 | Post headlines ("IMPACTA OS RESULTADOS?") |
| `display-lg` | 72px | 0.95 | Section headers |
| `display-md` | 52px | 1.0 | Sub-hero |
| `h1` | 38px | 1.1 | Page titles |
| `h2` | 30px | 1.2 | Card titles |
| `body-lg` | 18px | 1.5 | Lead paragraphs |
| `body` | 16px | 1.5 | Default copy |
| `caption` | 12px | 1.4 | Tags, footnotes |

Display type: `font-style: italic; text-transform: uppercase; letter-spacing: -0.01em;`. Headlines mix white + yellow words for emphasis. A common treatment puts a key word in a **yellow highlight box** (black text on yellow). Body stays upright sentence case.

## 4. Spacing

8-pt base scale: `space-1` 4px · `space-2` 8px · `space-3` 12px · `space-4` 16px · `space-5` 24px · `space-6` 32px · `space-7` 48px · `space-8` 64px · `space-9` 96px.

## 5. Radius

| Token | Value | Use |
|---|---|---|
| `--r-sm` | 3px | Highlight boxes, tags |
| `--r-md` | 8px | Inputs, small buttons |
| `--r-lg` | 14px | Cards |
| `--r-xl` | 22px | Hero panels |
| `--r-pill` | 999px | Pills, CTA buttons |

## 6. Elevation & Glow

```css
--shadow-card: 0 12px 32px rgba(0, 0, 0, 0.6);
--shadow-lift: 0 22px 60px rgba(0, 0, 0, 0.8);
--glow-yellow: 0 0 32px rgba(244, 194, 13, 0.45);
--glow-soft:   0 0 60px rgba(255, 224, 102, 0.25);
```

---

# ATOMS

The smallest, indivisible building blocks. Each atom does one thing.

| Atom | Variants | Notes |
|---|---|---|
| **Button** | `primary` (yellow), `secondary` (outline), `ghost`, `dark` (ink fill), sizes `sm` / `lg` | Heading font, uppercase, pill radius |
| **Input** | text, email, select, search | Ink fill; yellow focus ring |
| **Label** | — | Uppercase, tracked, gray-400 |
| **Checkbox** | default, checked | `accent-color: yellow` |
| **Toggle** | off, on | Yellow track when on |
| **Pill / Badge** | `yellow`, `outline`, `dark`, `success`, `danger` | Uppercase caption size |
| **Highlight box** | yellow box / underline | Black text on yellow — the brand's word-emphasis device |
| **Icon** | dumbbell, brain, heart, stretch, spine, flame, clock, check | 2px line stroke, 24px grid |
| **Avatar** | sizes 32 / 48 / 64 / 80, optional yellow ring | Ink fill, initials |
| **Divider** | thin, yellow, glow | 1–2px |
| **Progress** | linear bar, circular ring | Yellow fill on ink track |

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
| **Q&A line** | Eyebrow question + highlighted keyword + answer |
| **Class row** | Icon tile + title/meta + action button |
| **Pagination** | Row of ghost/primary buttons |

---

# ORGANISMS

Self-contained sections composed of multiple molecules.

| Organism | Composed of |
|---|---|
| **Top nav** | Brand lockup + nav links + auth buttons |
| **Class card row** | Two/three class cards (tag, title, meta, CTA) |
| **Pricing tiles** | Ink tile, yellow ring, large display amount, glow |
| **Q&A post card** | Square card: eyebrow question + display headline + image slot + logo |
| **Testimonial strip** | Eyebrow + grid of profile chips with quotes |
| **Site footer** | Brand block + link columns + newsletter molecule + legal bar |

### Card anatomy

- Background `--ink-900`, radius `--r-lg`, padding `space-6`, border `1px --ink-700`
- Tag (yellow), display title, body copy, meta list, full-width CTA
- Featured variant: yellow border + `--shadow-lift` + `--glow-yellow`

---

# TEMPLATES

Page-level compositions assembled from organisms. Wireframes — replace placeholders with real content.

| Template | Layout |
|---|---|
| **T-01 · Marketing Landing** | Nav → Hero → 3 feature blocks → Pricing row → Testimonial strip → Footer |
| **T-02 · Member Dashboard** | Sidebar nav + (3 stats → today's class → progress chart) |
| **T-03 · Q&A Social Post (1:1)** | Square: eyebrow question → display headline w/ highlight → subject photo → logo |

### Q&A post pattern

The signature layout: black canvas with an oversized faded display word bleeding off-edge, a small eyebrow question, a large italic display headline with **one word in a yellow highlight box**, a cut-out athlete photo, and the ST Fitness logo lockup top or bottom.

---

## Voice & Tone

- **Question-led:** "Antes ou depois do treino?" "Como a consistência impacta os resultados?"
- **Direct & motivational:** speaks to the reader, challenges habits.
- **Bilingual-friendly:** Portuguese copy patterns are common in source material.
- **Avoid:** corporate jargon, long hedging sentences.

## Do / Don't

| Do | Don't |
|---|---|
| Keep one yellow highlight word per headline | Highlight multiple words — emphasis is lost |
| Use italic condensed display uppercase | Mix upright and italic display in one headline |
| Place cut-out athletes on pure black | Use flat photos on flat yellow |
| Reserve yellow for accent + emphasis only | Flood layouts with yellow fills |

---

*Live reference: see `st-fitness-design-system.html` for the rendered system.*

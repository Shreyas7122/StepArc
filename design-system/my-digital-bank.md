# my digital bånk — Design System

> A bank that feels like fresh air. Calm green, warm cream, and a signature concave-cut card.

**Version** 1.0.0 · **Updated** 2026-05-26

---

## 1. Brand voice

| Trait | We are | We are not |
|---|---|---|
| Tone | Warm, plainspoken, confident | Salesy, jargon-heavy, exclamatory |
| Posture | Helpful peer | Cold institution |
| Promise | "Freedom from friction" | "Best rates in the market" |
| Imagery | Real people, mid-laugh, daylight | Stock handshakes, suits, skyscrapers |

Headlines read like a friend explaining something. Body copy never apologizes for being short.

---

## 2. Color

The system runs on **one green** and **one cream**. Everything else is restraint.

### Greens (primary brand)
| Token | Hex | Use |
|---|---|---|
| `--mdb-green-900` | `#1B4332` | Text on cream, dark accents |
| `--mdb-green-700` | `#2D6A4F` | **Primary** — buttons, brand surfaces |
| `--mdb-green-600` | `#3E8567` | Hover, secondary fills |
| `--mdb-green-500` | `#52B788` | Decorative, illustrations |
| `--mdb-green-300` | `#95D5B2` | Focus rings, subtle highlights |
| `--mdb-green-100` | `#D8F3DC` | Tinted backgrounds, badges |

### Creams (surface)
| Token | Hex | Use |
|---|---|---|
| `--mdb-cream-100` | `#FAF6EC` | Card surface (on green) |
| `--mdb-cream-200` | `#F2EBD8` | **Page surface** (default background) |
| `--mdb-cream-300` | `#E6DCC1` | Dividers, hairlines |
| `--mdb-cream-400` | `#D4C7A6` | Borders on cream |

### Ink
| Token | Hex | Use |
|---|---|---|
| `--mdb-ink-900` | `#1A1A1A` | Body text on cream |
| `--mdb-ink-700` | `#2D2D2D` | Form labels |
| `--mdb-ink-500` | `#6B6B6B` | Secondary text |
| `--mdb-ink-300` | `#A8A8A8` | Placeholder |

**Rules**
- Never put pure black (`#000`) anywhere. Use `--mdb-ink-900`.
- Never put pure white on the brand. Use `--mdb-cream-100`.
- No gradients except the radial cutout that makes the signature shape.

---

## 3. Typography

Three families, no exceptions.

| Family | Token | Role |
|---|---|---|
| **Fraunces** (serif) | `--font-display` | Emotional headlines, hero numbers |
| **Inter** (sans) | `--font-body` | All UI, body, labels, buttons |
| **JetBrains Mono** | `--font-mono` | Captions, data labels, kickers |

### Scale

| Style | Family / weight | Size · LH · Tracking | Use |
|---|---|---|---|
| Display XL | Fraunces 600 | 72 · 72 · −3% | Hero |
| Display LG | Fraunces 600 | 56 · 58 · −2% | Section openers |
| Display MD | Fraunces 600 | 40 · 44 · −2% | Card headlines |
| Heading LG | Inter 700 | 28 · 34 · −1% | Page titles |
| Heading MD | Inter 600 | 20 · 26 | Card titles |
| Body LG | Inter 400 | 18 · 28 | Lede paragraphs |
| Body | Inter 400 | 15 · 24 | Default text |
| Caption | JetBrains 500 | 11 · 16 · +12% UPPER | Kickers, data |

**Italics in Fraunces are part of the brand voice** — use them on one word in a headline to soften it (`Money, made *human*`).

---

## 4. Spacing

Strict **8pt grid**. No arbitrary values. Period.

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`

Tokens: `--s-1` through `--s-24`. If something needs a value not in this set, the design is wrong, not the scale.

---

## 5. Radii

| Token | Value | Use |
|---|---|---|
| `--r-sm` | 8px | Chips, small controls |
| `--r-md` | 16px | Inputs, small cards |
| `--r-lg` | 28px | Standard cards |
| `--r-xl` | 40px | Hero panels |
| `--r-blob` | 64px | **Signature brand card** |
| `--r-pill` | 999px | Buttons, badges |

---

## 6. The signature shape — concave cut

The brand mark in layout form: a rounded square with **one corner curved inward**, revealing the surface behind it.

### Rules
1. **One cut per card.** Never two, never on opposite corners.
2. **Cut radius** = 25–50% of the card's shortest side.
3. **What the cut reveals** is the surface behind the card — never a third color, never an image, never a pattern.
4. **Cuts frame content** — use them to hold a stat chip, a small image, or simply breathing room.
5. The cut is always on a corner adjacent to the densest content (usually top-right).

### Why
It makes every surface feel like a tile pulled from a larger pattern — quietly suggesting "there's more behind this." It also makes the brand instantly recognizable in any feed without a logo.

### Anti-patterns
- ❌ Adding the cut to buttons, inputs, or small chips
- ❌ Using it as a decorative "logo cluster"
- ❌ Cutting from a card that has no neighboring surface (it looks broken)

---

## 7. Components

### Buttons
All pills (`--r-pill`). Three variants. Min height **44px**.

| Variant | Background | Text | Use |
|---|---|---|---|
| Primary | `--mdb-green-700` | `--mdb-cream-100` | The one main action |
| Secondary | `--mdb-cream-100` + green border | `--mdb-green-900` | Alternate actions |
| Ghost | transparent | `--mdb-green-700` | Tertiary / dismiss |

**All five states required**: default, hover, active, disabled, `:focus-visible`. Focus ring is `3px solid --mdb-green-300` with `2px` offset.

### Form inputs
- Background `--mdb-white`, border `1.5px --mdb-cream-400`, radius `--r-md`.
- Focus: border becomes `--mdb-green-700` + `4px` overlay glow.
- Min height **44px**. Labels above, hints below.

### Badges
Pill, mono caption type, three variants: `solid` (green), `tint` (green-100), `outline`.

---

## 8. Imagery

- Real people, mid-laugh or candid — never posed handshakes.
- Daylight, warm white balance. Never blue-tinted office light.
- Faces fill 40–60% of the frame on hero cards.
- Skin tones span the full spectrum; cast intentionally.
- A green wash overlay (`--mdb-green-700` @ 25% multiply) is acceptable to unify a campaign.

---

## 9. Motion

| Token | Value | Use |
|---|---|---|
| `--t-fast` | 120ms | Press, micro-feedback |
| `--t-base` | 200ms | Hover, focus |
| `--t-slow` | 320ms | Page transitions, card reveals |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default ease |

Hover lifts use `translateY(-1px)` + shadow swap. Never opacity dimming.

---

## 10. Accessibility

- Contrast: every text/background pair must clear **WCAG AA** (4.5:1 body, 3:1 large).
- `--mdb-green-700` on `--mdb-cream-100` = **8.1:1** ✓
- `--mdb-ink-900` on `--mdb-cream-200` = **15.4:1** ✓
- Focus rings are required and visible on **every** interactive element.
- Touch targets ≥ 44×44px.
- Verify all layouts at **320px** width.

---

## 11. Anti-patterns

- ❌ Hardcoded hex anywhere — always use tokens
- ❌ Pure black or pure white surfaces
- ❌ Two concave cuts on one card
- ❌ Macro/branded colors used outside their domain
- ❌ Shadows + glow stacked on the same element
- ❌ `opacity: 0.5` as a hover state
- ❌ Inter italics — italics belong to Fraunces only
- ❌ Any radius not from the scale

---

## 12. File layout

```
design-system/
├── my-digital-bank.html   ← visual showcase, copy tokens from :root
└── my-digital-bank.md     ← this document
```

The HTML file is the **source of truth for tokens** — copy the `:root` block into your app's CSS to adopt the system.

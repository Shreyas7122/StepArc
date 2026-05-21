// ── Mifflin-St Jeor BMR ───────────────────────────────────────────────────────
export function calcBMR(gender, weightKg, heightCm, age) {
  if (!weightKg || !heightCm || !age) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'female' ? base - 161 : base + 5);
}

// ── Physical Activity Level (PAL) multipliers → TDEE ─────────────────────────
// Standard Harris-Benedict / WHO activity factors
export const ACTIVITY_LEVELS = {
  sedentary:    { label: 'Sedentary',       sub: 'Desk job, little/no exercise',    pal: 1.2  },
  light:        { label: 'Lightly Active',  sub: '1–3 days/week exercise',          pal: 1.375 },
  moderate:     { label: 'Moderately Active',sub: '3–5 days/week exercise',         pal: 1.55 },
  very_active:  { label: 'Very Active',     sub: '6–7 days/week hard training',     pal: 1.725 },
  extra_active: { label: 'Extra Active',    sub: 'Twice/day or physical job + gym', pal: 1.9  },
};

// ── Goal offsets from TDEE ────────────────────────────────────────────────────
export const GOAL_OFFSETS = {
  fat_loss_aggressive: -500,
  fat_loss:            -300,
  fat_loss_mild:       -200,
  maintenance:           0,
  bulk_lean:          +200,
  bulk:               +300,
  bulk_aggressive:    +500,
};

export const GOAL_META = {
  fat_loss_aggressive: { label: 'Aggressive Cut', sub: '-500 kcal', color: '#ef4444' },
  fat_loss:            { label: 'Standard Cut',   sub: '-300 kcal', color: '#f97316' },
  fat_loss_mild:       { label: 'Mild Cut',       sub: '-200 kcal', color: '#eab308' },
  maintenance:         { label: 'Maintain',       sub: '±0 kcal',   color: '#22c55e' },
  bulk_lean:           { label: 'Lean Bulk',      sub: '+200 kcal', color: '#38bdf8' },
  bulk:                { label: 'Standard Bulk',  sub: '+300 kcal', color: '#818cf8' },
  bulk_aggressive:     { label: 'Aggressive Bulk',sub: '+500 kcal', color: 'var(--gold-500)' },
};

// bmr × PAL = TDEE, then apply goal offset
export function calcGoalCalories(bmr, goalType, activityLevel = 'moderate') {
  if (!bmr) return 0;
  const pal  = ACTIVITY_LEVELS[activityLevel]?.pal ?? 1.55;
  const tdee = Math.round(bmr * pal);
  return tdee + (GOAL_OFFSETS[goalType] ?? 0);
}

// ── Macro targets from goal calories + body weight ────────────────────────────
// Protein: 2.2g/kg (evidence-based standard for recomposition/performance)
// Fat:     1.0g/kg (minimum for hormone health; adequate for all goals)
// Carbs:   remainder after protein (4 kcal/g) and fat (9 kcal/g) are accounted for
export function calcMacros(goalCalories, weightKg) {
  const protein = Math.round(2.2 * weightKg);
  const fat     = Math.round(1.0 * weightKg);
  const carbs   = Math.max(0, Math.round((goalCalories - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
}

// ── Adjusted activity burn (×0.8 realism factor) ─────────────────────────────
export function calcAdjustedBurn(rawCalOut) {
  return Math.round(rawCalOut * 0.8);
}

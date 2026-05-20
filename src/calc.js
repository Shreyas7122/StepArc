// ── Mifflin-St Jeor BMR ───────────────────────────────────────────────────────
export function calcBMR(gender, weightKg, heightCm, age) {
  if (!weightKg || !heightCm || !age) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'female' ? base - 161 : base + 5);
}

// ── Goal offsets from BMR ─────────────────────────────────────────────────────
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

export function calcGoalCalories(bmr, goalType) {
  if (!bmr) return 0;
  return bmr + (GOAL_OFFSETS[goalType] ?? 0);
}

// ── Macro targets from goal calories + body weight ────────────────────────────
export function calcMacros(goalCalories, weightKg) {
  const protein = Math.round(2 * weightKg);
  const fat     = Math.round(0.8 * weightKg);
  const carbs   = Math.max(0, Math.round((goalCalories - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
}

// ── Adjusted activity burn (×0.8 realism factor) ─────────────────────────────
export function calcAdjustedBurn(rawCalOut) {
  return Math.round(rawCalOut * 0.8);
}

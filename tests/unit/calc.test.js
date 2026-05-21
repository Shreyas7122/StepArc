import { describe, it, expect } from 'vitest';
import {
  calcBMR,
  calcGoalCalories,
  calcMacros,
  calcAdjustedBurn,
  GOAL_OFFSETS,
} from '../../src/calc.js';

// ── calcBMR ────────────────────────────────────────────────────────────────────
describe('calcBMR', () => {
  // Mifflin-St Jeor: base = 10W + 6.25H - 5A; male +5, female -161
  it('calculates male BMR correctly', () => {
    // base = 10*75 + 6.25*175 - 5*23 = 750 + 1093.75 - 115 = 1728.75 → +5 = 1733.75 → 1734
    expect(calcBMR('male', 75, 175, 23)).toBe(1734);
  });

  it('calculates female BMR correctly', () => {
    // base = 10*60 + 6.25*165 - 5*30 = 600 + 1031.25 - 150 = 1481.25 → -161 = 1320.25 → 1320
    expect(calcBMR('female', 60, 165, 30)).toBe(1320);
  });

  it('returns 0 when weight is 0 or missing', () => {
    expect(calcBMR('male', 0, 175, 23)).toBe(0);
    expect(calcBMR('male', null, 175, 23)).toBe(0);
  });

  it('returns 0 when height is 0 or missing', () => {
    expect(calcBMR('male', 75, 0, 23)).toBe(0);
    expect(calcBMR('male', 75, undefined, 23)).toBe(0);
  });

  it('returns 0 when age is 0 or missing', () => {
    expect(calcBMR('male', 75, 175, 0)).toBe(0);
    expect(calcBMR('male', 75, 175, null)).toBe(0);
  });

  it('defaults to male formula for an unrecognised gender string', () => {
    const maleBMR = calcBMR('male', 70, 170, 25);
    expect(calcBMR('nonbinary', 70, 170, 25)).toBe(maleBMR);
  });

  it('produces a higher BMR for a heavier person (same height/age/gender)', () => {
    expect(calcBMR('male', 90, 175, 23)).toBeGreaterThan(calcBMR('male', 70, 175, 23));
  });

  it('produces a lower BMR as age increases (same weight/height/gender)', () => {
    expect(calcBMR('male', 75, 175, 40)).toBeLessThan(calcBMR('male', 75, 175, 20));
  });
});

// ── calcGoalCalories ───────────────────────────────────────────────────────────
describe('calcGoalCalories', () => {
  const BMR = 1800;

  it('maintenance returns BMR unchanged', () => {
    expect(calcGoalCalories(BMR, 'maintenance')).toBe(1800);
  });

  it('fat_loss subtracts 300 kcal', () => {
    expect(calcGoalCalories(BMR, 'fat_loss')).toBe(1500);
  });

  it('fat_loss_aggressive subtracts 500 kcal', () => {
    expect(calcGoalCalories(BMR, 'fat_loss_aggressive')).toBe(1300);
  });

  it('fat_loss_mild subtracts 200 kcal', () => {
    expect(calcGoalCalories(BMR, 'fat_loss_mild')).toBe(1600);
  });

  it('bulk adds 300 kcal', () => {
    expect(calcGoalCalories(BMR, 'bulk')).toBe(2100);
  });

  it('bulk_lean adds 200 kcal', () => {
    expect(calcGoalCalories(BMR, 'bulk_lean')).toBe(2000);
  });

  it('bulk_aggressive adds 500 kcal', () => {
    expect(calcGoalCalories(BMR, 'bulk_aggressive')).toBe(2300);
  });

  it('unknown goal type returns BMR unchanged (??0 fallback)', () => {
    expect(calcGoalCalories(BMR, 'invalid_goal')).toBe(BMR);
  });

  it('returns 0 when BMR is 0 (falsy guard)', () => {
    expect(calcGoalCalories(0, 'maintenance')).toBe(0);
    expect(calcGoalCalories(null, 'bulk')).toBe(0);
  });

  it('all GOAL_OFFSETS keys produce a corresponding value', () => {
    for (const key of Object.keys(GOAL_OFFSETS)) {
      const result = calcGoalCalories(BMR, key);
      expect(result).toBe(BMR + GOAL_OFFSETS[key]);
    }
  });
});

// ── calcMacros ────────────────────────────────────────────────────────────────
describe('calcMacros', () => {
  it('protein = 2g per kg body weight (rounded)', () => {
    const { protein } = calcMacros(2500, 80);
    expect(protein).toBe(160);
  });

  it('fat = 0.8g per kg body weight (rounded)', () => {
    const { fat } = calcMacros(2500, 80);
    expect(fat).toBe(64);
  });

  it('carbs fill remaining calories after protein and fat', () => {
    // remaining = 2500 - (160*4) - (64*9) = 2500 - 640 - 576 = 1284 → /4 = 321
    const { carbs } = calcMacros(2500, 80);
    expect(carbs).toBe(321);
  });

  it('carbs are never negative even when calories are too low', () => {
    // Very low calorie budget — carbs would underflow without the Math.max(0, ...)
    const { carbs } = calcMacros(500, 100);
    expect(carbs).toBeGreaterThanOrEqual(0);
  });

  it('all three macros are integers', () => {
    const { protein, fat, carbs } = calcMacros(2870, 75.5);
    expect(Number.isInteger(protein)).toBe(true);
    expect(Number.isInteger(fat)).toBe(true);
    expect(Number.isInteger(carbs)).toBe(true);
  });

  it('higher body weight yields more protein and fat targets', () => {
    const light = calcMacros(2500, 60);
    const heavy = calcMacros(2500, 90);
    expect(heavy.protein).toBeGreaterThan(light.protein);
    expect(heavy.fat).toBeGreaterThan(light.fat);
  });
});

// ── calcAdjustedBurn ──────────────────────────────────────────────────────────
describe('calcAdjustedBurn', () => {
  it('applies the 0.8× realism factor', () => {
    expect(calcAdjustedBurn(1000)).toBe(800);
    expect(calcAdjustedBurn(500)).toBe(400);
    expect(calcAdjustedBurn(260)).toBe(208);
  });

  it('rounds the result to an integer', () => {
    expect(Number.isInteger(calcAdjustedBurn(333))).toBe(true);
    expect(Number.isInteger(calcAdjustedBurn(777))).toBe(true);
  });

  it('returns 0 for 0 input', () => {
    expect(calcAdjustedBurn(0)).toBe(0);
  });

  it('the adjusted burn is always ≤ raw burn', () => {
    expect(calcAdjustedBurn(1500)).toBeLessThanOrEqual(1500);
  });
});

import { describe, it, expect } from 'vitest';
import { computeTotals } from '../../src/utils.js';
import { foodDatabase, workoutDatabase, STEP_CALORIES_MULTIPLIER } from '../../src/data.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────
// Pull known items directly from the live database so tests stay in sync
// when data.js is updated.
const banana   = foodDatabase.find(f => f.name === 'Banana (Raw)');        // id 1
const oats     = foodDatabase.find(f => f.name === 'Oats (Dry/Raw)');      // id 3
const paneer   = foodDatabase.find(f => f.name === 'Low Fat Paneer');      // id 10
const deadlift = workoutDatabase.find(w => w.name === 'Deadlift');         // id 101
const squat    = workoutDatabase.find(w => w.name === 'Smith Machine Squats'); // id 120

// ── Helpers ───────────────────────────────────────────────────────────────────
const dbLog = (food, amount) => ({ id: Date.now(), foodId: food.id, amount, name: food.name });
const aiLog = (name, macros) => ({ id: Date.now(), name, aiMacros: macros });
const wLog  = (workout, sets) => ({ id: Date.now(), workoutId: workout.id, sets });
const cLog  = (name, durationMins, aiCalories) => ({ id: Date.now(), name, durationMins, aiCalories });

// ── Empty state ───────────────────────────────────────────────────────────────
describe('computeTotals — empty state', () => {
  it('returns all zeros when everything is empty', () => {
    const t = computeTotals([], [], [], 0);
    expect(t).toEqual({ p: 0, c: 0, f: 0, calIn: 0, calOut: 0, fibre: 0 });
  });

  it('handles null/undefined log arrays gracefully', () => {
    const t = computeTotals(null, null, null, 0);
    expect(t.calIn).toBe(0);
    expect(t.calOut).toBe(0);
  });
});

// ── Food logs — database items ─────────────────────────────────────────────
describe('computeTotals — database food logs', () => {
  it('calculates macros scaled to amount (100g = 1× multiplier)', () => {
    const t = computeTotals([dbLog(banana, 100)], [], [], 0);
    expect(t.p).toBe(Math.round(banana.protein));
    expect(t.c).toBe(Math.round(banana.carbs));
    expect(t.f).toBe(Math.round(banana.fats));
    expect(t.calIn).toBe(Math.round(banana.calories));
    expect(t.fibre).toBe(Math.round(banana.fibre * 10) / 10);
  });

  it('scales correctly for 50g (0.5× multiplier)', () => {
    const t = computeTotals([dbLog(oats, 50)], [], [], 0);
    expect(t.calIn).toBe(Math.round(oats.calories * 0.5));
    expect(t.p).toBe(Math.round(oats.protein * 0.5));
  });

  it('accumulates macros across multiple food logs', () => {
    const logs = [dbLog(banana, 100), dbLog(oats, 60)];
    const t = computeTotals(logs, [], [], 0);
    const expectedCal = Math.round(banana.calories + oats.calories * 0.6);
    expect(t.calIn).toBe(expectedCal);
  });

  it('silently skips logs with unknown foodId', () => {
    const unknown = { id: 999, foodId: 9999, amount: 100, name: 'Ghost Food' };
    const t = computeTotals([unknown], [], [], 0);
    expect(t.calIn).toBe(0);
    expect(t.p).toBe(0);
  });

  it('accumulates fibre from database foods', () => {
    const t = computeTotals([dbLog(oats, 100)], [], [], 0);
    expect(t.fibre).toBe(Math.round(oats.fibre * 10) / 10);
  });
});

// ── Food logs — AI macro entries ──────────────────────────────────────────────
describe('computeTotals — AI macro food logs', () => {
  it('uses aiMacros directly without looking up foodDatabase', () => {
    const macros = { calories: 450, protein: 40, carbs: 30, fats: 10, fibre: 5 };
    const t = computeTotals([aiLog('Chicken Bowl', macros)], [], [], 0);
    expect(t.calIn).toBe(450);
    expect(t.p).toBe(40);
    expect(t.c).toBe(30);
    expect(t.f).toBe(10);
  });

  it('accumulates fibre from aiMacros', () => {
    const macros = { calories: 350, protein: 12, carbs: 60, fats: 8, fibre: 8 };
    const t = computeTotals([aiLog('Oatmeal', macros)], [], [], 0);
    expect(t.fibre).toBe(8);
  });

  it('handles missing fibre field on old aiMacros entries (||0 fallback)', () => {
    const legacyMacros = { calories: 200, protein: 20, carbs: 10, fats: 5 }; // no fibre
    expect(() => computeTotals([aiLog('Old Food', legacyMacros)], [], [], 0)).not.toThrow();
    const t = computeTotals([aiLog('Old Food', legacyMacros)], [], [], 0);
    expect(t.fibre).toBe(0);
  });

  it('sums fibre across mixed DB and AI logs', () => {
    const dbEntry = dbLog(paneer, 100);     // fibre = 0
    const aiEntry = aiLog('Rajma', { calories: 200, protein: 8, carbs: 28, fats: 6, fibre: 7 });
    const t = computeTotals([dbEntry, aiEntry], [], [], 0);
    expect(t.fibre).toBe(7);
  });
});

// ── Workout logs ──────────────────────────────────────────────────────────────
describe('computeTotals — workout logs', () => {
  it('adds calPerSet × sets to calOut', () => {
    const t = computeTotals([], [wLog(deadlift, 3)], [], 0);
    expect(t.calOut).toBe(Math.round(deadlift.calPerSet * 3));
  });

  it('accumulates calOut across multiple workout logs', () => {
    const t = computeTotals([], [wLog(deadlift, 3), wLog(squat, 4)], [], 0);
    const expected = Math.round(deadlift.calPerSet * 3 + squat.calPerSet * 4);
    expect(t.calOut).toBe(expected);
  });

  it('silently skips logs with unknown workoutId', () => {
    const t = computeTotals([], [{ id: 1, workoutId: 9999, sets: 3 }], [], 0);
    expect(t.calOut).toBe(0);
  });
});

// ── Cardio logs ────────────────────────────────────────────────────────────────
describe('computeTotals — cardio logs', () => {
  it('adds aiCalories to calOut', () => {
    const t = computeTotals([], [], [cLog('Run', 30, 312)], 0);
    expect(t.calOut).toBe(312);
  });

  it('handles missing aiCalories (||0 fallback)', () => {
    const t = computeTotals([], [], [{ id: 1, name: 'Walk', durationMins: 30 }], 0);
    expect(t.calOut).toBe(0);
  });
});

// ── Steps ──────────────────────────────────────────────────────────────────────
describe('computeTotals — steps', () => {
  it('calculates step burn with the STEP_CALORIES_MULTIPLIER constant', () => {
    const t = computeTotals([], [], [], 10000);
    expect(t.calOut).toBe(Math.round(10000 * STEP_CALORIES_MULTIPLIER));
  });

  it('0 steps contributes 0 to calOut', () => {
    const t = computeTotals([], [], [], 0);
    expect(t.calOut).toBe(0);
  });

  it('null steps defaults to 0 (||0 guard)', () => {
    const t = computeTotals([], [], [], null);
    expect(t.calOut).toBe(0);
  });
});

// ── Combined totals ────────────────────────────────────────────────────────────
describe('computeTotals — combined', () => {
  it('calIn and calOut are computed independently', () => {
    const food    = aiLog('Meal', { calories: 500, protein: 40, carbs: 50, fats: 10, fibre: 5 });
    const workout = wLog(deadlift, 3);
    const t       = computeTotals([food], [workout], [], 5000);

    expect(t.calIn).toBe(500);
    const expectedOut = Math.round(deadlift.calPerSet * 3 + 5000 * STEP_CALORIES_MULTIPLIER);
    expect(t.calOut).toBe(expectedOut);
  });

  it('returns rounded integers for p, c, f, calIn, calOut', () => {
    const t = computeTotals([dbLog(banana, 75)], [wLog(deadlift, 2)], [], 8000);
    expect(Number.isInteger(t.p)).toBe(true);
    expect(Number.isInteger(t.c)).toBe(true);
    expect(Number.isInteger(t.f)).toBe(true);
    expect(Number.isInteger(t.calIn)).toBe(true);
    expect(Number.isInteger(t.calOut)).toBe(true);
  });

  it('fibre is rounded to one decimal place', () => {
    const t = computeTotals([dbLog(oats, 100)], [], [], 0);
    const decimals = (t.fibre.toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(1);
  });
});

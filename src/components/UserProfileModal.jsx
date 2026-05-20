import { User, X, Save, Brain, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import SearchSelect from './SearchSelect';
import { foodDatabase, workoutDatabase, fixedWorkouts } from '../data';
import { getApiBase } from '../utils';
import { calcBMR, calcGoalCalories, calcMacros, GOAL_META } from '../calc';

// Fixed 5 meal categories — order and names are canonical
const FIXED_CATEGORIES = [
  { name: 'Pre-Workout',  hint: 'Good carbs & micronutrients — fuel the session' },
  { name: 'Post-Workout', hint: 'Protein, fibre & antioxidants — replenish what was lost' },
  { name: 'Lunch',        hint: 'Carbs refill, muscle repair & dahi' },
  { name: 'Snacks',       hint: 'Fruit + protein — light and satisfying' },
  { name: 'Dinner',       hint: 'Low calorie, potato for slow carbs & sleep quality' },
];

// Always return exactly 5 meals aligned to FIXED_CATEGORIES
const normalizeMeals = (saved) =>
  FIXED_CATEGORIES.map((cat, i) => {
    const s = saved?.[i];
    return {
      id: i + 1,
      name: cat.name,
      hint: cat.hint,
      items: (s?.items ?? []).map((it, j) => ({
        ...it,
        tempId: it.tempId ?? (Date.now() + i * 1000 + j),
      })),
    };
  });

const seedDays = () =>
  fixedWorkouts.map((w, i) => ({
    id: Date.now() + i,
    name: w.name,
    items: w.items.map((it, j) => ({ tempId: Date.now() + i * 1000 + j, exerciseId: it.exerciseId, sets: it.sets })),
  }));

const apiBase = getApiBase();

// ── Food / workout SearchSelect item lists ────────────────────────────────────
const foodItems = foodDatabase.map(f => ({
  id: f.id,
  label: f.name,
  sub: `${f.calories} kcal/100g · P ${f.protein}g  C ${f.carbs}g  F ${f.fats}g  Fb ${f.fibre ?? 0}g`,
}));

const workoutItems = workoutDatabase.map(w => ({
  id: w.id,
  label: w.name,
  sub: `${w.calPerSet} kcal/set`,
}));

// ── Shared style constants ────────────────────────────────────────────────────
const sectionLabel = {
  fontFamily: 'var(--font-heading)',
  fontSize: '0.6rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.22em',
  color: 'var(--gold-500)',
  marginBottom: '10px',
  marginTop: '18px',
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(10,6,18,0.7)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 'var(--r-md)',
  color: 'var(--white)',
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
};


const smallBtn = (variant = 'ghost') => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  padding: '6px 10px',
  borderRadius: 'var(--r-md)',
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  cursor: 'pointer',
  width: 'auto',
  border: variant === 'ghost' ? '1px solid rgba(255,255,255,0.12)' : 'none',
  background: variant === 'gold'
    ? 'var(--gradient-cta)'
    : variant === 'secondary'
      ? 'rgba(255,255,255,0.07)'
      : 'transparent',
  color: variant === 'gold' ? 'var(--purple-900)' : 'var(--gray-300)',
  boxShadow: variant === 'gold' ? 'var(--glow-gold)' : 'none',
});

// ── Reusable numeric Field ────────────────────────────────────────────────────
const Field = ({ label, value, onChange, min, max, step, unit }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gray-300)' }}>
        {label}
      </span>
      {unit && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray-300)' }}>{unit}</span>
      )}
    </div>
    <input
      type="number"
      min={min}
      max={max}
      step={step || 1}
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={label}
      style={inputStyle}
      onFocus={e => (e.target.style.borderColor = 'var(--gold-500)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    />
  </div>
);

// ── Compact icon-only delete button ──────────────────────────────────────────
const iconDeleteBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  padding: 0,
  background: 'transparent',
  border: 'none',
  color: 'rgba(255,255,255,0.25)',
  cursor: 'pointer',
  flexShrink: 0,
  borderRadius: '4px',
};

// ── Macro proportion bar ──────────────────────────────────────────────────────
const MacroBar = ({ protein = 0, carbs = 0, fat = 0 }) => {
  const p = protein * 4, c = carbs * 4, f = fat * 9;
  const t = p + c + f || 1;
  return (
    <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 8, gap: 1 }}>
      <div style={{ width: `${p / t * 100}%`, background: '#ec4899' }} />
      <div style={{ width: `${c / t * 100}%`, background: '#3b82f6' }} />
      <div style={{ width: `${f / t * 100}%`, background: '#eab308' }} />
    </div>
  );
};

// ── Macro chips ────────────────────────────────────────────────────────────────
const MacroChips = ({ protein = 0, carbs = 0, fat = 0 }) => (
  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
    {[
      ['P', protein, '#ec4899', 'rgba(236,72,153,0.13)'],
      ['C', carbs,   '#3b82f6', 'rgba(59,130,246,0.13)'],
      ['F', fat,     '#eab308', 'rgba(234,179,8,0.13)'],
    ].map(([k, v, color, bg]) => (
      <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: bg, color }}>
        {k} {Number(v).toFixed(0)}g
      </span>
    ))}
  </div>
);

// ── Tab 2: Diet Plan ──────────────────────────────────────────────────────────
const DietPlanTab = ({ meals, setMeals, formState }) => {
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiError, setAiError]           = useState('');
  const [selected, setSelected]         = useState(new Set());
  const [addFood, setAddFood]           = useState({});
  const [expanded, setExpanded]         = useState(() => new Set(meals.map(m => m.id)));
  const [addOpen, setAddOpen]           = useState({});

  const planTotals = meals.reduce((acc, meal) => {
    meal.items.forEach(it => {
      const f = foodDatabase.find(fd => fd.id === it.foodId);
      if (!f) return;
      const r = (Number(it.amount) || 0) / 100;
      acc.cal += f.calories * r; acc.protein += f.protein * r;
      acc.carbs += f.carbs * r;  acc.fat += f.fats * r;
    });
    return acc;
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });

  const goal    = formState.calorieGoal || 2000;
  const calPct  = Math.min(planTotals.cal / goal * 100, 100);
  const isOver  = planTotals.cal > goal + 50;

  const handleGenerate = async () => {
    setAiLoading(true); setAiError('');
    try {
      const { calorieGoal, proteinGoal, carbsGoal, fatsGoal, age, heightCm, weightKg } = formState;
      const res = await fetch(`${apiBase}/recommend-diet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(age) || 20, weight_kg: parseFloat(weightKg) || 78,
          height_cm: parseFloat(heightCm) || 175, calorie_goal: parseInt(calorieGoal) || 2870,
          protein_goal: parseInt(proteinGoal) || 200, carbs_goal: parseInt(carbsGoal) || 300,
          fats_goal: parseInt(fatsGoal) || 80,
        }),
      });
      if (!res.ok) throw new Error('server');
      const data = await res.json();
      if (!data.meals?.length) throw new Error('empty');
      setAiSuggestion(data);
      setSelected(new Set(data.meals.map((_, i) => i)));
    } catch {
      setAiError('Generation failed. Check your connection and try again.');
    } finally { setAiLoading(false); }
  };

  const toggleSelect = (i) =>
    setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const handleApply = () => {
    const applied = FIXED_CATEGORIES.map((cat, i) => {
      const aiMeal = aiSuggestion.meals[i];
      return {
        id: i + 1, name: cat.name, hint: cat.hint,
        items: (aiMeal?.items ?? [])
          .filter(it => foodDatabase.find(f => f.id === it.foodId))
          .map((it, j) => ({ tempId: Date.now() + i * 1000 + j, foodId: it.foodId, amount: it.amount })),
      };
    });
    setMeals(applied);
    setExpanded(new Set(applied.map(m => m.id)));
    setAiSuggestion(null);
  };

  const getAF         = (mealId) => addFood[mealId] || { foodId: foodDatabase[0].id, amount: '' };
  const setAFField    = (mealId, field, val) => setAddFood(prev => ({ ...prev, [mealId]: { ...getAF(mealId), [field]: val } }));
  const addFoodToMeal = (mealId) => {
    const { foodId, amount } = getAF(mealId);
    if (!amount || Number(amount) <= 0) return;
    setMeals(prev => prev.map(m => m.id === mealId
      ? { ...m, items: [...m.items, { tempId: Date.now(), foodId: Number(foodId), amount: Number(amount) }] } : m));
    setAFField(mealId, 'amount', '');
    setAddOpen(prev => ({ ...prev, [mealId]: false }));
  };
  const removeFoodItem        = (mealId, tempId) =>
    setMeals(prev => prev.map(m => m.id === mealId ? { ...m, items: m.items.filter(it => it.tempId !== tempId) } : m));
  const updateFoodItemAmount  = (mealId, tempId, val) =>
    setMeals(prev => prev.map(m => m.id === mealId
      ? { ...m, items: m.items.map(it => it.tempId === tempId ? { ...it, amount: val === '' ? '' : Number(val) } : it) } : m));
  const toggleExpand          = (id) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── AI suggestion panel ────────────────────────────────────────────────────
  if (aiSuggestion) {
    const totalCal = aiSuggestion.meals
      .filter((_, i) => selected.has(i))
      .flatMap(m => m.items)
      .reduce((s, it) => {
        const f = foodDatabase.find(fd => fd.id === it.foodId);
        return s + (f ? f.calories * it.amount / 100 : 0);
      }, 0);

    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ ...sectionLabel, marginTop: 0, marginBottom: 0 }}>AI Suggested Plan</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-400)', background: 'rgba(255,184,0,0.1)', padding: '3px 8px', borderRadius: 4 }}>
            ~{Math.round(totalCal).toLocaleString()} kcal
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--gray-500)', marginBottom: 10, lineHeight: 1.5 }}>
          Tap meals to include. Apply to replace your current plan.
        </p>

        {aiSuggestion.meals.map((meal, i) => {
          const cat = FIXED_CATEGORIES[i] ?? { name: meal.name, hint: '' };
          const on  = selected.has(i);
          const mt  = meal.items.reduce((acc, it) => {
            const f = foodDatabase.find(fd => fd.id === it.foodId);
            if (!f) return acc;
            const r = it.amount / 100;
            return { cal: acc.cal + f.calories * r, p: acc.p + f.protein * r, c: acc.c + f.carbs * r, f: acc.f + f.fats * r };
          }, { cal: 0, p: 0, c: 0, f: 0 });

          return (
            <div key={i} onClick={() => toggleSelect(i)} style={{
              background: on ? 'rgba(255,184,0,0.05)' : 'rgba(10,6,18,0.4)',
              border: on ? '1px solid rgba(255,184,0,0.35)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--r-md)', padding: 12, marginBottom: 8,
              cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none', opacity: on ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginTop: 2,
                  border: on ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  background: on ? 'var(--gradient-cta)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && <span style={{ fontSize: 10, color: 'var(--purple-900)', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: on ? 'var(--gold-400)' : 'var(--gray-400)' }}>
                      {cat.name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: on ? 'var(--gold-400)' : 'var(--gray-500)' }}>
                      {Math.round(mt.cal)} kcal
                    </span>
                  </div>
                  {cat.hint && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--gray-500)', marginBottom: 6 }}>
                      {cat.hint}
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {meal.items.map((it, j) => {
                      const food = foodDatabase.find(f => f.id === it.foodId);
                      return (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-300)' }}>{food?.name ?? `Food #${it.foodId}`}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-500)' }}>{it.amount}g</span>
                        </div>
                      );
                    })}
                  </div>
                  {(mt.p > 0 || mt.c > 0 || mt.f > 0) && <MacroBar protein={mt.p} carbs={mt.c} fat={mt.f} />}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: 8, marginTop: 8, position: 'sticky', bottom: 0, background: 'var(--purple-900)', paddingTop: 8 }}>
          <button type="button" onClick={handleApply} disabled={selected.size === 0}
            style={{ ...smallBtn('gold'), flex: 2, padding: '11px', justifyContent: 'center', opacity: selected.size === 0 ? 0.4 : 1 }}>
            Apply {selected.size} Meal{selected.size !== 1 ? 's' : ''}
          </button>
          <button type="button" onClick={() => setAiSuggestion(null)}
            style={{ ...smallBtn('ghost'), flex: 1, padding: '11px', justifyContent: 'center' }}>
            Discard
          </button>
        </div>
      </div>
    );
  }

  // ── Normal edit view ───────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 10 }}>
        <button type="button" onClick={handleGenerate} disabled={aiLoading} style={{ ...smallBtn('gold'), gap: 6 }}>
          <Brain size={14} /> {aiLoading ? 'Generating…' : 'AI Generate Plan'}
        </button>
        {aiLoading && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-400)' }}>Asking Gemini…</span>}
        {aiError   && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#ef4444' }}>{aiError}</span>}
      </div>

      {/* Daily summary strip */}
      <div style={{
        background: 'rgba(10,6,18,0.55)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--r-md)', padding: '11px 14px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gray-500)' }}>
            Daily Total
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: isOver ? '#ef4444' : 'var(--gold-400)' }}>
            {Math.round(planTotals.cal).toLocaleString()}
            <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}> / {goal.toLocaleString()} kcal</span>
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${calPct}%`, background: isOver ? '#ef4444' : 'var(--gradient-cta)', borderRadius: 2, transition: 'width 0.4s' }} />
        </div>
        <MacroChips protein={planTotals.protein} carbs={planTotals.carbs} fat={planTotals.fat} />
      </div>

      {/* Meal cards */}
      {meals.map(meal => {
        const af   = getAF(meal.id);
        const isEx = expanded.has(meal.id);
        const isAO = addOpen[meal.id];
        const mt   = meal.items.reduce((acc, it) => {
          const f = foodDatabase.find(fd => fd.id === it.foodId);
          if (!f) return acc;
          const r = (Number(it.amount) || 0) / 100;
          return { cal: acc.cal + f.calories * r, p: acc.p + f.protein * r, c: acc.c + f.carbs * r, f: acc.f + f.fats * r };
        }, { cal: 0, p: 0, c: 0, f: 0 });

        return (
          <div key={meal.id} style={{ background: 'rgba(10,6,18,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--r-md)', marginBottom: 8, overflow: 'hidden' }}>
            {/* Card header — always visible, click to expand */}
            <button type="button" onClick={() => toggleExpand(meal.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gold-500)' }}>
                    {meal.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {meal.items.length > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-400)' }}>
                        {Math.round(mt.cal)} kcal
                      </span>
                    )}
                    <ChevronDown size={14} color="var(--gray-500)" style={{ transform: isEx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </div>
                </div>
                {/* Collapsed preview */}
                {!isEx && meal.items.length > 0 && <MacroBar protein={mt.p} carbs={mt.c} fat={mt.f} />}
                {!isEx && meal.hint && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.64rem', color: 'var(--gray-600)', marginTop: 3 }}>
                    {meal.hint}
                  </div>
                )}
              </div>
            </button>

            {/* Expanded body */}
            {isEx && (
              <div style={{ padding: '0 12px 12px' }}>
                {meal.hint && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--gray-500)', marginBottom: 8, marginTop: -2 }}>
                    {meal.hint}
                  </div>
                )}

                {meal.items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '10px 0', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--gray-600)' }}>
                    No foods added yet
                  </div>
                )}

                {meal.items.map(it => {
                  const food = foodDatabase.find(f => f.id === it.foodId);
                  const cal  = food && it.amount ? Math.round(food.calories * Number(it.amount) / 100) : 0;
                  return (
                    <div key={it.tempId} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px',
                      marginBottom: 4, borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-200)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {food?.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <input
                          type="number" value={it.amount} min="1"
                          onChange={e => updateFoodItemAmount(meal.id, it.tempId, e.target.value)}
                          aria-label={`${food?.name} grams`}
                          style={{ width: 46, padding: '2px 5px', background: 'rgba(10,6,18,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', outline: 'none', textAlign: 'right' }}
                        />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--gray-500)' }}>g</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--gold-500)', minWidth: 42, textAlign: 'right', whiteSpace: 'nowrap' }}>{cal} kcal</span>
                        <button type="button" onClick={() => removeFoodItem(meal.id, it.tempId)} aria-label={`Remove ${food?.name}`}
                          style={iconDeleteBtn}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Per-meal macro summary */}
                {meal.items.length > 0 && (
                  <div style={{ margin: '8px 0 4px' }}>
                    <MacroChips protein={mt.p} carbs={mt.c} fat={mt.f} />
                    <MacroBar protein={mt.p} carbs={mt.c} fat={mt.f} />
                  </div>
                )}

                {/* Add food section */}
                <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                  {!isAO ? (
                    <button type="button" onClick={() => setAddOpen(prev => ({ ...prev, [meal.id]: true }))}
                      style={{ ...smallBtn('ghost'), gap: 5, width: '100%', justifyContent: 'center' }}>
                      <Plus size={12} /> Add Food
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <SearchSelect items={foodItems} selectedId={af.foodId} onSelect={val => setAFField(meal.id, 'foodId', val)} placeholder="Search food…" />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="number" placeholder="grams" min="1" value={af.amount}
                          onChange={e => setAFField(meal.id, 'amount', e.target.value)}
                          style={{ flex: 1, minWidth: 0, width: 0, padding: '9px 12px', background: 'rgba(10,6,18,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => (e.target.style.borderColor = 'var(--gold-500)')}
                          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                        />
                        <button type="button" onClick={() => addFoodToMeal(meal.id)} style={{ ...smallBtn('gold'), padding: '9px 16px', flexShrink: 0 }}>
                          <Plus size={13} /> Add
                        </button>
                        <button type="button" onClick={() => setAddOpen(prev => ({ ...prev, [meal.id]: false }))} style={{ ...smallBtn('ghost'), padding: '9px 10px', flexShrink: 0 }}>
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Tab 3: Training Plan ──────────────────────────────────────────────────────
const TrainingTab = ({ days, setDays, formState }) => {
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiError, setAiError]           = useState('');
  const [selected, setSelected]         = useState(new Set());
  const [addExercise, setAddExercise]   = useState({});
  const [expanded, setExpanded]         = useState(() => new Set(days.map(d => d.id)));
  const [addOpen, setAddOpen]           = useState({});

  const weekTotals = days.reduce((acc, d) => {
    acc.sets += d.items.reduce((s, it) => s + (Number(it.sets) || 0), 0);
    acc.cal  += d.items.reduce((s, it) => {
      const ex = workoutDatabase.find(w => w.id === it.exerciseId);
      return s + (ex ? ex.calPerSet * (Number(it.sets) || 0) : 0);
    }, 0);
    return acc;
  }, { sets: 0, cal: 0 });

  const handleGenerate = async () => {
    setAiLoading(true); setAiError('');
    try {
      const { calorieGoal, age, weightKg } = formState;
      const res = await fetch(`${apiBase}/recommend-workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(age) || 20,
          weight_kg: parseFloat(weightKg) || 78,
          calorie_goal: parseInt(calorieGoal) || 2870,
        }),
      });
      if (!res.ok) throw new Error('server');
      const data = await res.json();
      if (!data.days?.length) throw new Error('empty');
      setAiSuggestion(data);
      setSelected(new Set(data.days.map((_, i) => i)));
    } catch {
      setAiError('Generation failed. Check your connection and try again.');
    } finally { setAiLoading(false); }
  };

  const toggleSelect = (i) =>
    setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const handleApply = () => {
    const chosen = aiSuggestion.days
      .filter((_, i) => selected.has(i))
      .map((d, i) => ({
        id: Date.now() + i, name: d.name,
        items: d.items
          .filter(it => workoutDatabase.find(w => w.id === it.exerciseId))
          .map((it, j) => ({ tempId: Date.now() + i * 1000 + j, exerciseId: it.exerciseId, sets: it.sets })),
      }));
    setDays(chosen);
    setExpanded(new Set(chosen.map(d => d.id)));
    setAiSuggestion(null);
  };

  const addDay = () => {
    const newId = Date.now();
    setDays(prev => [...prev, { id: newId, name: '', items: [] }]);
    setExpanded(prev => { const n = new Set(prev); n.add(newId); return n; });
  };
  const deleteDay = (dayId) => {
    setDays(prev => prev.filter(d => d.id !== dayId));
    setExpanded(prev => { const n = new Set(prev); n.delete(dayId); return n; });
  };
  const updateDayName   = (dayId, name) => setDays(prev => prev.map(d => d.id === dayId ? { ...d, name } : d));
  const getAE           = (dayId) => addExercise[dayId] || { exerciseId: workoutDatabase[0].id, sets: '' };
  const setAEField      = (dayId, field, val) => setAddExercise(prev => ({ ...prev, [dayId]: { ...getAE(dayId), [field]: val } }));
  const addExToDay      = (dayId) => {
    const { exerciseId, sets } = getAE(dayId);
    if (!sets || Number(sets) <= 0) return;
    setDays(prev => prev.map(d => d.id === dayId
      ? { ...d, items: [...d.items, { tempId: Date.now(), exerciseId: Number(exerciseId), sets: Number(sets) }] } : d));
    setAEField(dayId, 'sets', '');
    setAddOpen(prev => ({ ...prev, [dayId]: false }));
  };
  const removeExItem    = (dayId, tempId) =>
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, items: d.items.filter(it => it.tempId !== tempId) } : d));
  const updateExItemSets = (dayId, tempId, val) =>
    setDays(prev => prev.map(d => d.id === dayId
      ? { ...d, items: d.items.map(it => it.tempId === tempId ? { ...it, sets: val === '' ? '' : Number(val) } : it) } : d));
  const toggleExpand    = (id) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── AI suggestion panel ────────────────────────────────────────────────────
  if (aiSuggestion) {
    const totalSets = aiSuggestion.days
      .filter((_, i) => selected.has(i))
      .flatMap(d => d.items)
      .reduce((s, it) => s + (it.sets || 0), 0);

    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ ...sectionLabel, marginTop: 0, marginBottom: 0 }}>AI Suggested Plan</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold-400)', background: 'rgba(255,184,0,0.1)', padding: '3px 8px', borderRadius: 4 }}>
            {totalSets} sets
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--gray-500)', marginBottom: 10, lineHeight: 1.5 }}>
          Tap days to include. Apply to replace your current plan.
        </p>

        {aiSuggestion.days.map((day, i) => {
          const on      = selected.has(i);
          const daySets = day.items.reduce((s, it) => s + (it.sets || 0), 0);
          const estCal  = day.items.reduce((s, it) => {
            const ex = workoutDatabase.find(w => w.id === it.exerciseId);
            return s + (ex ? ex.calPerSet * it.sets : 0);
          }, 0);

          return (
            <div key={i} onClick={() => toggleSelect(i)} style={{
              background: on ? 'rgba(255,184,0,0.05)' : 'rgba(10,6,18,0.4)',
              border: on ? '1px solid rgba(255,184,0,0.35)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--r-md)', padding: 12, marginBottom: 8,
              cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none', opacity: on ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginTop: 2,
                  border: on ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  background: on ? 'var(--gradient-cta)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && <span style={{ fontSize: 10, color: 'var(--purple-900)', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: on ? 'var(--gold-400)' : 'var(--gray-400)' }}>
                      {day.name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: on ? 'var(--gold-400)' : 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                      {daySets} sets · ~{Math.round(estCal)} kcal
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {day.items.map((it, j) => {
                      const ex = workoutDatabase.find(w => w.id === it.exerciseId);
                      return (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-300)' }}>{ex?.name ?? `Exercise #${it.exerciseId}`}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--gray-500)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: 3 }}>
                            {it.sets} sets
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: 8, marginTop: 8, position: 'sticky', bottom: 0, background: 'var(--purple-900)', paddingTop: 8 }}>
          <button type="button" onClick={handleApply} disabled={selected.size === 0}
            style={{ ...smallBtn('gold'), flex: 2, padding: '11px', justifyContent: 'center', opacity: selected.size === 0 ? 0.4 : 1 }}>
            Apply {selected.size} Day{selected.size !== 1 ? 's' : ''}
          </button>
          <button type="button" onClick={() => setAiSuggestion(null)}
            style={{ ...smallBtn('ghost'), flex: 1, padding: '11px', justifyContent: 'center' }}>
            Discard
          </button>
        </div>
      </div>
    );
  }

  // ── Normal edit view ───────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 10 }}>
        <button type="button" onClick={handleGenerate} disabled={aiLoading} style={{ ...smallBtn('gold'), gap: 6 }}>
          <Brain size={14} /> {aiLoading ? 'Generating…' : 'AI Generate Plan'}
        </button>
        {aiLoading && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-400)' }}>Asking Gemini…</span>}
        {aiError   && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#ef4444' }}>{aiError}</span>}
      </div>

      {/* Weekly summary strip */}
      {days.length > 0 && (
        <div style={{
          background: 'rgba(10,6,18,0.55)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 12,
          display: 'flex', gap: 16,
        }}>
          {[
            { label: 'Days',       value: days.length },
            { label: 'Total Sets', value: weekTotals.sets },
            { label: 'Est. Burn',  value: `~${Math.round(weekTotals.cal)} kcal` },
          ].map(({ label, value }) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gray-500)', marginBottom: 2 }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {days.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '28px 0', fontFamily: 'var(--font-body)', fontSize: '0.78rem',
          color: 'var(--gray-500)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 'var(--r-md)', marginBottom: 12,
        }}>
          No training days yet.<br />
          <span style={{ color: 'var(--gray-600)', fontSize: '0.7rem' }}>Generate an AI plan or add days manually.</span>
        </div>
      )}

      {/* Day cards */}
      {days.map((day, idx) => {
        const ae        = getAE(day.id);
        const isEx      = expanded.has(day.id);
        const isAO      = addOpen[day.id];
        const totalSets = day.items.reduce((s, it) => s + (Number(it.sets) || 0), 0);
        const estCal    = day.items.reduce((s, it) => {
          const ex = workoutDatabase.find(w => w.id === it.exerciseId);
          return s + (ex ? ex.calPerSet * (Number(it.sets) || 0) : 0);
        }, 0);

        return (
          <div key={day.id} style={{ background: 'rgba(10,6,18,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--r-md)', marginBottom: 8, overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 8 }}>
              {/* Day number badge */}
              <div style={{
                width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold-500)',
              }}>
                {idx + 1}
              </div>
              {/* Editable name */}
              <input
                type="text" placeholder="Day name…" value={day.name}
                onChange={e => updateDayName(day.id, e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-500)', minWidth: 0 }}
              />
              {day.items.length > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--gray-500)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {totalSets} sets · ~{Math.round(estCal)} kcal
                </span>
              )}
              {/* Expand toggle */}
              <button type="button" onClick={() => toggleExpand(day.id)} style={{ ...iconDeleteBtn, color: 'var(--gray-500)', width: 26, height: 26 }}>
                <ChevronDown size={14} style={{ transform: isEx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {/* Delete */}
              <button type="button" onClick={() => deleteDay(day.id)} aria-label="Delete day" style={iconDeleteBtn}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}>
                <X size={14} />
              </button>
            </div>

            {/* Expanded body */}
            {isEx && (
              <div style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {day.items.length === 0 && !isAO && (
                  <div style={{ textAlign: 'center', padding: '10px 0', fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-600)' }}>
                    No exercises yet
                  </div>
                )}

                <div style={{ paddingTop: day.items.length > 0 ? 8 : 0 }}>
                  {day.items.map(it => {
                    const ex    = workoutDatabase.find(w => w.id === it.exerciseId);
                    const itCal = ex ? Math.round(ex.calPerSet * (Number(it.sets) || 0)) : 0;
                    return (
                      <div key={it.tempId} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px',
                        marginBottom: 4, borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-200)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ex?.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <input
                            type="number" value={it.sets} min="1" max="20"
                            onChange={e => updateExItemSets(day.id, it.tempId, e.target.value)}
                            aria-label={`${ex?.name} sets`}
                            style={{ width: 36, padding: '2px 5px', background: 'rgba(10,6,18,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', outline: 'none', textAlign: 'right' }}
                          />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--gray-500)' }}>sets</span>
                          {itCal > 0 && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gold-500)', background: 'rgba(255,184,0,0.08)', padding: '1px 5px', borderRadius: 3, whiteSpace: 'nowrap' }}>
                              ~{itCal} kcal
                            </span>
                          )}
                          <button type="button" onClick={() => removeExItem(day.id, it.tempId)} aria-label={`Remove ${ex?.name}`}
                            style={iconDeleteBtn}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add exercise section */}
                <div style={{ marginTop: 8, borderTop: day.items.length > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingTop: day.items.length > 0 ? 8 : 4 }}>
                  {!isAO ? (
                    <button type="button" onClick={() => setAddOpen(prev => ({ ...prev, [day.id]: true }))}
                      style={{ ...smallBtn('ghost'), gap: 5, width: '100%', justifyContent: 'center' }}>
                      <Plus size={12} /> Add Exercise
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <SearchSelect items={workoutItems} selectedId={ae.exerciseId} onSelect={val => setAEField(day.id, 'exerciseId', val)} placeholder="Search exercise…" />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="number" placeholder="sets" min="1" max="10" value={ae.sets}
                          onChange={e => setAEField(day.id, 'sets', e.target.value)}
                          style={{ flex: 1, minWidth: 0, width: 0, padding: '9px 12px', background: 'rgba(10,6,18,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => (e.target.style.borderColor = 'var(--gold-500)')}
                          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                        />
                        <button type="button" onClick={() => addExToDay(day.id)} style={{ ...smallBtn('gold'), padding: '8px 14px', flexShrink: 0 }}>
                          <Plus size={13} /> Add
                        </button>
                        <button type="button" onClick={() => setAddOpen(prev => ({ ...prev, [day.id]: false }))} style={{ ...smallBtn('ghost'), padding: '8px 10px', flexShrink: 0 }}>
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button type="button" onClick={addDay} style={{ ...smallBtn('secondary'), width: '100%', padding: '10px', marginTop: 4, justifyContent: 'center' }}>
        <Plus size={13} /> Add Training Day
      </button>
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
const UserProfileModal = ({ settings, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState('goals');

  // Goals tab state
  const [gender,   setGender]   = useState(settings.gender   ?? 'male');
  const [goalType, setGoalType] = useState(settings.goal_type ?? 'maintenance');
  const [age,      setAge]      = useState(String(settings.age));
  const [heightCm, setHeightCm] = useState(String(settings.height_cm));
  const [weightKg, setWeightKg] = useState(String(settings.weight_kg));
  const [stepGoal, setStepGoal] = useState(String(settings.step_goal || 10000));

  // Diet plan: always 5 fixed categories, items loaded from saved data
  const [meals, setMeals] = useState(() => normalizeMeals(settings.diet_plan?.meals));
  // Training plan: seed defaults for new users, honour saved data for returning users
  const isNewUser = !settings._persisted;
  const [days, setDays] = useState(
    isNewUser && !settings.workout_plan?.days?.length ? seedDays() : (settings.workout_plan?.days ?? [])
  );

  // Live-calculated values (drive AI calls and save)
  const liveW   = parseFloat(weightKg) || 0;
  const liveH   = parseFloat(heightCm) || 0;
  const liveA   = parseInt(age)        || 0;
  const liveBmr = calcBMR(gender, liveW, liveH, liveA);
  const liveGoal = calcGoalCalories(liveBmr, goalType);
  const liveMac  = calcMacros(liveGoal, liveW);

  const formState = {
    calorieGoal: liveGoal,
    proteinGoal: liveMac.protein,
    carbsGoal:   liveMac.carbs,
    fatsGoal:    liveMac.fat,
    age, heightCm, weightKg,
  };

  const handleSave = (e) => {
    e.preventDefault();
    const a = parseInt(age);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    const sg = parseInt(stepGoal);
    if (!a || !h || !w) return;
    const bmr      = calcBMR(gender, w, h, a);
    const goalCal  = calcGoalCalories(bmr, goalType);
    const { protein, fat, carbs } = calcMacros(goalCal, w);
    onSave({
      gender,
      goal_type:    goalType,
      age:          a,
      height_cm:    h,
      weight_kg:    w,
      step_goal:    sg || 10000,
      // cached computed values for backward compat
      calorie_goal: goalCal,
      protein_goal: protein,
      carbs_goal:   carbs,
      fats_goal:    fat,
      diet_plan:    { meals },
      workout_plan: { days },
    });
  };

  const tabs = [
    { id: 'goals', label: 'Goals' },
    { id: 'diet', label: 'Diet Plan' },
    { id: 'training', label: 'Training' },
  ];

  const tabActive = {
    background: 'var(--gradient-cta)',
    color: 'var(--purple-900)',
    boxShadow: 'var(--glow-gold)',
    border: 'none',
  };

  const tabInactive = {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--gray-400)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '460px',
          background: 'var(--purple-900)',
          border: '1px solid rgba(91,31,158,0.5)',
          borderRadius: 'var(--r-xl)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--gold-500)', marginBottom: '4px' }}>
              MY PROFILE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--purple-300)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--white)' }}>
                Goals &amp; Plans
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close profile settings"
            onClick={onClose}
            style={{
              width: '36px', height: '36px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--r-md)',
              color: 'var(--gray-400)',
              cursor: 'pointer',
              padding: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '16px 0 0' }} />

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '6px', padding: '12px 20px 0' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 'var(--r-md)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.15s',
                ...(activeTab === t.id ? tabActive : tabInactive),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ padding: '4px 20px 24px', overflowY: 'auto', flex: 1 }}>

          {/* ── GOALS TAB ── */}
          {activeTab === 'goals' && (
            <>
              {/* Body stats */}
              <div style={sectionLabel}>Body Stats</div>

              {/* Gender toggle */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gray-300)' }}>Gender</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['male', 'female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 'var(--r-md)',
                        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.72rem',
                        textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                        border: gender === g ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        background: gender === g ? 'var(--gradient-cta)' : 'rgba(255,255,255,0.04)',
                        color: gender === g ? 'var(--purple-900)' : 'var(--gray-400)',
                        boxShadow: gender === g ? 'var(--glow-gold)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      {g === 'male' ? '♂ Male' : '♀ Female'}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Age"    value={age}      onChange={setAge}      min={10}  max={100} unit="years" />
              <Field label="Height" value={heightCm} onChange={setHeightCm} min={100} max={250} step={0.1} unit="cm" />
              <Field label="Weight" value={weightKg} onChange={setWeightKg} min={30}  max={250} step={0.1} unit="kg" />

              {/* Goal type */}
              <div style={{ ...sectionLabel, marginTop: '22px' }}>Goal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {Object.entries(GOAL_META).map(([key, meta]) => {
                  const active = goalType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setGoalType(key)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                        border: active ? `1px solid ${meta.color}` : '1px solid rgba(255,255,255,0.07)',
                        background: active ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: active ? meta.color : 'var(--gray-400)' }}>
                        {meta.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: active ? meta.color : 'var(--gray-500)' }}>
                        {meta.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live calculated breakdown */}
              {liveBmr > 0 && (
                <div style={{ background: 'rgba(10,6,18,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold-500)', marginBottom: '10px' }}>
                    Calculated Targets
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { label: 'BMR (at rest)', value: `${liveBmr.toLocaleString()} kcal`, sub: 'Mifflin-St Jeor' },
                      { label: 'Base Goal',     value: `${liveGoal.toLocaleString()} kcal`, sub: `BMR ${GOAL_META[goalType]?.sub}` },
                      { label: 'Protein',        value: `${liveMac.protein}g`, sub: `${liveMac.protein * 4} kcal` },
                      { label: 'Carbs',          value: `${liveMac.carbs}g`,   sub: `${liveMac.carbs * 4} kcal` },
                      { label: 'Fats',           value: `${liveMac.fat}g`,     sub: `${Math.round(liveMac.fat * 9)} kcal` },
                      { label: 'Activity Burns', value: '+auto', sub: 'added daily' },
                    ].map(({ label, value, sub }) => (
                      <div key={label}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gray-500)', marginBottom: '2px' }}>{label}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold-400)', lineHeight: 1 }}>{value}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gray-600)', marginTop: '2px' }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step goal */}
              <div style={sectionLabel}>Step Goal</div>
              <Field label="Daily Steps" value={stepGoal} onChange={setStepGoal} min={1000} max={50000} step={500} unit="steps/day" />
            </>
          )}

          {/* ── DIET PLAN TAB ── */}
          {activeTab === 'diet' && (
            <DietPlanTab meals={meals} setMeals={setMeals} formState={formState} />
          )}

          {/* ── TRAINING TAB ── */}
          {activeTab === 'training' && (
            <TrainingTab days={days} setDays={setDays} formState={formState} />
          )}

          {/* Save + Cancel */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: '13px 16px',
                background: 'var(--gradient-cta)',
                color: 'var(--purple-900)',
                border: 'none',
                borderRadius: 'var(--r-pill)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--glow-gold)',
              }}
            >
              <Save size={15} /> Save All
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '13px 16px',
                background: 'rgba(255,255,255,0.07)',
                color: 'var(--gray-300)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--r-pill)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;

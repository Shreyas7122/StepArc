import { User, X, Save, Brain, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import SearchSelect from './SearchSelect';
import { foodDatabase, workoutDatabase, fixedMeals, fixedWorkouts } from '../data';
import { getApiBase } from '../utils';

// Convert fixedMeals / fixedWorkouts into editable plan format
const seedMeals = () =>
  fixedMeals.map((m, i) => ({
    id: Date.now() + i,
    name: m.name,
    items: m.items.map((it, j) => ({ tempId: Date.now() + i * 1000 + j, foodId: it.foodId, amount: it.amount })),
  }));

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
  sub: `${f.calories} kcal/100g · P ${f.protein}g  C ${f.carbs}g  F ${f.fats}g`,
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

const mealCard = {
  background: 'rgba(10,6,18,0.5)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 'var(--r-md)',
  padding: '12px',
  marginBottom: '8px',
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

// ── Gemini recommendation box ─────────────────────────────────────────────────
const RecBox = ({ text, loading }) => {
  if (!loading && !text) return null;
  return (
    <div style={{
      maxHeight: '200px',
      overflowY: 'auto',
      fontSize: '0.8rem',
      color: 'var(--gray-300)',
      padding: '12px',
      border: '1px solid var(--purple-600, rgba(91,31,158,0.6))',
      borderRadius: 'var(--r-md)',
      background: 'rgba(10,6,18,0.6)',
      marginBottom: '12px',
      lineHeight: 1.6,
      whiteSpace: 'pre-wrap',
    }}>
      {loading ? 'Asking Gemini…' : text}
    </div>
  );
};

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

// ── Tab 2: Diet Plan ──────────────────────────────────────────────────────────
const DietPlanTab = ({ meals, setMeals, formState }) => {
  const [dietRec, setDietRec] = useState('');
  const [dietLoading, setDietLoading] = useState(false);

  // Per-meal add-food row state
  const [addFood, setAddFood] = useState({});   // { [mealId]: { foodId, amount } }

  const handleAskGemini = async () => {
    setDietLoading(true);
    setDietRec('');
    try {
      const { calorieGoal, proteinGoal, carbsGoal, fatsGoal, age, heightCm, weightKg } = formState;
      const res = await fetch(`${apiBase}/recommend-diet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(age) || 20,
          weight_kg: parseFloat(weightKg) || 78,
          height_cm: parseFloat(heightCm) || 175,
          calorie_goal: parseInt(calorieGoal) || 2870,
          protein_goal: parseInt(proteinGoal) || 200,
          carbs_goal: parseInt(carbsGoal) || 300,
          fats_goal: parseInt(fatsGoal) || 80,
        }),
      });
      const data = await res.json();
      setDietRec(data.recommendation || 'No recommendation received.');
    } catch (err) {
      setDietRec('Failed to get recommendation. Check your connection.');
    } finally {
      setDietLoading(false);
    }
  };

  const addMeal = () => {
    setMeals(prev => [...prev, { id: Date.now(), name: '', items: [] }]);
  };

  const deleteMeal = (mealId) => {
    setMeals(prev => prev.filter(m => m.id !== mealId));
  };

  const updateMealName = (mealId, name) => {
    setMeals(prev => prev.map(m => m.id === mealId ? { ...m, name } : m));
  };

  const getAddFood = (mealId) => addFood[mealId] || { foodId: foodDatabase[0].id, amount: '' };

  const setAddFoodField = (mealId, field, val) => {
    setAddFood(prev => ({ ...prev, [mealId]: { ...getAddFood(mealId), [field]: val } }));
  };

  const addFoodToMeal = (mealId) => {
    const { foodId, amount } = getAddFood(mealId);
    if (!amount || Number(amount) <= 0) return;
    setMeals(prev => prev.map(m =>
      m.id === mealId
        ? { ...m, items: [...m.items, { tempId: Date.now(), foodId: Number(foodId), amount: Number(amount) }] }
        : m
    ));
    setAddFoodField(mealId, 'amount', '');
  };

  const removeFoodItem = (mealId, tempId) => {
    setMeals(prev => prev.map(m =>
      m.id === mealId ? { ...m, items: m.items.filter(it => it.tempId !== tempId) } : m
    ));
  };

  const updateFoodItemAmount = (mealId, tempId, val) => {
    setMeals(prev => prev.map(m =>
      m.id === mealId
        ? { ...m, items: m.items.map(it => it.tempId === tempId ? { ...it, amount: val === '' ? '' : Number(val) } : it) }
        : m
    ));
  };

  return (
    <div>
      {/* Gemini button */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', marginTop: '8px' }}>
        <button type="button" onClick={handleAskGemini} disabled={dietLoading} style={smallBtn('gold')}>
          <Brain size={14} /> {dietLoading ? 'Thinking…' : 'Ask Gemini'}
        </button>
      </div>

      <RecBox text={dietRec} loading={dietLoading} />

      {/* Meal list */}
      {meals.map(meal => {
        const af = getAddFood(meal.id);
        const mealTotals = meal.items.reduce((acc, it) => {
          const f = foodDatabase.find(fd => fd.id === it.foodId);
          if (!f) return acc;
          const ratio = it.amount / 100;
          return {
            cal: acc.cal + f.calories * ratio,
            p: acc.p + f.protein * ratio,
          };
        }, { cal: 0, p: 0 });

        return (
          <div key={meal.id} style={mealCard}>
            {/* Meal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <input
                type="text"
                placeholder="e.g. Pre-Workout"
                value={meal.name}
                onChange={e => updateMealName(meal.id, e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--gold-500)',
                }}
              />
              <button type="button" onClick={() => deleteMeal(meal.id)} style={{ ...smallBtn('ghost'), padding: '4px 6px', color: 'var(--gray-500)', flexShrink: 0 }}>
                <X size={13} />
              </button>
            </div>

            {/* Meal totals */}
            {meal.items.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--gold-400)' }}>
                  {Math.round(mealTotals.cal)} kcal
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--gray-500)' }}>
                  P {mealTotals.p.toFixed(1)}g
                </span>
              </div>
            )}

            {/* Food items */}
            {meal.items.map(it => {
              const food = foodDatabase.find(f => f.id === it.foodId);
              const cal = food && it.amount ? Math.round(food.calories * Number(it.amount) / 100) : 0;
              return (
                <div key={it.tempId} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px',
                  padding: '4px 8px', borderRadius: 'var(--r-md)',
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-200)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {food?.name}
                  </span>
                  <input
                    type="number"
                    value={it.amount}
                    onChange={e => updateFoodItemAmount(meal.id, it.tempId, e.target.value)}
                    min="1"
                    aria-label={`${food?.name} amount in grams`}
                    style={{ width: '48px', padding: '2px 5px', background: 'rgba(10,6,18,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', outline: 'none', textAlign: 'right', flexShrink: 0 }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-500)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    g · {cal} kcal
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFoodItem(meal.id, it.tempId)}
                    aria-label={`Remove ${food?.name}`}
                    style={iconDeleteBtn}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}

            {/* Add food row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
              <SearchSelect
                items={foodItems}
                selectedId={af.foodId}
                onSelect={val => setAddFoodField(meal.id, 'foodId', val)}
                placeholder="Search food…"
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="amount (g)"
                  min="1"
                  value={af.amount}
                  onChange={e => setAddFoodField(meal.id, 'amount', e.target.value)}
                  style={{ flex: 1, padding: '9px 12px', background: 'rgba(10,6,18,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }}
                />
                <button type="button" onClick={() => addFoodToMeal(meal.id)} style={{ ...smallBtn('gold'), padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add meal button */}
      <button type="button" onClick={addMeal} style={{ ...smallBtn('secondary'), width: '100%', padding: '10px', marginTop: '4px' }}>
        <Plus size={13} /> Add Meal
      </button>
    </div>
  );
};

// ── Tab 3: Training Plan ──────────────────────────────────────────────────────
const TrainingTab = ({ days, setDays, formState }) => {
  const [workoutRec, setWorkoutRec] = useState('');
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [addExercise, setAddExercise] = useState({});

  const handleAskGemini = async () => {
    setWorkoutLoading(true);
    setWorkoutRec('');
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
      const data = await res.json();
      setWorkoutRec(data.recommendation || 'No recommendation received.');
    } catch (err) {
      setWorkoutRec('Failed to get recommendation. Check your connection.');
    } finally {
      setWorkoutLoading(false);
    }
  };

  const addDay = () => {
    setDays(prev => [...prev, { id: Date.now(), name: '', items: [] }]);
  };

  const deleteDay = (dayId) => {
    setDays(prev => prev.filter(d => d.id !== dayId));
  };

  const updateDayName = (dayId, name) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, name } : d));
  };

  const getAddEx = (dayId) => addExercise[dayId] || { exerciseId: workoutDatabase[0].id, sets: '' };

  const setAddExField = (dayId, field, val) => {
    setAddExercise(prev => ({ ...prev, [dayId]: { ...getAddEx(dayId), [field]: val } }));
  };

  const addExToDay = (dayId) => {
    const { exerciseId, sets } = getAddEx(dayId);
    if (!sets || Number(sets) <= 0) return;
    setDays(prev => prev.map(d =>
      d.id === dayId
        ? { ...d, items: [...d.items, { tempId: Date.now(), exerciseId: Number(exerciseId), sets: Number(sets) }] }
        : d
    ));
    setAddExField(dayId, 'sets', '');
  };

  const removeExItem = (dayId, tempId) => {
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, items: d.items.filter(it => it.tempId !== tempId) } : d
    ));
  };

  const updateExItemSets = (dayId, tempId, val) => {
    setDays(prev => prev.map(d =>
      d.id === dayId
        ? { ...d, items: d.items.map(it => it.tempId === tempId ? { ...it, sets: val === '' ? '' : Number(val) } : it) }
        : d
    ));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', marginTop: '8px' }}>
        <button type="button" onClick={handleAskGemini} disabled={workoutLoading} style={smallBtn('gold')}>
          <Brain size={14} /> {workoutLoading ? 'Thinking…' : 'Ask Gemini'}
        </button>
      </div>

      <RecBox text={workoutRec} loading={workoutLoading} />

      {days.map(day => {
        const ae = getAddEx(day.id);
        const totalSets = day.items.reduce((s, it) => s + it.sets, 0);
        const estCal = day.items.reduce((s, it) => {
          const ex = workoutDatabase.find(w => w.id === it.exerciseId);
          return s + (ex ? ex.calPerSet * it.sets : 0);
        }, 0);

        return (
          <div key={day.id} style={mealCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <input
                type="text"
                placeholder="e.g. Push Day"
                value={day.name}
                onChange={e => updateDayName(day.id, e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--gold-500)',
                }}
              />
              <button type="button" onClick={() => deleteDay(day.id)} style={{ ...smallBtn('ghost'), padding: '4px 6px', color: 'var(--gray-500)', flexShrink: 0 }}>
                <X size={13} />
              </button>
            </div>

            {day.items.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--gold-400)' }}>
                  {totalSets} total sets
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--gray-500)' }}>
                  ~{Math.round(estCal)} kcal burned
                </span>
              </div>
            )}

            {day.items.map(it => {
              const ex = workoutDatabase.find(w => w.id === it.exerciseId);
              return (
                <div key={it.tempId} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px',
                  padding: '4px 8px', borderRadius: 'var(--r-md)',
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-200)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ex?.name}
                  </span>
                  <input
                    type="number"
                    value={it.sets}
                    onChange={e => updateExItemSets(day.id, it.tempId, e.target.value)}
                    min="1"
                    max="20"
                    aria-label={`${ex?.name} sets`}
                    style={{ width: '40px', padding: '2px 5px', background: 'rgba(10,6,18,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', outline: 'none', textAlign: 'right', flexShrink: 0 }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-500)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    sets
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExItem(day.id, it.tempId)}
                    aria-label={`Remove ${ex?.name}`}
                    style={iconDeleteBtn}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}

            {/* Add exercise row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
              <SearchSelect
                items={workoutItems}
                selectedId={ae.exerciseId}
                onSelect={val => setAddExField(day.id, 'exerciseId', val)}
                placeholder="Search exercise…"
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="sets"
                  min="1"
                  max="10"
                  value={ae.sets}
                  onChange={e => setAddExField(day.id, 'sets', e.target.value)}
                  style={{ flex: 1, padding: '9px 12px', background: 'rgba(10,6,18,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }}
                />
                <button type="button" onClick={() => addExToDay(day.id)} style={{ ...smallBtn('gold'), padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <button type="button" onClick={addDay} style={{ ...smallBtn('secondary'), width: '100%', padding: '10px', marginTop: '4px' }}>
        <Plus size={13} /> Add Day
      </button>
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
const UserProfileModal = ({ settings, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState('goals');

  // Goals tab state
  const [calorieGoal, setCalorieGoal] = useState(String(settings.calorie_goal));
  const [proteinGoal, setProteinGoal] = useState(String(settings.protein_goal));
  const [carbsGoal, setCarbsGoal] = useState(String(settings.carbs_goal));
  const [fatsGoal, setFatsGoal] = useState(String(settings.fats_goal));
  const [age, setAge] = useState(String(settings.age));
  const [heightCm, setHeightCm] = useState(String(settings.height_cm));
  const [weightKg, setWeightKg] = useState(String(settings.weight_kg));
  const [stepGoal, setStepGoal] = useState(String(settings.step_goal || 10000));

  // Diet & Training plan state — seed from fixedMeals/fixedWorkouts if user has no custom plan yet
  const [meals, setMeals] = useState(
    settings.diet_plan?.meals?.length ? settings.diet_plan.meals : seedMeals()
  );
  const [days, setDays] = useState(
    settings.workout_plan?.days?.length ? settings.workout_plan.days : seedDays()
  );

  const formState = { calorieGoal, proteinGoal, carbsGoal, fatsGoal, age, heightCm, weightKg };

  const handleSave = (e) => {
    e.preventDefault();
    const cg = parseInt(calorieGoal);
    const pg = parseInt(proteinGoal);
    const crg = parseInt(carbsGoal);
    const fg = parseInt(fatsGoal);
    const a = parseInt(age);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    const sg = parseInt(stepGoal);
    if (!cg || !pg || !crg || !fg || !a || !h || !w) return;
    onSave({
      calorie_goal: cg,
      protein_goal: pg,
      carbs_goal: crg,
      fats_goal: fg,
      age: a,
      height_cm: h,
      weight_kg: w,
      step_goal: sg || 10000,
      diet_plan: { meals },
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
              <div style={sectionLabel}>Step Goal</div>
              <Field label="Daily Steps" value={stepGoal} onChange={setStepGoal} min={1000} max={50000} step={500} unit="steps/day" />

              <div style={{ ...sectionLabel, marginTop: '22px' }}>Daily Goals</div>
              <Field label="Calorie Goal" value={calorieGoal} onChange={setCalorieGoal} min={1000} max={6000} unit="kcal/day" />
              <Field label="Protein Goal" value={proteinGoal} onChange={setProteinGoal} min={50} max={400} unit="g/day" />
              <Field label="Carbs Goal" value={carbsGoal} onChange={setCarbsGoal} min={50} max={700} unit="g/day" />
              <Field label="Fats Goal" value={fatsGoal} onChange={setFatsGoal} min={20} max={300} unit="g/day" />

              <div style={{ ...sectionLabel, marginTop: '22px' }}>Body Stats</div>
              <Field label="Age" value={age} onChange={setAge} min={10} max={100} unit="years" />
              <Field label="Height" value={heightCm} onChange={setHeightCm} min={100} max={250} step={0.1} unit="cm" />
              <Field label="Weight" value={weightKg} onChange={setWeightKg} min={30} max={250} step={0.1} unit="kg" />
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

import { useState } from 'react';
import { Zap, ChevronRight, Plus, ClipboardList } from 'lucide-react';
import { fixedMeals, foodDatabase } from '../data';
import SearchSelect from './SearchSelect';

const toQuickMeal = (meal) => ({
  name: meal.name || 'Unnamed Meal',
  items: (meal.items || []).map(it => ({ foodId: it.foodId, amount: it.amount })),
});

const foodItems = foodDatabase.map(f => ({
  id: f.id,
  label: f.name,
  sub: f.servingUnit
    ? `${f.calories} kcal · P ${f.protein}g  C ${f.carbs}g  F ${f.fats}g  · 1 ${f.servingUnit} = ${f.servingSize}g`
    : `${f.calories} kcal · P ${f.protein}g  C ${f.carbs}g  F ${f.fats}g  Fb ${f.fibre ?? 0}g`,
}));

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: 'var(--font-heading)', fontWeight: 700,
    fontSize: '0.58rem', textTransform: 'uppercase',
    letterSpacing: '0.26em', color: 'var(--yellow-500)', marginBottom: '4px',
    display: 'flex', alignItems: 'center', gap: '5px',
  }}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{
    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900,
    fontSize: '1.55rem', textTransform: 'uppercase', letterSpacing: '-0.01em',
    color: 'var(--white)', lineHeight: 1, marginBottom: '0px',
  }}>
    {children}
  </div>
);

const MacroCell = ({ label, value, onChange, placeholder, unit = 'g', color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{
      fontFamily: 'var(--font-heading)', fontSize: '0.56rem',
      textTransform: 'uppercase', letterSpacing: '0.12em',
      color: color || 'var(--gray-400)', fontWeight: 700,
    }}>
      {label} <span style={{ opacity: 0.55, fontWeight: 400 }}>{unit}</span>
    </span>
    <input
      type="number" min="0" step="0.1"
      placeholder={placeholder || '0'}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '8px 10px',
        background: 'var(--ink-800)',
        border: `1px solid ${color ? color + '33' : 'var(--ink-700)'}`,
        borderRadius: 'var(--r-md)',
        color: 'var(--white)', fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem', outline: 'none', width: '100%',
      }}
      onFocus={e  => (e.target.style.borderColor = color || 'var(--yellow-500)')}
      onBlur={e   => (e.target.style.borderColor = color ? color + '33' : 'var(--ink-700)')}
    />
  </div>
);

const Divider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ flex: 1, height: 1, background: 'var(--ink-700)' }} />
    <span style={{
      fontFamily: 'var(--font-heading)', fontWeight: 700,
      fontSize: '0.56rem', textTransform: 'uppercase',
      letterSpacing: '0.18em', color: 'var(--gray-400)',
    }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: 'var(--ink-700)' }} />
  </div>
);

// Piece/gram dual-mode input for foods that have a servingUnit
const FoodQuantityInput = ({ food, gramsValue, onGramsChange }) => {
  const [mode, setMode] = useState('pieces');
  const piecesValue = gramsValue && food.servingSize
    ? String(Math.round((Number(gramsValue) / food.servingSize) * 10) / 10)
    : '';

  const handlePiecesChange = (val) => {
    const pieces = Number(val);
    if (!isNaN(pieces) && pieces > 0) {
      onGramsChange(String(Math.round(pieces * food.servingSize)));
    } else {
      onGramsChange('');
    }
  };

  const estimatedCal = gramsValue
    ? Math.round((food.calories * Number(gramsValue)) / 100)
    : null;

  return (
    <div className="input-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ marginBottom: 0 }}>Amount</label>
        <div style={{ display: 'flex', background: 'var(--ink-800)', borderRadius: 'var(--r-sm)', padding: '2px', border: '1px solid var(--ink-700)' }}>
          {['pieces', 'grams'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                padding: '3px 10px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                background: mode === m ? 'var(--yellow-500)' : 'transparent',
                color: mode === m ? 'var(--black)' : 'var(--gray-400)',
                borderRadius: 'var(--r-sm)',
                transition: 'all 0.15s',
              }}
            >
              {m === 'pieces' ? food.servingUnit + 's' : 'grams'}
            </button>
          ))}
        </div>
      </div>
      {mode === 'pieces' ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            placeholder={`e.g. 2`}
            value={piecesValue}
            onChange={(e) => handlePiecesChange(e.target.value)}
            min="0.5"
            step="0.5"
            style={{ flex: 1 }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gray-400)',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {gramsValue ? `= ${gramsValue}g` : `1 ${food.servingUnit} = ${food.servingSize}g`}
          </span>
        </div>
      ) : (
        <input
          type="number"
          placeholder="e.g. 50"
          value={gramsValue}
          onChange={(e) => onGramsChange(e.target.value)}
          min="1"
        />
      )}
      {estimatedCal !== null && (
        <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--yellow-500)', fontWeight: 600 }}>
          ≈ {estimatedCal} kcal
        </div>
      )}
    </div>
  );
};

const EMPTY_CUSTOM = { name: '', calories: '', protein: '', carbs: '', fats: '', fibre: '' };

const FoodTab = ({
  onStartQuickLog,
  selectedFoodId, setSelectedFoodId,
  foodAmount, setFoodAmount,
  onAddFood,
  onCustomFood,
  customMeals,
}) => {
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM);

  const quickMeals = customMeals?.length
    ? customMeals.filter(m => m.items?.length > 0).map(toQuickMeal)
    : fixedMeals;

  const setField = (field) => (val) => setCustomForm(prev => ({ ...prev, [field]: val }));

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const name = customForm.name.trim();
    const cal  = Number(customForm.calories);
    if (!name || !cal) return;
    onCustomFood({
      name,
      aiMacros: {
        calories: cal,
        protein:  Number(customForm.protein) || 0,
        carbs:    Number(customForm.carbs)   || 0,
        fats:     Number(customForm.fats)    || 0,
        fibre:    Number(customForm.fibre)   || 0,
      },
    });
    setCustomForm(EMPTY_CUSTOM);
  };

  return (
    <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── 01 Quick Log ──────────────────────────────────────────── */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <SectionLabel><Zap size={10} />01 · QUICK LOG</SectionLabel>
            <SectionTitle>Meals</SectionTitle>
          </div>
          <span style={{
            background: 'var(--yellow-500)', color: 'var(--black)',
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '3px 10px', borderRadius: 'var(--r-pill)',
          }}>QUICK</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {quickMeals.map((meal, idx) => (
            <button
              key={idx}
              onClick={() => onStartQuickLog(meal)}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', width: '100%',
                background: 'var(--ink-800)',
                border: 'none',
                borderLeft: '3px solid var(--yellow-500)',
                borderRadius: '0 var(--r-md) var(--r-md) 0',
                padding: '12px 14px', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,194,13,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-800)')}
            >
              <span style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: '0.88rem', textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--white)',
              }}>
                {meal.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {meal.items?.length > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray-400)' }}>
                    {meal.items.length} items
                  </span>
                )}
                <ChevronRight size={14} color="var(--yellow-500)" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <Divider label="or add manually" />

      {/* ── 02 Database Search ────────────────────────────────────── */}
      <form onSubmit={onAddFood} className="glass-card">
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel><Plus size={10} />02 · FROM DATABASE</SectionLabel>
          <SectionTitle>Food Search</SectionTitle>
        </div>
        <div className="input-group">
          <label>Food Item</label>
          <SearchSelect items={foodItems} selectedId={selectedFoodId} onSelect={(id) => { setSelectedFoodId(id); setFoodAmount(''); }} placeholder="Search food… e.g. oats" />
        </div>
        {(() => {
          const food = foodDatabase.find(f => f.id === Number(selectedFoodId));
          if (food?.servingUnit) {
            return (
              <FoodQuantityInput
                food={food}
                gramsValue={foodAmount}
                onGramsChange={setFoodAmount}
              />
            );
          }
          return (
            <div className="input-group">
              <label>Amount (grams)</label>
              <input type="number" placeholder="e.g. 50" value={foodAmount} onChange={(e) => setFoodAmount(e.target.value)} min="1" />
            </div>
          );
        })()}
        <button type="submit"><Plus size={16} /> ADD FOOD</button>
      </form>

      <Divider label="or enter custom macros" />

      {/* ── 03 Custom Entry ───────────────────────────────────────── */}
      <form onSubmit={handleCustomSubmit} className="glass-card">
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel><ClipboardList size={10} />03 · CUSTOM ENTRY</SectionLabel>
          <SectionTitle>Enter Macros</SectionTitle>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: 6 }}>
            For home-cooked or unlisted foods.
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 14 }}>
          <label>Food Name</label>
          <input
            type="text"
            placeholder="e.g. Low Fat Paneer, Chicken Subji…"
            value={customForm.name}
            onChange={e => setField('name')(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: 10 }}>
          <MacroCell label="Calories" unit="kcal" color="var(--calories-color)" value={customForm.calories} onChange={setField('calories')} placeholder="e.g. 180" />
          <MacroCell label="Protein"  unit="g"    color="var(--protein-color)"  value={customForm.protein}  onChange={setField('protein')}  placeholder="e.g. 20"  />
          <MacroCell label="Carbs"    unit="g"    color="var(--carbs-color)"    value={customForm.carbs}    onChange={setField('carbs')}    placeholder="e.g. 4"   />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 16 }}>
          <MacroCell label="Fats"  unit="g" color="var(--fats-color)"  value={customForm.fats}  onChange={setField('fats')}  placeholder="e.g. 10" />
          <MacroCell label="Fibre" unit="g" color="var(--fibre-color)" value={customForm.fibre} onChange={setField('fibre')} placeholder="e.g. 0"  />
        </div>

        <button type="submit" disabled={!customForm.name.trim() || !customForm.calories}>
          <ClipboardList size={16} /> LOG CUSTOM FOOD
        </button>
      </form>

    </div>
  );
};

export default FoodTab;

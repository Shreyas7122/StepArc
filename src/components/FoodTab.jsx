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
  sub: `${f.calories} kcal · P ${f.protein}g  C ${f.carbs}g  F ${f.fats}g  Fb ${f.fibre ?? 0}g`,
}));

const SectionLabel = ({ children }) => (
  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.26em', color: 'var(--gold-500)', marginBottom: '4px' }}>
    {children}
  </div>
);

const CardTag = ({ children }) => (
  <span style={{ display: 'inline-block', background: 'var(--gradient-cta)', color: 'var(--purple-900)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '2px 10px', borderRadius: 'var(--r-pill)' }}>
    {children}
  </span>
);

// ── Compact labelled number input cell ────────────────────────────────────────
const MacroCell = ({ label, value, onChange, placeholder, unit = 'g', color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: color || 'var(--gray-500)', fontWeight: 600 }}>
      {label} <span style={{ opacity: 0.6, fontWeight: 400 }}>{unit}</span>
    </span>
    <input
      type="number"
      min="0"
      step="0.1"
      placeholder={placeholder || '0'}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ padding: '8px 10px', background: 'rgba(10,6,18,0.7)', border: `1px solid ${color ? color + '44' : 'rgba(255,255,255,0.1)'}`, borderRadius: 'var(--r-md)', color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
      onFocus={e => (e.target.style.borderColor = color || 'var(--gold-500)')}
      onBlur={e  => (e.target.style.borderColor = color ? color + '44' : 'rgba(255,255,255,0.1)')}
    />
  </div>
);

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

      {/* Quick Log Meals */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <SectionLabel><Zap size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />01 · QUICK LOG</SectionLabel>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--white)' }}>Meals</div>
          </div>
          <CardTag>QUICK LOG</CardTag>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {quickMeals.map((meal, idx) => (
            <button key={idx} onClick={() => onStartQuickLog(meal)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'rgba(10,6,18,0.45)', border: 'none', borderLeft: '3px solid var(--gold-500)', borderRadius: '0 var(--r-md) var(--r-md) 0', padding: '11px 14px', cursor: 'pointer', transition: 'background 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,184,0,0.08)'; e.currentTarget.style.boxShadow = 'var(--glow-gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,6,18,0.45)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--white)' }}>{meal.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-500)' }}>{meal.items?.length ? `${meal.items.length} items` : ''}</span>
                <ChevronRight size={14} color="var(--gold-500)" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,184,0,0.15)' }} />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,184,0,0.5)' }}>or add manually</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,184,0,0.15)' }} />
      </div>

      {/* Search from database */}
      <form onSubmit={onAddFood} className="glass-card">
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel><Plus size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />02 · FROM DATABASE</SectionLabel>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--white)' }}>Food Search</div>
        </div>
        <div className="input-group">
          <label>Food Item</label>
          <SearchSelect items={foodItems} selectedId={selectedFoodId} onSelect={setSelectedFoodId} placeholder="Search food… e.g. oats" />
        </div>
        <div className="input-group">
          <label>Amount (grams)</label>
          <input type="number" placeholder="e.g. 50" value={foodAmount} onChange={(e) => setFoodAmount(e.target.value)} min="1" />
        </div>
        <button type="submit"><Plus size={17} /> ADD FOOD</button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,184,0,0.15)' }} />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,184,0,0.5)' }}>or enter custom macros</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,184,0,0.15)' }} />
      </div>

      {/* Custom food entry table */}
      <form onSubmit={handleCustomSubmit} className="glass-card">
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel><ClipboardList size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />03 · CUSTOM ENTRY</SectionLabel>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--white)' }}>Enter Macros</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: 4 }}>
            For home-cooked or unlisted foods — enter name and nutritional values.
          </div>
        </div>

        {/* Food name — full width */}
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

        {/* Macro grid: 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: 10 }}>
          <MacroCell label="Calories" unit="kcal" color="var(--calories-color)" value={customForm.calories} onChange={setField('calories')} placeholder="e.g. 180" />
          <MacroCell label="Protein"  unit="g"    color="var(--protein-color)"  value={customForm.protein}  onChange={setField('protein')}  placeholder="e.g. 20"  />
          <MacroCell label="Carbs"    unit="g"    color="var(--carbs-color)"    value={customForm.carbs}    onChange={setField('carbs')}    placeholder="e.g. 4"   />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 16 }}>
          <MacroCell label="Fats"  unit="g" color="var(--fats-color)"   value={customForm.fats}  onChange={setField('fats')}  placeholder="e.g. 10" />
          <MacroCell label="Fibre" unit="g" color="var(--fibre-color)"  value={customForm.fibre} onChange={setField('fibre')} placeholder="e.g. 0"  />
        </div>

        <button type="submit" disabled={!customForm.name.trim() || !customForm.calories}>
          <ClipboardList size={17} /> LOG CUSTOM FOOD
        </button>
      </form>

    </div>
  );
};

export default FoodTab;

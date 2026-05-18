import { Zap, ChevronRight, Plus } from 'lucide-react';
import { fixedMeals, foodDatabase } from '../data';
import SearchSelect from './SearchSelect';

// Convert diet-plan meal items to the shape handleStartQuickLog expects
const toQuickMeal = (meal) => ({
  name: meal.name || 'Unnamed Meal',
  items: (meal.items || []).map(it => ({ foodId: it.foodId, amount: it.amount })),
});

const foodItems = foodDatabase.map(f => ({
  id: f.id,
  label: f.name,
  sub: `${f.calories} kcal/100g · P ${f.protein}g  C ${f.carbs}g  F ${f.fats}g`,
}));

const SectionLabel = ({ children }) => (
  <div
    style={{
      fontFamily: 'var(--font-heading)',
      fontWeight: 600,
      fontSize: '0.6rem',
      textTransform: 'uppercase',
      letterSpacing: '0.26em',
      color: 'var(--gold-500)',
      marginBottom: '4px',
    }}
  >
    {children}
  </div>
);

const CardTag = ({ children }) => (
  <span
    style={{
      display: 'inline-block',
      background: 'var(--gradient-cta)',
      color: 'var(--purple-900)',
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: '0.55rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '2px 10px',
      borderRadius: 'var(--r-pill)',
    }}
  >
    {children}
  </span>
);

const FoodTab = ({
  onStartQuickLog,
  selectedFoodId, setSelectedFoodId,
  foodAmount, setFoodAmount,
  onAddFood,
  customMeals,
}) => {
  const quickMeals = customMeals?.length
    ? customMeals.filter(m => m.items?.length > 0).map(toQuickMeal)
    : fixedMeals;

  return (
  <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

    {/* Quick Log Meals */}
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <SectionLabel><Zap size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />01 · QUICK LOG</SectionLabel>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--white)' }}>
            Meals
          </div>
        </div>
        <CardTag>QUICK LOG</CardTag>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {quickMeals.map((meal, idx) => (
          <button
            key={idx}
            onClick={() => onStartQuickLog(meal)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'rgba(10,6,18,0.45)',
              border: 'none',
              borderLeft: '3px solid var(--gold-500)',
              borderRadius: '0 var(--r-md) var(--r-md) 0',
              padding: '11px 14px',
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,184,0,0.08)';
              e.currentTarget.style.boxShadow = 'var(--glow-gold)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(10,6,18,0.45)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--white)' }}>
              {meal.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-500)' }}>
                {meal.items?.length ? `${meal.items.length} items` : ''}
              </span>
              <ChevronRight size={14} color="var(--gold-500)" />
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Divider */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,184,0,0.15)' }} />
      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,184,0,0.5)' }}>
        or add manually
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,184,0,0.15)' }} />
    </div>

    {/* Custom Entry */}
    <form onSubmit={onAddFood} className="glass-card">
      <div style={{ marginBottom: '16px' }}>
        <SectionLabel><Plus size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />02 · CUSTOM ENTRY</SectionLabel>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--white)' }}>
          Food Search
        </div>
      </div>
      <div className="input-group">
        <label>Food Item</label>
        <SearchSelect
          items={foodItems}
          selectedId={selectedFoodId}
          onSelect={setSelectedFoodId}
          placeholder="Search food… e.g. oats"
        />
      </div>
      <div className="input-group">
        <label>Amount (grams)</label>
        <input
          type="number"
          placeholder="e.g. 50"
          value={foodAmount}
          onChange={(e) => setFoodAmount(e.target.value)}
          min="1"
        />
      </div>
      <button type="submit">
        <Plus size={17} /> ADD FOOD
      </button>
    </form>

  </div>
  );
};

export default FoodTab;

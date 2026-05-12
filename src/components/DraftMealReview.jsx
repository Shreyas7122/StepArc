import { X, Plus, Check } from 'lucide-react';
import { foodDatabase } from '../data';
import SearchSelect from './SearchSelect';

const foodItems = foodDatabase.map(f => ({
  id: f.id,
  label: f.name,
  sub: `${f.calories} kcal/100g · P ${f.protein}g  C ${f.carbs}g  F ${f.fats}g`,
}));

const DraftMealReview = ({
  draftMeal,
  draftAddId,
  draftAddAmount,
  setDraftAddId,
  setDraftAddAmount,
  onCancel,
  onUpdateAmount,
  onRemoveItem,
  onAddItem,
  onConfirm,
}) => (
  <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div className="glass-card">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Review: {draftMeal.name}</h2>
        <button onClick={onCancel} style={{ background: 'transparent', padding: 0, width: 'auto', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
      </div>

      {/* Item list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {draftMeal.items.map((it) => {
          const foodDef = foodDatabase.find((f) => f.id === it.foodId);
          return (
            <div key={it.tempId} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {foodDef?.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--calories-color)', marginTop: 2 }}>
                  {foodDef ? Math.round((foodDef.calories * (it.amount || 0)) / 100) : 0} kcal
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <input
                  type="number"
                  value={it.amount}
                  onChange={(e) => onUpdateAmount(it.tempId, e.target.value)}
                  style={{ width: '64px', padding: '7px', margin: 0, textAlign: 'center', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>g</span>
                <button onClick={() => onRemoveItem(it.tempId)} style={{ background: 'rgba(239,68,68,0.2)', padding: '7px', width: 'auto', borderRadius: '8px', color: '#ef4444' }}>
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add extra item */}
      <form onSubmit={onAddItem} style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>Add Extra Item</h3>
        <div className="input-group">
          <SearchSelect
            items={foodItems}
            selectedId={draftAddId}
            onSelect={setDraftAddId}
            placeholder="Search food… e.g. paneer"
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="grams"
            value={draftAddAmount}
            onChange={(e) => setDraftAddAmount(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
          <button type="submit" style={{ width: 'auto', padding: '12px 18px', flexShrink: 0, background: 'var(--surface-border)', color: 'var(--text-primary)' }}>
            <Plus size={18} />
          </button>
        </div>
      </form>

      <button onClick={onConfirm} style={{ background: '#10b981', color: 'white' }}>
        <Check size={18} /> Confirm &amp; Log Meal
      </button>
    </div>
  </div>
);

export default DraftMealReview;

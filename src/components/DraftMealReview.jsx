import { X, Plus, Check } from 'lucide-react';
import { foodDatabase } from '../data';

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
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Review: {draftMeal.name}</h2>
        <button
          onClick={onCancel}
          style={{ background: 'transparent', padding: 0, width: 'auto', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Item list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {draftMeal.items.map((it) => {
          const foodDef = foodDatabase.find((f) => f.id === it.foodId);
          return (
            <div
              key={it.tempId}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}
            >
              <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{foodDef?.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={it.amount}
                  onChange={(e) => onUpdateAmount(it.tempId, e.target.value)}
                  style={{ width: '80px', padding: '8px', margin: 0, textAlign: 'center' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>g</span>
                <button
                  onClick={() => onRemoveItem(it.tempId)}
                  style={{ background: 'rgba(239,68,68,0.2)', padding: '8px', width: 'auto', borderRadius: '8px', color: '#ef4444' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add extra item */}
      <form
        onSubmit={onAddItem}
        style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px', marginBottom: '24px' }}
      >
        <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>Add Extra Item</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
            <select value={draftAddId} onChange={(e) => setDraftAddId(e.target.value)}>
              {foodDatabase.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="number"
              placeholder="grams"
              value={draftAddAmount}
              onChange={(e) => setDraftAddAmount(e.target.value)}
            />
          </div>
          <button type="submit" style={{ width: 'auto', padding: '12px 16px', background: 'var(--surface-border)', color: 'var(--text-primary)' }}>
            <Plus size={20} />
          </button>
        </div>
      </form>

      {/* Confirm */}
      <button onClick={onConfirm} style={{ background: '#10b981', color: 'white' }}>
        <Check size={18} /> Confirm &amp; Log Meal
      </button>
    </div>
  </div>
);

export default DraftMealReview;

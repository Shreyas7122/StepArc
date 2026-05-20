import { X, Plus, Check } from 'lucide-react';
import { foodDatabase } from '../data';
import SearchSelect from './SearchSelect';

const foodItems = foodDatabase.map(f => ({
  id: f.id,
  label: f.name,
  sub: `${f.calories} kcal/100g · P ${f.protein}g  C ${f.carbs}g  F ${f.fats}g  Fb ${f.fibre ?? 0}g`,
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
        <div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--gold-500)',
              marginBottom: '3px',
            }}
          >
            REVIEW MEAL
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--white)',
            }}
          >
            {draftMeal.name}
          </div>
        </div>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            padding: '6px',
            width: 'auto',
            color: 'var(--gray-500)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <X size={22} />
        </button>
      </div>

      {/* Item list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {draftMeal.items.map((it) => {
          const foodDef = foodDatabase.find((f) => f.id === it.foodId);
          const cal = foodDef ? Math.round((foodDef.calories * (it.amount || 0)) / 100) : 0;
          return (
            <div
              key={it.tempId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(10,6,18,0.4)',
                padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: 'var(--white)',
                  }}
                >
                  {foodDef?.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--gold-500)',
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  {cal} kcal
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <input
                  type="number"
                  value={it.amount}
                  onChange={(e) => onUpdateAmount(it.tempId, e.target.value)}
                  style={{ width: '64px', padding: '7px', margin: 0, textAlign: 'center', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>g</span>
                <button
                  onClick={() => onRemoveItem(it.tempId)}
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    padding: '7px',
                    width: 'auto',
                    borderRadius: 'var(--r-md)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add extra item */}
      <form
        onSubmit={onAddItem}
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--gray-500)',
            marginBottom: '10px',
          }}
        >
          Add Extra Item
        </div>
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
          <button
            type="submit"
            style={{
              width: 'auto',
              padding: '11px 16px',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--white)',
              borderRadius: 'var(--r-md)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Plus size={17} />
          </button>
        </div>
      </form>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        style={{
          background: 'var(--gradient-cta)',
          color: 'var(--purple-900)',
          borderRadius: 'var(--r-pill)',
        }}
      >
        <Check size={17} /> CONFIRM &amp; LOG MEAL
      </button>
    </div>
  </div>
);

export default DraftMealReview;

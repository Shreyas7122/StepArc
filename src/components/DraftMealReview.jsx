import { X, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { foodDatabase } from '../data';
import SearchSelect from './SearchSelect';

const foodItems = foodDatabase.map(f => ({
  id: f.id,
  label: f.name,
  sub: `${f.calories} kcal/100g · P ${f.protein}g  C ${f.carbs}g  F ${f.fats}g  Fb ${f.fibre ?? 0}g`,
}));

const DraftFoodRow = ({ it, foodDef, cal, hasPieces, pieces, onUpdateAmount, onRemoveItem }) => {
  const [mode, setMode] = useState(hasPieces ? 'pieces' : 'grams');

  const handleChange = (val) => {
    if (mode === 'pieces' && hasPieces) {
      const p = Number(val);
      onUpdateAmount(it.tempId, isNaN(p) || p <= 0 ? '' : String(Math.round(p * foodDef.servingSize)));
    } else {
      onUpdateAmount(it.tempId, val);
    }
  };

  const displayVal = mode === 'pieces' && hasPieces ? (pieces ?? '') : (it.amount ?? '');
  const displayUnit = mode === 'pieces' ? foodDef.servingUnit : 'g';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--ink-800)', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--ink-700)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--white)' }}>
          {foodDef?.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--yellow-500)', fontWeight: 600 }}>{cal} kcal</span>
          {hasPieces && mode === 'pieces' && it.amount > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray-400)' }}>= {it.amount}g</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {hasPieces && (
          <div style={{ display: 'flex', background: 'var(--ink-900)', borderRadius: 'var(--r-sm)', padding: '2px', border: '1px solid var(--ink-700)' }}>
            {['pieces', 'grams'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: '2px 6px', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-heading)', fontWeight: 700,
                  fontSize: '0.52rem', textTransform: 'uppercase',
                  background: mode === m ? 'var(--yellow-500)' : 'transparent',
                  color: mode === m ? 'var(--black)' : 'var(--gray-400)',
                  borderRadius: 'var(--r-sm)', transition: 'all 0.12s',
                }}
              >
                {m === 'pieces' ? foodDef.servingUnit[0].toUpperCase() : 'G'}
              </button>
            ))}
          </div>
        )}
        <input
          type="number"
          value={displayVal}
          onChange={(e) => handleChange(e.target.value)}
          step={mode === 'pieces' ? '0.5' : '1'}
          min={mode === 'pieces' ? '0.5' : '1'}
          style={{ width: mode === 'pieces' ? '52px' : '64px', padding: '7px', margin: 0, textAlign: 'center', fontSize: '0.9rem' }}
        />
        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{displayUnit}</span>
        <button
          onClick={() => onRemoveItem(it.tempId)}
          style={{ background: 'rgba(239,68,68,0.15)', padding: '7px', width: 'auto', borderRadius: 'var(--r-md)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};

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
          const hasPieces = foodDef?.servingUnit && foodDef?.servingSize;
          const pieces = hasPieces ? Math.round((Number(it.amount) / foodDef.servingSize) * 10) / 10 : null;
          return (
            <DraftFoodRow
              key={it.tempId}
              it={it}
              foodDef={foodDef}
              cal={cal}
              hasPieces={hasPieces}
              pieces={pieces}
              onUpdateAmount={onUpdateAmount}
              onRemoveItem={onRemoveItem}
            />
          );
        })}
      </div>

      {/* Add extra item */}
      <form
        onSubmit={onAddItem}
        style={{
          borderTop: '1px solid var(--ink-700)',
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
          color: 'var(--black)',
          borderRadius: 'var(--r-pill)',
        }}
      >
        <Check size={17} /> CONFIRM &amp; LOG MEAL
      </button>
    </div>
  </div>
);

export default DraftMealReview;

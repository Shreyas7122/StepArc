import { X, Plus, Check } from 'lucide-react';
import { workoutDatabase } from '../lib/data';
import SearchSelect from './SearchSelect';

const exerciseItems = workoutDatabase.map(w => ({
  id: w.id,
  label: w.name,
  sub: `~${w.calPerSet} kcal/set`,
}));

const DraftWorkoutReview = ({
  draftWorkout,
  draftAddWorkoutId,
  draftAddWorkoutSets,
  setDraftAddWorkoutId,
  setDraftAddWorkoutSets,
  onCancel,
  onUpdateSets,
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
            REVIEW WORKOUT
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
            {draftWorkout.name}
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

      {/* Exercise list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {draftWorkout.items.map((it) => {
          const exerciseDef = workoutDatabase.find((w) => w.id === it.exerciseId);
          const cal = Math.round((exerciseDef?.calPerSet || 0) * (it.sets || 0));
          return (
            <div
              key={it.tempId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--ink-800)',
                padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--ink-700)',
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
                  {exerciseDef?.name}
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
                  value={it.sets}
                  onChange={(e) => onUpdateSets(it.tempId, e.target.value)}
                  style={{ width: '54px', padding: '7px', margin: 0, textAlign: 'center', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>sets</span>
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

      {/* Add extra exercise */}
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
          Add Extra Exercise
        </div>
        <div className="input-group">
          <SearchSelect
            items={exerciseItems}
            selectedId={draftAddWorkoutId}
            onSelect={setDraftAddWorkoutId}
            placeholder="Search exercise… e.g. incline"
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="sets"
            value={draftAddWorkoutSets}
            onChange={(e) => setDraftAddWorkoutSets(e.target.value)}
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
        <Check size={17} /> CONFIRM &amp; LOG WORKOUT
      </button>
    </div>
  </div>
);

export default DraftWorkoutReview;

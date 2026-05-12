import { X, Plus, Check } from 'lucide-react';
import { workoutDatabase } from '../data';
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Review: {draftWorkout.name}</h2>
        <button onClick={onCancel} style={{ background: 'transparent', padding: 0, width: 'auto', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {draftWorkout.items.map((it) => {
          const exerciseDef = workoutDatabase.find((w) => w.id === it.exerciseId);
          return (
            <div key={it.tempId} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {exerciseDef?.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary-color)', marginTop: 2 }}>
                  {Math.round((exerciseDef?.calPerSet || 0) * (it.sets || 0))} kcal
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <input
                  type="number"
                  value={it.sets}
                  onChange={(e) => onUpdateSets(it.tempId, e.target.value)}
                  style={{ width: '54px', padding: '7px', margin: 0, textAlign: 'center', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>sets</span>
                <button onClick={() => onRemoveItem(it.tempId)} style={{ background: 'rgba(239,68,68,0.2)', padding: '7px', width: 'auto', borderRadius: '8px', color: '#ef4444' }}>
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add extra exercise */}
      <form onSubmit={onAddItem} style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>Add Extra Exercise</h3>
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
          <button type="submit" style={{ width: 'auto', padding: '12px 18px', flexShrink: 0, background: 'var(--surface-border)', color: 'var(--text-primary)' }}>
            <Plus size={18} />
          </button>
        </div>
      </form>

      <button onClick={onConfirm} style={{ background: 'var(--primary-color)', color: 'white' }}>
        <Check size={18} /> Confirm &amp; Log Workout
      </button>
    </div>
  </div>
);

export default DraftWorkoutReview;

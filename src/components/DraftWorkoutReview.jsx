import { X, Plus, Check } from 'lucide-react';
import { workoutDatabase } from '../data';

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
        <button
          onClick={onCancel}
          style={{ background: 'transparent', padding: 0, width: 'auto', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {draftWorkout.items.map((it) => {
          const exerciseDef = workoutDatabase.find((w) => w.id === it.exerciseId);
          return (
            <div
              key={it.tempId}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}
            >
              <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>
                {exerciseDef?.name}
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginTop: 2 }}>
                  {Math.round((exerciseDef?.calPerSet || 0) * (it.sets || 0))} kcal total
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={it.sets}
                  onChange={(e) => onUpdateSets(it.tempId, e.target.value)}
                  style={{ width: '60px', padding: '8px', margin: 0, textAlign: 'center' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>sets</span>
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

      <form
        onSubmit={onAddItem}
        style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px', marginBottom: '24px' }}
      >
        <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>Add Extra Exercise</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
            <select value={draftAddWorkoutId} onChange={(e) => setDraftAddWorkoutId(e.target.value)}>
              {workoutDatabase.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="number"
              placeholder="sets"
              value={draftAddWorkoutSets}
              onChange={(e) => setDraftAddWorkoutSets(e.target.value)}
            />
          </div>
          <button type="submit" style={{ width: 'auto', padding: '12px 16px', background: 'var(--surface-border)', color: 'var(--text-primary)' }}>
            <Plus size={20} />
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

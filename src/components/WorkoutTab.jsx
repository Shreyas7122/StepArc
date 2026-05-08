import { Dumbbell, ChevronRight, Footprints, Plus } from 'lucide-react';
import { fixedWorkouts, workoutDatabase, STEP_CALORIES_MULTIPLIER } from '../data';

const WorkoutTab = ({
  onStartQuickLogWorkout,
  stepsInput,
  setStepsInput,
  onUpdateSteps,
  selectedWorkoutId,
  setSelectedWorkoutId,
  workoutSets,
  setWorkoutSets,
  onAddWorkout,
}) => (
  <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div className="glass-card">
      <div className="status-header" style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>
        <Dumbbell size={18} />
        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Quick Log Gym Routine</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {fixedWorkouts.map((workout, idx) => (
          <button
            key={idx}
            className="secondary"
            onClick={() => onStartQuickLogWorkout(workout)}
            style={{ justifyContent: 'space-between', padding: '12px 16px', fontWeight: '500' }}
          >
            <span>{workout.name}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
    </div>

    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>or log manually</div>

    <form onSubmit={onUpdateSteps} className="glass-card">
      <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Daily Steps</h2>
      <div className="input-group">
        <label>Total Steps Today</label>
        <input
          type="number"
          placeholder="e.g. 14000"
          value={stepsInput}
          onChange={(e) => setStepsInput(e.target.value)}
          min="0"
        />
      </div>
      {stepsInput && (
        <div style={{ marginBottom: '16px', color: 'var(--primary-color)', fontSize: '0.875rem' }}>
          Est. Burn: {Math.round(Number(stepsInput) * STEP_CALORIES_MULTIPLIER)} kcal
        </div>
      )}
      <button type="submit" style={{ background: '#38bdf8' }}>
        <Footprints size={18} /> Update Steps
      </button>
    </form>

    <form onSubmit={onAddWorkout} className="glass-card">
      <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Single Exercise</h2>
      <div className="input-group">
        <label>Select Exercise / Cardio</label>
        <select value={selectedWorkoutId} onChange={(e) => setSelectedWorkoutId(e.target.value)}>
          {workoutDatabase.map((w) => (
            <option key={w.id} value={w.id}>{w.name} (~{w.calPerSet} kcal/set)</option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label>Number of Sets (or 1 for Cardio)</label>
        <input
          type="number"
          placeholder="e.g. 4"
          value={workoutSets}
          onChange={(e) => setWorkoutSets(e.target.value)}
          min="1"
        />
      </div>
      {selectedWorkoutId && workoutSets && (
        <div style={{ marginBottom: '16px', color: 'var(--primary-color)', fontSize: '0.875rem' }}>
          Est. Burn: {Math.round(workoutDatabase.find((w) => w.id === Number(selectedWorkoutId)).calPerSet * Number(workoutSets))} kcal
        </div>
      )}
      <button type="submit">
        <Plus size={18} /> Log Exercise
      </button>
    </form>
  </div>
);

export default WorkoutTab;

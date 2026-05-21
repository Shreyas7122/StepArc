import { Dumbbell, ChevronRight, Footprints, Plus } from 'lucide-react';
import { fixedWorkouts, workoutDatabase, STEP_CALORIES_MULTIPLIER } from '../data';
import SearchSelect from './SearchSelect';
import CardioAIInput from './CardioAIInput';

const toQuickWorkout = (day) => ({
  name: day.name || 'Unnamed Day',
  items: (day.items || []).map(it => ({ exerciseId: it.exerciseId, sets: it.sets })),
});

const exerciseItems = workoutDatabase.map(w => ({
  id: w.id,
  label: w.name,
  sub: `~${w.calPerSet} kcal/set`,
}));

const SectionLabel = ({ children }) => (
  <div
    style={{
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: '0.58rem',
      textTransform: 'uppercase',
      letterSpacing: '0.26em',
      color: 'var(--yellow-500)',
      marginBottom: '4px',
      display: 'flex', alignItems: 'center', gap: '5px',
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{
    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900,
    fontSize: '1.55rem', textTransform: 'uppercase', letterSpacing: '-0.01em',
    color: 'var(--white)', lineHeight: 1,
  }}>
    {children}
  </div>
);

const WorkoutTab = ({
  onStartQuickLogWorkout,
  stepsInput, setStepsInput, onUpdateSteps,
  selectedWorkoutId, setSelectedWorkoutId,
  workoutSets, setWorkoutSets, onAddWorkout,
  onLogCardio,
  customDays,
  stepGoal,
  steps,
}) => {
  const selectedExercise = workoutDatabase.find(w => w.id === Number(selectedWorkoutId));
  const quickWorkouts = customDays?.length
    ? customDays.filter(d => d.items?.length > 0).map(toQuickWorkout)
    : fixedWorkouts;
  const stepTarget = stepGoal || 10000;

  return (
    <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Quick Log Gym Routine */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <SectionLabel><Dumbbell size={10} />01 · QUICK LOG</SectionLabel>
            <SectionTitle>Gym Routine</SectionTitle>
          </div>
          <span style={{
            background: 'var(--yellow-500)', color: 'var(--black)',
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '3px 10px', borderRadius: 'var(--r-pill)',
          }}>QUICK</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {quickWorkouts.map((workout, idx) => (
            <button
              key={idx}
              onClick={() => onStartQuickLogWorkout(workout)}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', width: '100%',
                background: 'var(--ink-800)',
                border: 'none',
                borderLeft: '3px solid var(--yellow-500)',
                borderRadius: '0 var(--r-md) var(--r-md) 0',
                padding: '12px 14px', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,194,13,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-800)')}
            >
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--white)' }}>
                {workout.name}
              </span>
              <ChevronRight size={14} color="var(--yellow-500)" />
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--ink-700)' }} />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--gray-400)' }}>
          or log manually
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--ink-700)' }} />
      </div>

      {/* AI Cardio */}
      <CardioAIInput onLogCardio={onLogCardio} />

      {/* Single Exercise */}
      <form onSubmit={onAddWorkout} className="glass-card">
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel><Dumbbell size={10} />02 · SINGLE EXERCISE</SectionLabel>
          <SectionTitle>Log Exercise</SectionTitle>
        </div>
        <div className="input-group">
          <label>Exercise</label>
          <SearchSelect
            items={exerciseItems}
            selectedId={selectedWorkoutId}
            onSelect={setSelectedWorkoutId}
            placeholder="Search exercise… e.g. incline"
          />
        </div>
        <div className="input-group">
          <label>Number of Sets</label>
          <input
            type="number"
            placeholder="e.g. 4"
            value={workoutSets}
            onChange={(e) => setWorkoutSets(e.target.value)}
            min="1"
          />
        </div>
        {selectedExercise && workoutSets && Number(workoutSets) > 0 && (
          <div
            style={{
              marginBottom: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              color: 'var(--yellow-500)',
              fontWeight: 600,
            }}
          >
            Est. Burn: {Math.round(selectedExercise.calPerSet * Number(workoutSets))} kcal
          </div>
        )}
        <button type="submit">
          <Plus size={17} /> LOG EXERCISE
        </button>
      </form>

      {/* Daily Steps */}
      <form onSubmit={onUpdateSteps} className="glass-card">
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel><Footprints size={10} />03 · DAILY STEPS</SectionLabel>
          <SectionTitle>Step Count</SectionTitle>
        </div>
        {steps > 0 && (
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(244,194,13,0.06)', border: '1px solid rgba(244,194,13,0.15)', borderRadius: 'var(--r-md)' }}>
            <Footprints size={13} color="var(--yellow-500)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
              Logged today:&nbsp;
              <span style={{ color: 'var(--yellow-500)', fontWeight: 700 }}>{steps.toLocaleString()}</span>
              &nbsp;steps
            </span>
            <button
              type="button"
              onClick={() => setStepsInput(String(steps))}
              style={{ marginLeft: 'auto', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow-500)', background: 'transparent', border: '1px solid rgba(244,194,13,0.25)', borderRadius: 'var(--r-md)', padding: '3px 8px', cursor: 'pointer' }}
            >
              Edit
            </button>
          </div>
        )}
        <div className="input-group">
          <label>{steps > 0 ? 'Update Step Count' : 'Total Steps Today'}</label>
          <input
            type="number"
            placeholder="e.g. 14000"
            value={stepsInput}
            onChange={(e) => setStepsInput(e.target.value)}
            min="0"
            style={{ borderColor: stepsInput ? 'rgba(244,194,13,0.4)' : undefined }}
          />
        </div>
        {stepsInput && Number(stepsInput) > 0 && (
          <>
            <div
              style={{
                marginBottom: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                color: 'var(--gray-400)',
                fontWeight: 600,
              }}
            >
              Est. Burn: <span style={{ color: 'var(--yellow-500)' }}>{Math.round(Number(stepsInput) * STEP_CALORIES_MULTIPLIER)} kcal</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'var(--ink-800)', borderRadius: 'var(--r-pill)', overflow: 'hidden', marginBottom: '14px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (Number(stepsInput) / stepTarget) * 100)}%`,
                  background: 'var(--gradient-cta)',
                  borderRadius: 'var(--r-pill)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </>
        )}
        <button type="submit">
          <Footprints size={17} /> UPDATE STEPS
        </button>
      </form>

    </div>
  );
};

export default WorkoutTab;

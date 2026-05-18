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

const WorkoutTab = ({
  onStartQuickLogWorkout,
  stepsInput, setStepsInput, onUpdateSteps,
  selectedWorkoutId, setSelectedWorkoutId,
  workoutSets, setWorkoutSets, onAddWorkout,
  onLogCardio,
  customDays,
  stepGoal,
}) => {
  const selectedExercise = workoutDatabase.find(w => w.id === Number(selectedWorkoutId));
  const quickWorkouts = customDays?.length
    ? customDays.filter(d => d.items?.length > 0).map(toQuickWorkout)
    : fixedWorkouts;
  const stepTarget = stepGoal || 10000;

  return (
    <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Quick Log Gym Routine — hero-tinted dark card */}
      <div
        style={{
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--r-xl)',
          padding: '20px',
          boxShadow: 'var(--shadow-lift)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 30%, rgba(168,85,247,0.3) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Dumbbell size={16} color="var(--gold-500)" />
            <SectionLabel>01 · QUICK LOG</SectionLabel>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--white)', marginBottom: '14px' }}>
            Gym Routine
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quickWorkouts.map((workout, idx) => (
              <button
                key={idx}
                onClick={() => onStartQuickLogWorkout(workout)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: 'rgba(10,6,18,0.5)',
                  border: 'none',
                  borderLeft: '3px solid var(--gold-500)',
                  borderRadius: '0 var(--r-md) var(--r-md) 0',
                  padding: '11px 14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,184,0,0.1)';
                  e.currentTarget.style.boxShadow = 'var(--glow-gold)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(10,6,18,0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--white)' }}>
                  {workout.name}
                </span>
                <ChevronRight size={14} color="var(--gold-500)" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,184,0,0.15)' }} />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,184,0,0.5)' }}>
          or log manually
        </span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,184,0,0.15)' }} />
      </div>

      {/* AI Cardio */}
      <CardioAIInput onLogCardio={onLogCardio} />

      {/* Single Exercise */}
      <form onSubmit={onAddWorkout} className="glass-card">
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel><Dumbbell size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />02 · SINGLE EXERCISE</SectionLabel>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--white)' }}>
            Log Exercise
          </div>
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
              color: 'var(--gold-500)',
              fontWeight: 600,
              textShadow: 'var(--glow-gold)',
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
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.26em', color: '#38bdf8', marginBottom: '4px' }}>
            <Footprints size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
            03 · DAILY STEPS
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--white)' }}>
            Step Count
          </div>
        </div>
        <div className="input-group">
          <label>Total Steps Today</label>
          <input
            type="number"
            placeholder="e.g. 14000"
            value={stepsInput}
            onChange={(e) => setStepsInput(e.target.value)}
            min="0"
            style={{ borderColor: stepsInput ? 'rgba(56,189,248,0.4)' : undefined }}
          />
        </div>
        {stepsInput && Number(stepsInput) > 0 && (
          <>
            <div
              style={{
                marginBottom: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                color: '#38bdf8',
                fontWeight: 600,
                textShadow: '0 0 12px rgba(56,189,248,0.5)',
              }}
            >
              Est. Burn: <span style={{ color: 'var(--gold-500)' }}>{Math.round(Number(stepsInput) * STEP_CALORIES_MULTIPLIER)} kcal</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(56,189,248,0.12)', borderRadius: 'var(--r-pill)', overflow: 'hidden', marginBottom: '14px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (Number(stepsInput) / stepTarget) * 100)}%`,
                  background: 'linear-gradient(90deg, #38bdf8 0%, #7dd3fc 100%)',
                  borderRadius: 'var(--r-pill)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </>
        )}
        <button
          type="submit"
          style={{
            background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
            color: '#0A0612',
            borderRadius: 'var(--r-pill)',
          }}
        >
          <Footprints size={17} /> UPDATE STEPS
        </button>
      </form>

    </div>
  );
};

export default WorkoutTab;

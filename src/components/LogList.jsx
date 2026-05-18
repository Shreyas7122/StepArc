import { X, Edit2, Check, Timer, Utensils, Dumbbell } from 'lucide-react';
import { useState } from 'react';
import { foodDatabase, workoutDatabase, cardioDatabase } from '../data';

const SectionLabel = ({ color, icon, text }) => (
  <div
    style={{
      fontFamily: 'var(--font-heading)',
      fontWeight: 600,
      fontSize: '0.6rem',
      textTransform: 'uppercase',
      letterSpacing: '0.26em',
      color: color,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '4px',
    }}
  >
    {icon}
    {text}
  </div>
);

const SectionTitle = ({ text }) => (
  <div
    style={{
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--white)',
      marginBottom: '12px',
    }}
  >
    {text}
  </div>
);

const emptyStyle = {
  color: 'var(--gray-500)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  fontStyle: 'italic',
};

const MonoBadge = ({ color, children }) => (
  <span
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '0.65rem',
      fontWeight: 600,
      color: color,
      background: `${color}18`,
      border: `1px solid ${color}33`,
      borderRadius: 'var(--r-pill)',
      padding: '2px 7px',
    }}
  >
    {children}
  </span>
);

const GhostIconBtn = ({ onClick, children, danger }) => (
  <button
    onClick={onClick}
    style={{
      padding: '5px',
      width: 'auto',
      background: danger ? 'rgba(239,68,68,0.1)' : 'transparent',
      color: danger ? '#ef4444' : 'var(--gray-500)',
      borderRadius: 'var(--r-md)',
      border: danger ? '1px solid rgba(239,68,68,0.18)' : '1px solid transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'background 0.15s, color 0.15s',
    }}
  >
    {children}
  </button>
);

const LogList = ({
  foodLogs, workoutLogs, cardioLogs,
  onUpdateFoodLog, onDeleteFoodLog,
  onUpdateWorkoutLog, onDeleteWorkoutLog,
  onDeleteCardioLog,
}) => {
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editFoodAmount, setEditFoodAmount] = useState('');
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [editWorkoutSets, setEditWorkoutSets] = useState('');

  const saveEditFood = (logId) => {
    onUpdateFoodLog(logId, Number(editFoodAmount));
    setEditingFoodId(null);
  };

  const saveEditWorkout = (logId) => {
    onUpdateWorkoutLog(logId, Number(editWorkoutSets));
    setEditingWorkoutId(null);
  };

  return (
    <div className="animate-slide-up delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>

      {/* Food Logs */}
      <div className="glass-card">
        <SectionLabel color="var(--gold-500)" icon={<Utensils size={12} color="var(--gold-500)" />} text="TODAY'S FOOD" />
        <SectionTitle text="Food Log" />
        {foodLogs.length === 0 ? (
          <div style={emptyStyle}>No food logged yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {foodLogs.map(log => {
              const isAI = !!log.aiMacros;
              const isEditing = !isAI && editingFoodId === log.id;
              const foodItem = isAI ? null : foodDatabase.find(f => f.id === log.foodId);
              const cal = isAI
                ? Math.round(log.aiMacros.calories)
                : foodItem ? Math.round((foodItem.calories * log.amount) / 100) : 0;

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(10,6,18,0.4)',
                    padding: '10px 12px 10px 14px',
                    borderRadius: 'var(--r-md)',
                    borderLeft: '3px solid var(--gold-500)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderLeftWidth: 3,
                    borderLeftColor: 'var(--gold-500)',
                    borderLeftStyle: 'solid',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--white)' }}>
                        {log.name || foodItem?.name}
                      </span>
                      {isAI && (
                        <MonoBadge color="var(--gold-500)">AI</MonoBadge>
                      )}
                    </div>
                    {!isEditing && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: 4 }}>
                        {isAI ? (
                          <>
                            <MonoBadge color="var(--protein-color)">P {log.aiMacros.protein.toFixed(1)}g</MonoBadge>
                            <MonoBadge color="var(--carbs-color)">C {log.aiMacros.carbs.toFixed(1)}g</MonoBadge>
                            <MonoBadge color="var(--fats-color)">F {log.aiMacros.fats.toFixed(1)}g</MonoBadge>
                            <MonoBadge color="var(--gold-500)">{cal} kcal</MonoBadge>
                          </>
                        ) : (
                          <>
                            <MonoBadge color="var(--gray-500)">{log.amount}g</MonoBadge>
                            <MonoBadge color="var(--gold-500)">{cal} kcal</MonoBadge>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        value={editFoodAmount}
                        onChange={e => setEditFoodAmount(e.target.value)}
                        style={{ width: 70, padding: '6px', margin: 0, fontSize: '0.9rem' }}
                        autoFocus
                      />
                      <GhostIconBtn onClick={() => saveEditFood(log.id)}>
                        <Check size={13} color="var(--gold-500)" />
                      </GhostIconBtn>
                      <GhostIconBtn onClick={() => setEditingFoodId(null)}>
                        <X size={13} />
                      </GhostIconBtn>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {!isAI && (
                        <GhostIconBtn onClick={() => { setEditingFoodId(log.id); setEditFoodAmount(log.amount); }}>
                          <Edit2 size={14} />
                        </GhostIconBtn>
                      )}
                      <GhostIconBtn onClick={() => onDeleteFoodLog(log.id)} danger>
                        <X size={14} />
                      </GhostIconBtn>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cardio Logs */}
      <div className="glass-card">
        <SectionLabel color="#38bdf8" icon={<Timer size={12} color="#38bdf8" />} text="TODAY'S CARDIO" />
        <SectionTitle text="Cardio Log" />
        {cardioLogs.length === 0 ? (
          <div style={emptyStyle}>No cardio logged yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cardioLogs.map(log => {
              const cal = log.aiCalories
                ? Math.round(log.aiCalories)
                : (() => {
                    const item = cardioDatabase.find(c => c.id === log.cardioId);
                    return item ? Math.round(item.calPerMin * log.durationMins) : 0;
                  })();
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(10,6,18,0.4)',
                    padding: '10px 12px',
                    borderRadius: 'var(--r-md)',
                    borderLeft: '3px solid #38bdf8',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderLeftWidth: 3,
                    borderLeftColor: '#38bdf8',
                    borderLeftStyle: 'solid',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--white)', marginBottom: 4 }}>
                      {log.name}
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <MonoBadge color="var(--gray-500)">{log.durationMins} min</MonoBadge>
                      <MonoBadge color="#38bdf8">{cal} kcal burned</MonoBadge>
                    </div>
                  </div>
                  <GhostIconBtn onClick={() => onDeleteCardioLog(log.id)} danger>
                    <X size={14} />
                  </GhostIconBtn>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workout Logs */}
      <div className="glass-card">
        <SectionLabel color="var(--purple-300)" icon={<Dumbbell size={12} color="var(--purple-300)" />} text="TODAY'S WORKOUT" />
        <SectionTitle text="Workout Log" />
        {workoutLogs.length === 0 ? (
          <div style={emptyStyle}>No workout logged yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {workoutLogs.map(log => {
              const isEditing = editingWorkoutId === log.id;
              const workoutItem = workoutDatabase.find(w => w.id === log.workoutId);
              const cal = workoutItem ? Math.round(workoutItem.calPerSet * log.sets) : 0;
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(10,6,18,0.4)',
                    padding: '10px 12px',
                    borderRadius: 'var(--r-md)',
                    borderLeft: '3px solid var(--purple-400)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderLeftWidth: 3,
                    borderLeftColor: 'var(--purple-400)',
                    borderLeftStyle: 'solid',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--white)', marginBottom: 4 }}>
                      {workoutItem?.name}
                    </div>
                    {!isEditing && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <MonoBadge color="var(--purple-300)">{log.sets} sets</MonoBadge>
                        <MonoBadge color="var(--gold-500)">{cal} kcal burned</MonoBadge>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        value={editWorkoutSets}
                        onChange={e => setEditWorkoutSets(e.target.value)}
                        style={{ width: 60, padding: '6px', margin: 0, fontSize: '0.9rem' }}
                        autoFocus
                      />
                      <GhostIconBtn onClick={() => saveEditWorkout(log.id)}>
                        <Check size={13} color="var(--gold-500)" />
                      </GhostIconBtn>
                      <GhostIconBtn onClick={() => setEditingWorkoutId(null)}>
                        <X size={13} />
                      </GhostIconBtn>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <GhostIconBtn onClick={() => { setEditingWorkoutId(log.id); setEditWorkoutSets(log.sets); }}>
                        <Edit2 size={14} />
                      </GhostIconBtn>
                      <GhostIconBtn onClick={() => onDeleteWorkoutLog(log.id)} danger>
                        <X size={14} />
                      </GhostIconBtn>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default LogList;

import { X, Edit2, Check } from 'lucide-react';
import { useState } from 'react';
import { foodDatabase, workoutDatabase } from '../data';

const LogList = ({ foodLogs, workoutLogs, onUpdateFoodLog, onDeleteFoodLog, onUpdateWorkoutLog, onDeleteWorkoutLog }) => {
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editFoodAmount, setEditFoodAmount] = useState('');

  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [editWorkoutSets, setEditWorkoutSets] = useState('');

  const startEditFood = (log) => {
    setEditingFoodId(log.id);
    setEditFoodAmount(log.amount);
  };

  const saveEditFood = (logId) => {
    onUpdateFoodLog(logId, Number(editFoodAmount));
    setEditingFoodId(null);
  };

  const startEditWorkout = (log) => {
    setEditingWorkoutId(log.id);
    setEditWorkoutSets(log.sets);
  };

  const saveEditWorkout = (logId) => {
    onUpdateWorkoutLog(logId, Number(editWorkoutSets));
    setEditingWorkoutId(null);
  };

  return (
    <div className="animate-slide-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '8px' }}>
      
      {/* Food Logs */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Today's Food</h3>
        {foodLogs.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No food logged yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {foodLogs.map(log => {
              const isAI = !!log.aiMacros;
              const isEditing = !isAI && editingFoodId === log.id;
              const foodItem = isAI ? null : foodDatabase.find(f => f.id === log.foodId);
              const cal = isAI
                ? Math.round(log.aiMacros.calories)
                : foodItem ? Math.round((foodItem.calories * log.amount) / 100) : 0;
              const displayName = log.name || foodItem?.name;

              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{displayName}</span>
                      {isAI && <span style={{ fontSize: '0.6rem', background: 'rgba(99,102,241,0.2)', color: 'var(--primary-color)', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>AI</span>}
                    </div>
                    {!isEditing && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {isAI
                          ? <>P {log.aiMacros.protein.toFixed(1)}g · C {log.aiMacros.carbs.toFixed(1)}g · F {log.aiMacros.fats.toFixed(1)}g · <span style={{ color: 'var(--calories-color)' }}>{cal} kcal</span></>
                          : <>{log.amount}g · <span style={{ color: 'var(--calories-color)' }}>{cal} kcal</span></>
                        }
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        value={editFoodAmount}
                        onChange={(e) => setEditFoodAmount(e.target.value)}
                        style={{ width: '70px', padding: '6px', margin: 0, fontSize: '0.9rem' }}
                        autoFocus
                      />
                      <button onClick={() => saveEditFood(log.id)} style={{ padding: '6px', width: 'auto', background: '#10b981' }}><Check size={14} /></button>
                      <button onClick={() => setEditingFoodId(null)} style={{ padding: '6px', width: 'auto', background: 'var(--surface-border)' }}><X size={14} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!isAI && <button onClick={() => startEditFood(log)} style={{ padding: '6px', width: 'auto', background: 'transparent', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>}
                      <button onClick={() => onDeleteFoodLog(log.id)} style={{ padding: '6px', width: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><X size={16} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workout Logs */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Today's Workout</h3>
        {workoutLogs.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No workout logged yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {workoutLogs.map(log => {
              const isEditing = editingWorkoutId === log.id;
              const workoutItem = workoutDatabase.find(w => w.id === log.workoutId);
              const cal = workoutItem ? Math.round(workoutItem.calPerSet * log.sets) : 0;

              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{workoutItem?.name}</div>
                    {!isEditing && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.sets} sets • <span style={{ color: 'var(--primary-color)' }}>{cal} kcal burned</span></div>}
                  </div>
                  
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="number" 
                        value={editWorkoutSets} 
                        onChange={(e) => setEditWorkoutSets(e.target.value)} 
                        style={{ width: '60px', padding: '6px', margin: 0, fontSize: '0.9rem' }} 
                        autoFocus
                      />
                      <button onClick={() => saveEditWorkout(log.id)} style={{ padding: '6px', width: 'auto', background: 'var(--primary-color)' }}><Check size={14} /></button>
                      <button onClick={() => setEditingWorkoutId(null)} style={{ padding: '6px', width: 'auto', background: 'var(--surface-border)' }}><X size={14} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => startEditWorkout(log)} style={{ padding: '6px', width: 'auto', background: 'transparent', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                      <button onClick={() => onDeleteWorkoutLog(log.id)} style={{ padding: '6px', width: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><X size={16} /></button>
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

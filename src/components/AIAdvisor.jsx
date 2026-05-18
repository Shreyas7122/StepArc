import { Brain, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';
import { foodDatabase, workoutDatabase, STEP_CALORIES_MULTIPLIER } from '../data';
import { getApiBase } from '../utils';

const statusMeta = {
  on_track: { color: 'var(--gold-500)', bg: 'rgba(255,184,0,0.12)', border: 'rgba(255,184,0,0.25)', label: 'On Track' },
  over:     { color: '#ef4444',          bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  label: 'Over Goal' },
  under:    { color: '#f59e0b',          bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'Under Goal' },
};

const AIAdvisor = ({ foodLogs, workoutLogs, cardioLogs, steps, totals, userProfile, goals }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const [open, setOpen]       = useState(false);
  const [fridgeItems, setFridgeItems] = useState('');

  const buildFoodText = () => {
    if (!foodLogs.length) return 'None';
    return foodLogs.map(log => {
      if (log.aiMacros) return `${log.name} (${Math.round(log.aiMacros.calories)} kcal, P${log.aiMacros.protein.toFixed(0)}g C${log.aiMacros.carbs.toFixed(0)}g F${log.aiMacros.fats.toFixed(0)}g)`;
      const item = foodDatabase.find(f => f.id === log.foodId);
      if (!item) return log.name || 'Unknown';
      const cal = Math.round((item.calories * log.amount) / 100);
      return `${item.name} ${log.amount}g (${cal} kcal)`;
    }).join('\n');
  };

  const buildWorkoutText = () => {
    const exercises = workoutLogs.map(log => {
      const item = workoutDatabase.find(w => w.id === log.workoutId);
      if (!item) return null;
      return `${item.name} × ${log.sets} sets (~${Math.round(item.calPerSet * log.sets)} kcal)`;
    }).filter(Boolean);

    const cardio = cardioLogs.map(log => {
      const cal = log.aiCalories ? Math.round(log.aiCalories) : 0;
      return `${log.name} ${log.durationMins} min (~${cal} kcal)`;
    });

    const all = [...exercises, ...cardio];
    return all.length ? all.join('\n') : 'None';
  };

  const handleGetAdvice = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setOpen(true);

    const workoutCal = workoutLogs.reduce((acc, log) => {
      const item = workoutDatabase.find(w => w.id === log.workoutId);
      return acc + (item ? item.calPerSet * log.sets : 0);
    }, 0) + cardioLogs.reduce((acc, log) => acc + (log.aiCalories || 0), 0);

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/ai-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age:              userProfile.age,
          height_cm:        userProfile.heightCm,
          weight_kg:        userProfile.weightKg,
          goal_calories:    goals.calories,
          goal_protein:     goals.protein,
          goal_carbs:       goals.carbs,
          goal_fat:         goals.fats,
          calories_eaten:   totals.calIn,
          protein_eaten:    totals.p,
          carbs_eaten:      totals.c,
          fat_eaten:        totals.f,
          steps,
          steps_calories:   Math.round(steps * STEP_CALORIES_MULTIPLIER),
          workout_calories: Math.round(workoutCal),
          food_log_text:    buildFoodText(),
          workout_log_text: buildWorkoutText(),
          fridge_items:     fridgeItems.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      setResult(await res.json());
    } catch (err) {
      const msg = err.message;
      setError(
        msg.includes('fetch') || msg.includes('NetworkError')
          ? 'Cannot reach the AI server. Check your connection or try again later.'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const meta = result ? (statusMeta[result.status] || statusMeta.on_track) : null;

  return (
    <div style={{ marginTop: '4px' }}>

      {/* Fridge items input */}
      <div
        className="glass-card"
        style={{
          border: '1px solid rgba(168,85,247,0.15)',
          padding: '14px 16px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gold-500)' }}>
            What's in your fridge? (optional)
          </span>
        </div>
        <textarea
          placeholder="e.g. chicken, rice, broccoli, eggs..."
          value={fridgeItems}
          onChange={e => setFridgeItems(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(10,6,18,0.7)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--r-md)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--white)',
            outline: 'none',
            minHeight: '60px',
            resize: 'vertical',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(255,184,0,0.4)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
      </div>

      {/* Trigger card */}
      <div
        className="glass-card"
        style={{
          border: '1px solid rgba(168,85,247,0.2)',
          padding: '14px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={18} color="var(--purple-300)" />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--gold-500)',
                  marginBottom: '2px',
                }}
              >
                AI ADVISOR
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  color: 'var(--gray-500)',
                }}
              >
                Remaining food &amp; what to cut — Gemini
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGetAdvice}
            disabled={loading}
            style={{
              width: 'auto',
              padding: '9px 16px',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: loading ? 'rgba(255,255,255,0.08)' : 'var(--gradient-cta)',
              color: loading ? 'var(--white)' : 'var(--purple-900)',
              borderRadius: 'var(--r-pill)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {loading ? <span className="spinner" /> : <><Brain size={13} /> ASK GEMINI</>}
          </button>
        </div>
      </div>

      {/* Result panel */}
      {open && (result || error || loading) && (
        <div
          className="glass-card"
          style={{ border: '1px solid rgba(168,85,247,0.22)', marginTop: '10px' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={15} color="var(--purple-300)" />
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--white)',
                }}
              >
                Gemini's Advice
              </span>
              {result && meta && (
                <span
                  style={{
                    fontSize: '0.6rem',
                    background: meta.bg,
                    color: meta.color,
                    border: `1px solid ${meta.border}`,
                    padding: '2px 8px',
                    borderRadius: 'var(--r-pill)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {meta.label}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ width: 'auto', padding: '6px', background: 'transparent', color: 'var(--gray-500)', borderRadius: 'var(--r-md)' }}
            >
              <X size={16} />
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)', fontSize: '0.85rem' }}>
              <span className="spinner" style={{ display: 'inline-block', marginBottom: '10px' }} />
              <br />Analysing your day…
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--r-md)',
                color: '#ef4444',
                fontSize: '0.82rem',
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <>
              {/* Summary */}
              <div
                style={{
                  padding: '12px 14px',
                  background: 'rgba(10,6,18,0.4)',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  marginBottom: '14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  lineHeight: 1.65,
                  color: 'var(--gray-300)',
                }}
              >
                {result.summary}
              </div>

              {/* Remaining macros */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
                {[
                  { label: 'Cal left', value: Math.round(result.remaining_macros.calories), color: 'var(--gold-500)', unit: 'kcal' },
                  { label: 'Protein',  value: `${Math.round(result.remaining_macros.protein_g)}g`, color: 'var(--protein-color)', unit: '' },
                  { label: 'Carbs',    value: `${Math.round(result.remaining_macros.carbs_g)}g`,   color: 'var(--carbs-color)',   unit: '' },
                  { label: 'Fat',      value: `${Math.round(result.remaining_macros.fat_g)}g`,     color: 'var(--fats-color)',    unit: '' },
                ].map(m => (
                  <div
                    key={m.label}
                    style={{
                      textAlign: 'center',
                      padding: '8px 4px',
                      background: 'rgba(10,6,18,0.4)',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: m.color, lineHeight: 1 }}>{m.value}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem', color: 'var(--gray-500)', marginTop: '3px' }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#22c55e',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <CheckCircle size={12} /> WHAT TO EAT
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(34,197,94,0.06)',
                          border: '1px solid rgba(34,197,94,0.15)',
                          borderRadius: 'var(--r-md)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.82rem',
                          lineHeight: 1.55,
                          color: 'var(--gray-300)',
                        }}
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#f59e0b',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <AlertTriangle size={12} /> WHAT TO CUT
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.warnings.map((w, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(245,158,11,0.06)',
                          border: '1px solid rgba(245,158,11,0.18)',
                          borderRadius: 'var(--r-md)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.82rem',
                          lineHeight: 1.55,
                          color: 'var(--gray-300)',
                        }}
                      >
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;

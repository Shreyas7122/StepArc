import { useState, useEffect } from 'react';
import { Flame, Footprints } from 'lucide-react';
import { load7DayHistory } from '../services/db';
import { computeTotals } from '../lib/utils';

const HistoryTab = ({ userId, goals }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load7DayHistory(userId).then(data => { setHistory(data); setLoading(false); });
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <span className="spinner" />
      </div>
    );
  }

  const days = history.map(day => ({
    ...day,
    totals: computeTotals(day.food_logs, day.workout_logs, day.cardio_logs, day.steps),
  }));

  const daysWithData = days.filter(d => d.totals.calIn > 0);
  const avgCalIn    = daysWithData.length ? Math.round(daysWithData.reduce((s, d) => s + d.totals.calIn, 0) / daysWithData.length) : 0;
  const avgProtein  = daysWithData.length ? Math.round(daysWithData.reduce((s, d) => s + d.totals.p, 0) / daysWithData.length) : 0;
  const avgSteps    = Math.round(days.reduce((s, d) => s + d.steps, 0) / 7);
  const proteinDays = days.filter(d => d.totals.p >= goals.protein).length;
  const maxCalIn    = Math.max(...days.map(d => d.totals.calIn), 1);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const todayStr = new Date().toISOString().slice(0, 10);
    if (dateStr === todayStr) return 'Today';
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    if (dateStr === yest.toISOString().slice(0, 10)) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const dayAbbr = (dateStr, i) => {
    if (i === 0) return 'TDY';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2).toUpperCase();
  };

  const statChips = [
    { label: 'AVG CALORIES', value: avgCalIn,                  unit: 'kcal',  color: 'var(--gold-500)',      pct: goals.calories ? Math.round((avgCalIn / goals.calories) * 100) : null },
    { label: 'AVG PROTEIN',  value: avgProtein,                unit: 'g',     color: 'var(--protein-color)', pct: goals.protein ? Math.round((avgProtein / goals.protein) * 100) : null },
    { label: 'AVG STEPS',    value: avgSteps.toLocaleString(), unit: 'steps', color: 'var(--yellow-500)',    pct: null },
    { label: 'PROTEIN DAYS', value: `${proteinDays}/7`,        unit: 'on goal', color: '#10b981',            pct: null },
  ];

  return (
    <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* 7-day summary card */}
      <div className="glass-card">
        {/* Section label + title */}
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
          01 · HISTORY
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: '1.55rem',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            color: 'var(--white)',
            lineHeight: 1,
            marginBottom: '20px',
          }}
        >
          7-Day History
        </div>

        {/* Bar chart */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: 72, marginBottom: '6px' }}>
          {days.map((day, i) => {
            const pct = day.totals.calIn / maxCalIn;
            const atGoal = day.totals.calIn >= goals.calories * 0.9;
            const isToday = i === 0;
            const barColor = isToday
              ? 'var(--gradient-cta)'
              : atGoal
                ? 'var(--yellow-500)'
                : 'rgba(113,113,122,0.45)';
            return (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    height: day.totals.calIn === 0 ? 4 : Math.max(8, pct * 64),
                    background: barColor,
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.6s ease',
                    opacity: day.totals.calIn === 0 ? 0.25 : 1,
                    boxShadow: isToday ? 'var(--glow-yellow)' : atGoal ? 'var(--glow-yellow)' : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {days.map((day, i) => (
            <div
              key={day.date}
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: i === 0 ? 'var(--gold-500)' : 'var(--gray-500)',
              }}
            >
              {dayAbbr(day.date, i)}
            </div>
          ))}
        </div>

        {/* Stat chips — pricing-tile style */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {statChips.map(stat => (
            <div
              key={stat.label}
              style={{
                background: 'var(--ink-800)',
                borderRadius: 'var(--r-md)',
                padding: '12px 14px',
                border: '1px solid var(--ink-700)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray-500)' }}>
                  {stat.unit}
                </span>
              </div>
              {stat.pct !== null && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: stat.pct >= 90 ? '#10b981' : 'var(--gray-500)', marginTop: 2 }}>
                  {stat.pct}% of goal
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gray-500)', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-day cards */}
      {days.map((day, i) => {
        const t = day.totals;
        const isEmpty = t.calIn === 0 && day.steps === 0;
        const calPct = goals.calories ? (t.calIn / goals.calories) * 100 : 0;
        const statusColor = isEmpty ? 'var(--gray-500)' : calPct >= 100 ? '#ef4444' : calPct >= 80 ? '#10b981' : 'var(--gold-500)';
        const isToday = i === 0;

        return (
          <div key={day.date} className="glass-card" style={{ opacity: isEmpty ? 0.48 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isEmpty ? 0 : '12px' }}>
              <div>
                {/* Gold "TODAY" pill tag */}
                {isToday && (
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'var(--gradient-cta)',
                      color: 'var(--black)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '0.52rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      padding: '2px 10px',
                      borderRadius: 'var(--r-pill)',
                      marginBottom: '6px',
                    }}
                  >
                    TODAY
                  </span>
                )}
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontSize: '0.88rem',
                    color: isToday ? 'var(--gold-500)' : 'var(--white)',
                    display: isToday ? 'block' : undefined,
                  }}
                >
                  {formatDate(day.date)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--gray-500)', marginTop: 2 }}>{day.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: statusColor, lineHeight: 1 }}>
                  {isEmpty ? '—' : t.calIn}
                </div>
                {!isEmpty && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--gray-500)', marginTop: 2 }}>kcal in</div>}
              </div>
            </div>

            {!isEmpty && (
              <>
                <div className="progress-container" style={{ marginBottom: '12px' }}>
                  <div className="progress-bar" style={{ width: `${Math.min(100, calPct)}%`, background: statusColor }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {[
                    { label: 'P', value: t.p, color: 'var(--protein-color)', goal: goals.protein },
                    { label: 'C', value: t.c, color: 'var(--carbs-color)',   goal: goals.carbs },
                    { label: 'F', value: t.f, color: 'var(--fats-color)',    goal: goals.fats },
                  ].map(m => (
                    <div
                      key={m.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        background: 'var(--ink-800)',
                        borderRadius: 'var(--r-pill)',
                        border: `1px solid ${m.value >= m.goal * 0.9 ? m.color + '44' : 'rgba(255,255,255,0.05)'}`,
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.62rem', color: m.color }}>{m.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>{m.value}g</span>
                    </div>
                  ))}
                  {day.steps > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        background: 'var(--ink-800)',
                        borderRadius: 'var(--r-pill)',
                        border: '1px solid rgba(244,194,13,0.2)',
                      }}
                    >
                      <Footprints size={10} color="var(--yellow-500)" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--yellow-500)' }}>{day.steps.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {t.calOut > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={11} color="var(--gray-400)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.67rem', color: 'var(--gray-500)' }}>
                      Burned <span style={{ color: 'var(--gray-200)' }}>{t.calOut} kcal</span>
                      {' · Net '}
                      <span style={{ color: t.calIn - t.calOut > 0 ? 'var(--gold-500)' : '#10b981' }}>
                        {t.calIn - t.calOut > 0 ? '+' : ''}{t.calIn - t.calOut} kcal
                      </span>
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HistoryTab;

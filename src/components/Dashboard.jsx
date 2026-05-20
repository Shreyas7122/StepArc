import { Flame, Activity, Footprints, TrendingDown } from 'lucide-react';
import { STEP_CALORIES_MULTIPLIER } from '../data';

const Dashboard = ({ totals, steps, goals }) => {
  const calsLeft = goals.calories - totals.calIn;
  const isOver   = calsLeft < 0;

  const macros = [
    { label: 'Protein', value: totals.p,              goal: goals.protein, color: 'var(--protein-color)', unit: 'g' },
    { label: 'Carbs',   value: totals.c,              goal: goals.carbs,   color: 'var(--carbs-color)',   unit: 'g' },
    { label: 'Fats',    value: totals.f,              goal: goals.fats,    color: 'var(--fats-color)',     unit: 'g' },
    { label: 'Fibre',   value: totals.fibre || 0,     goal: goals.fibre,   color: 'var(--fibre-color)',    unit: 'g' },
  ];

  return (
    <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Hero calorie balance card */}
      <div
        style={{
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--r-xl)',
          padding: '24px 20px 20px',
          boxShadow: 'var(--shadow-lift)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(168,85,247,0.4) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Eyebrow label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <TrendingDown size={13} color={isOver ? '#ef4444' : 'var(--gold-400)'} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: isOver ? '#ef4444' : 'var(--gold-400)' }}>
              {isOver ? 'OVER GOAL' : 'CALORIES LEFT'}
            </span>
          </div>

          {/* Big number */}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', lineHeight: 1, color: isOver ? '#ef4444' : 'var(--gold-500)', marginBottom: '4px' }}>
            {isOver ? `+${Math.abs(calsLeft)}` : calsLeft}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
            kcal · target {goals.calories}
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--r-pill)', overflow: 'hidden', marginBottom: '12px' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (totals.calIn / goals.calories) * 100)}%`,
                background: isOver ? '#ef4444' : 'var(--gradient-cta)',
                borderRadius: 'var(--r-pill)',
                transition: 'width 0.6s ease',
              }}
            />
          </div>

          {/* BMR breakdown chips */}
          {goals.bmr > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { label: 'BMR',      value: `${goals.bmr.toLocaleString()} kcal` },
                { label: 'Base goal',value: `${goals.baseGoal.toLocaleString()} kcal` },
                { label: 'Activity', value: `+${goals.activityBurn} kcal` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.07)' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.75)' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2-column: Consumed + Burned */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={13} color="var(--gold-500)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--gold-500)' }}>CONSUMED</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--gold-500)', lineHeight: 1 }}>{totals.calIn}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-500)' }}>kcal eaten</div>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={13} color="var(--purple-300)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--purple-300)' }}>BURNED</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--purple-300)', lineHeight: 1 }}>{totals.calOut}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-500)' }}>kcal active</div>
        </div>
      </div>

      {/* Macros — horizontal bars */}
      <div className="glass-card">
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--gold-500)', marginBottom: '16px' }}>
          MACROS TODAY
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {macros.map(m => {
            const pct = Math.min(100, m.goal > 0 ? (m.value / m.goal) * 100 : 0);
            return (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: m.color }}>
                    {m.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: m.color, lineHeight: 1 }}>{m.value}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gray-500)' }}>/ {m.goal}{m.unit}</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: m.color,
                      borderRadius: 'var(--r-pill)',
                      transition: 'width 0.5s ease',
                      boxShadow: `0 0 8px ${m.color}88`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps — full width */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Footprints size={13} color="#38bdf8" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: '#38bdf8' }}>DAILY STEPS</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: '#38bdf8', lineHeight: 1 }}>{steps.toLocaleString()}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray-500)', marginTop: 4 }}>steps today</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gray-500)', marginBottom: 4 }}>BURNED</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: 'var(--gold-500)', lineHeight: 1 }}>
            {Math.round(steps * STEP_CALORIES_MULTIPLIER)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gray-500)', marginTop: 2 }}>kcal</div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

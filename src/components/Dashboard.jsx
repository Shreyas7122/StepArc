import { Flame, Activity, Footprints, TrendingDown } from 'lucide-react';
import { STEP_CALORIES_MULTIPLIER } from '../lib/data';

const Dashboard = ({ totals, steps, goals }) => {
  const calsLeft = goals.calories - totals.calIn;
  const isOver   = calsLeft < 0;

  const macros = [
    { label: 'Protein', value: totals.p,          goal: goals.protein, color: 'var(--protein-color)', unit: 'g' },
    { label: 'Carbs',   value: totals.c,          goal: goals.carbs,   color: 'var(--carbs-color)',   unit: 'g' },
    { label: 'Fats',    value: totals.f,          goal: goals.fats,    color: 'var(--fats-color)',     unit: 'g' },
    { label: 'Fibre',   value: totals.fibre || 0, goal: goals.fibre,   color: 'var(--fibre-color)',    unit: 'g' },
  ];

  return (
    <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Hero calorie balance */}
      <div className="dashboard-hero hero-card-animate">
        {/* Ghost number watermark */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: -16, bottom: -20,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: 'clamp(72px, 22vw, 130px)',
            color: 'rgba(244,194,13,0.05)',
            pointerEvents: 'none',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {isOver ? `+${Math.abs(calsLeft)}` : calsLeft}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <TrendingDown size={12} color={isOver ? 'var(--danger)' : 'var(--yellow-500)'} />
            <span style={{
              fontFamily: 'var(--font-heading)', fontWeight: 700,
              fontSize: '0.6rem', textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: isOver ? 'var(--danger)' : 'var(--yellow-500)',
            }}>
              {isOver ? 'OVER GOAL' : 'CALORIES LEFT'}
            </span>
          </div>

          {/* Big number */}
          <div
            key={calsLeft}
            className="value-bump"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 'clamp(3.2rem, 16vw, 5.5rem)',
              lineHeight: 0.95,
              color: isOver ? 'var(--danger)' : 'var(--yellow-500)',
              marginBottom: '6px',
              letterSpacing: '-0.01em',
            }}
          >
            {isOver ? `+${Math.abs(calsLeft)}` : calsLeft}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
            kcal · target {goals.calories}
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--r-pill)', overflow: 'hidden', marginBottom: '14px' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (totals.calIn / goals.calories) * 100)}%`,
                background: isOver ? 'var(--danger)' : 'var(--gradient-cta)',
                borderRadius: 'var(--r-pill)',
                transition: 'width 800ms var(--ease-out-expo)',
              }}
            />
          </div>

          {/* BMR chips */}
          {goals.bmr > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { label: 'BMR',       value: `${goals.bmr.toLocaleString()} kcal` },
                { label: 'Base goal', value: `${goals.baseGoal.toLocaleString()} kcal` },
                { label: 'Activity',  value: `+${goals.activityBurn} kcal` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '3px 9px',
                  borderRadius: 'var(--r-pill)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.54rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.38)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Consumed + Burned row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Consumed */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={12} color="var(--yellow-500)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--yellow-500)' }}>CONSUMED</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: '2.4rem',
            color: 'var(--yellow-500)',
            lineHeight: 1,
          }}>
            {totals.calIn}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray-400)' }}>kcal eaten</div>
        </div>

        {/* Burned */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={12} color="var(--gray-200)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--gray-200)' }}>BURNED</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: '2.4rem',
            color: 'var(--gray-200)',
            lineHeight: 1,
          }}>
            {totals.calOut}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray-400)' }}>kcal active</div>
        </div>
      </div>

      {/* Macros */}
      <div className="glass-card">
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700, fontSize: '0.6rem',
          textTransform: 'uppercase', letterSpacing: '0.22em',
          color: 'var(--yellow-500)', marginBottom: '16px',
        }}>
          MACROS TODAY
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {macros.map(m => {
            const pct = Math.min(100, m.goal > 0 ? (m.value / m.goal) * 100 : 0);
            return (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: m.color }}>
                    {m.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <span key={m.value} className="value-bump" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: '1.3rem', color: m.color, lineHeight: 1 }}>{m.value}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gray-400)' }}>/ {m.goal}{m.unit}</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: 5, background: 'var(--ink-800)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: m.color, borderRadius: 'var(--r-pill)',
                    transition: 'width 700ms var(--ease-out-expo)',
                    boxShadow: `0 0 8px ${m.color}66`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Steps */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Footprints size={12} color="var(--yellow-500)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--yellow-500)' }}>DAILY STEPS</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: '2.4rem', color: 'var(--white)', lineHeight: 1 }}>
            {steps.toLocaleString()}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gray-400)', marginTop: 4 }}>steps today</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gray-400)', marginBottom: 4 }}>BURNED</div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: '1.9rem', color: 'var(--yellow-500)', lineHeight: 1 }}>
            {Math.round(steps * STEP_CALORIES_MULTIPLIER)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gray-400)', marginTop: 2 }}>kcal</div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

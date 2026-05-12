import { Utensils, Flame, Activity, Footprints, TrendingDown } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { dailyTargets, DAILY_BULK_TARGET, STEP_CALORIES_MULTIPLIER } from '../data';

const Dashboard = ({ totals, steps }) => {
  const calsLeft  = DAILY_BULK_TARGET - totals.calIn;
  const isOver    = calsLeft < 0;

  return (
    <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="status-grid">

        {/* Macros Consumed */}
        <div className="glass-card status-card full-width">
          <div className="status-header" style={{ marginBottom: '4px' }}>
            <Utensils size={18} color="var(--text-primary)" />
            <span style={{ color: 'var(--text-primary)' }}>Macros Consumed</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '14px', marginBottom: '8px' }}>
            <CircularProgress
              percentage={Math.min(100, (totals.p / dailyTargets.protein) * 100)}
              color="var(--protein-color)"
              value={`${totals.p}g`}
              label="Protein"
              subtext={`${Math.max(0, dailyTargets.protein - totals.p)}g left`}
            />
            <CircularProgress
              percentage={Math.min(100, (totals.c / dailyTargets.carbs) * 100)}
              color="var(--carbs-color)"
              value={`${totals.c}g`}
              label="Carbs"
              subtext={`${Math.max(0, dailyTargets.carbs - totals.c)}g left`}
            />
            <CircularProgress
              percentage={Math.min(100, (totals.f / dailyTargets.fats) * 100)}
              color="var(--fats-color)"
              value={`${totals.f}g`}
              label="Fats"
              subtext={`${Math.max(0, dailyTargets.fats - totals.f)}g left`}
            />
          </div>
        </div>

        {/* Calories Consumed */}
        <div className="glass-card status-card">
          <div className="status-header">
            <Flame size={18} color="var(--calories-color)" />
            <span>Consumed</span>
          </div>
          <div className="status-value" style={{ color: 'var(--calories-color)' }}>{totals.calIn}</div>
          <div className="status-subtext">kcal eaten</div>
        </div>

        {/* Active Energy */}
        <div className="glass-card status-card">
          <div className="status-header">
            <Activity size={18} color="var(--primary-color)" />
            <span>Burned</span>
          </div>
          <div className="status-value" style={{ color: 'var(--primary-color)' }}>{totals.calOut}</div>
          <div className="status-subtext">kcal active</div>
        </div>

        {/* Calories Left (bulk target) */}
        <div className="glass-card status-card full-width" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="status-header">
              <TrendingDown size={18} color={isOver ? '#ef4444' : '#10b981'} />
              <span style={{ color: 'var(--text-primary)' }}>Calories Left</span>
            </div>
            <div className="status-value" style={{ color: isOver ? '#ef4444' : '#10b981', marginTop: 4 }}>
              {isOver ? `+${Math.abs(calsLeft)}` : calsLeft} kcal
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="status-subtext">Bulk target</div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{DAILY_BULK_TARGET} kcal</div>
            <div className="status-subtext" style={{ marginTop: 2 }}>{isOver ? 'over' : 'to go'}</div>
          </div>
        </div>

        {/* Daily Steps */}
        <div
          className="glass-card status-card full-width"
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <div className="status-header">
              <Footprints size={18} color="#38bdf8" />
              <span style={{ color: 'var(--text-primary)' }}>Daily Steps</span>
            </div>
            <div className="status-value" style={{ color: '#38bdf8', marginTop: 4 }}>{steps.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="status-subtext" style={{ color: 'var(--text-secondary)' }}>Burned</div>
            <div style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
              {Math.round(steps * STEP_CALORIES_MULTIPLIER)} kcal
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

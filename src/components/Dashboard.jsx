import { Utensils, Flame, Activity, Footprints } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { dailyTargets, STEP_CALORIES_MULTIPLIER } from '../data';

const Dashboard = ({ totals, steps }) => (
  <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div className="status-grid">

      {/* Macros Remaining — circular layout */}
      <div className="glass-card status-card full-width">
        <div className="status-header">
          <Utensils size={18} color="var(--text-primary)" />
          <span style={{ color: 'var(--text-primary)' }}>Macros Remaining</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px', marginBottom: '8px' }}>
          <CircularProgress
            percentage={Math.min(100, (totals.p / dailyTargets.protein) * 100)}
            color="var(--protein-color)"
            value={`${Math.max(0, dailyTargets.protein - totals.p)}g`}
            label="Protein"
            subtext={`${totals.p}/${dailyTargets.protein}g`}
          />
          <CircularProgress
            percentage={Math.min(100, (totals.c / dailyTargets.carbs) * 100)}
            color="var(--carbs-color)"
            value={`${Math.max(0, dailyTargets.carbs - totals.c)}g`}
            label="Carbs"
            subtext={`${totals.c}/${dailyTargets.carbs}g`}
          />
          <CircularProgress
            percentage={Math.min(100, (totals.f / dailyTargets.fats) * 100)}
            color="var(--fats-color)"
            value={`${Math.max(0, dailyTargets.fats - totals.f)}g`}
            label="Fats"
            subtext={`${totals.f}/${dailyTargets.fats}g`}
          />
        </div>
      </div>

      {/* Calories Consumed */}
      <div className="glass-card status-card">
        <div className="status-header">
          <Flame size={18} color="var(--calories-color)" />
          <span>Calories Consumed</span>
        </div>
        <div className="status-value" style={{ color: 'var(--calories-color)' }}>{totals.calIn}</div>
        <div className="status-subtext">kcal today</div>
      </div>

      {/* Active Energy */}
      <div className="glass-card status-card">
        <div className="status-header">
          <Activity size={18} color="var(--primary-color)" />
          <span>Active Energy</span>
        </div>
        <div className="status-value" style={{ color: 'var(--primary-color)' }}>{totals.calOut}</div>
        <div className="status-subtext">kcal burned</div>
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

export default Dashboard;

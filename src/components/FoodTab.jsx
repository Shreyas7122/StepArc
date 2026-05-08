import { Zap, ChevronRight, Plus } from 'lucide-react';
import { fixedMeals, foodDatabase } from '../data';

const FoodTab = ({
  onStartQuickLog,
  selectedFoodId,
  setSelectedFoodId,
  foodAmount,
  setFoodAmount,
  onAddFood,
}) => (
  <div className="animate-slide-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div className="glass-card">
      <div className="status-header" style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
        <Zap size={18} color="#f59e0b" />
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Quick Log Meals</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {fixedMeals.map((meal, idx) => (
          <button
            key={idx}
            className="secondary"
            onClick={() => onStartQuickLog(meal)}
            style={{ justifyContent: 'space-between', padding: '12px 16px', fontWeight: '500' }}
          >
            <span>{meal.name}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
    </div>

    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>or log manually</div>

    <form onSubmit={onAddFood} className="glass-card">
      <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Custom Entry</h2>
      <div className="input-group">
        <label>Select Item</label>
        <select value={selectedFoodId} onChange={(e) => setSelectedFoodId(e.target.value)}>
          {foodDatabase.map((f) => (
            <option key={f.id} value={f.id}>{f.name} ({f.calories} kcal/100g)</option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label>Amount (grams)</label>
        <input
          type="number"
          placeholder="e.g. 50"
          value={foodAmount}
          onChange={(e) => setFoodAmount(e.target.value)}
          min="1"
        />
      </div>
      <button type="submit">
        <Plus size={18} /> Add Food Entry
      </button>
    </form>
  </div>
);

export default FoodTab;

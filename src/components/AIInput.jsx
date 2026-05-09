import { Sparkles, Send, X, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useState } from 'react';

const MacroChip = ({ label, value, unit, color }) => (
  <div style={{ textAlign: 'center', padding: '10px 6px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px' }}>
    <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '1px' }}>{unit}</div>
    <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{label}</div>
  </div>
);

const AIInput = ({ caloriesLoggedToday, onLogMeal }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showIngredients, setShowIngredients] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setShowIngredients(false);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/analyze-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_text: prompt,
          calories_logged_today: caloriesLoggedToday,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      setResult(await res.json());
    } catch (err) {
      const msg = err.message;
      setError(msg.includes('fetch') || msg.includes('NetworkError')
        ? 'Cannot reach the AI server. Check your connection or try again later.'
        : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLog = () => {
    if (!result) return;
    onLogMeal({
      name: `AI: ${result.meal_name}`,
      aiMacros: {
        calories: result.total_macros.calories,
        protein: result.total_macros.protein_g,
        carbs: result.total_macros.carbs_g,
        fats: result.total_macros.fat_g,
      },
    });
    setResult(null);
    setPrompt('');
  };

  return (
    <div className="ai-input-wrapper">
      {/* Input card */}
      <div className="glass-card ai-card" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="var(--primary-color)" />
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Log with AI</h3>
          <span style={{ fontSize: '0.65rem', background: 'rgba(99,102,241,0.2)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, letterSpacing: '0.05em' }}>BETA</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="e.g. '100g oats, honey, a scoop of whey'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            style={{ width: 'auto', padding: '10px 16px', flexShrink: 0, background: loading ? 'var(--surface-border)' : 'var(--primary-color)' }}
          >
            {loading ? <span className="spinner" /> : <Send size={18} />}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', fontSize: '0.82rem', lineHeight: 1.5 }}>
            {error}
          </div>
        )}
      </div>

      {/* Result card */}
      {result && (
        <div className="glass-card ai-result-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>AI Analysis</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.meal_name}</div>
            </div>
            <button onClick={() => setResult(null)} style={{ width: 'auto', padding: '6px', background: 'transparent', color: 'var(--text-secondary)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Macro grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
            <MacroChip label="Calories" value={Math.round(result.total_macros.calories)} unit="kcal" color="var(--calories-color)" />
            <MacroChip label="Protein"  value={result.total_macros.protein_g.toFixed(1)} unit="g" color="var(--protein-color)" />
            <MacroChip label="Carbs"    value={result.total_macros.carbs_g.toFixed(1)}   unit="g" color="var(--carbs-color)" />
            <MacroChip label="Fat"      value={result.total_macros.fat_g.toFixed(1)}      unit="g" color="var(--fats-color)" />
          </div>

          {/* Star contributors */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--protein-color)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '3px' }}>TOP PROTEIN</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{result.top_protein_source}</div>
            </div>
            <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--carbs-color)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '3px' }}>TOP CARBS</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{result.top_carb_source}</div>
            </div>
          </div>

          {/* Remaining calories */}
          <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Remaining today (after this meal)</span>
            <span style={{ fontWeight: 700, color: 'var(--calories-color)', fontSize: '1rem' }}>
              {Math.round(result.daily_summary.remaining_calories)} kcal
            </span>
          </div>

          {/* Ingredient breakdown toggle */}
          <button
            onClick={() => setShowIngredients(v => !v)}
            className="secondary"
            style={{ marginBottom: showIngredients ? '10px' : '14px', padding: '9px 14px', fontSize: '0.83rem', justifyContent: 'space-between' }}
          >
            <span>Ingredient Breakdown ({result.ingredients.length} items)</span>
            {showIngredients ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showIngredients && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {result.ingredients.map((ing, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{ing.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{ing.amount}{ing.unit}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--calories-color)' }}>{Math.round(ing.calories)} kcal</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      P {ing.protein_g}g · C {ing.carbs_g}g · F {ing.fat_g}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleLog} style={{ flex: 2 }}>
              <Zap size={16} /> Log This Meal
            </button>
            <button onClick={() => setResult(null)} className="secondary" style={{ flex: 1 }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInput;

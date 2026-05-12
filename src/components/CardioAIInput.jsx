import { Timer, Send, X, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { useState } from 'react';

const CardioAIInput = ({ onLogCardio }) => {
  const [prompt, setPrompt]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);
  const [showSegments, setShowSegments] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setShowSegments(false);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/analyze-cardio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_text: prompt }),
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
    onLogCardio({
      name: `AI: ${result.session_name}`,
      durationMins: result.total_duration_mins,
      aiCalories: result.total_calories_burned,
    });
    setResult(null);
    setPrompt('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Input */}
      <div className="glass-card" style={{ background: 'linear-gradient(145deg, rgba(14,165,233,0.06), rgba(56,189,248,0.04))', border: '1px solid rgba(56,189,248,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Timer size={17} color="#38bdf8" />
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Log Cardio with AI</h3>
          <span style={{ fontSize: '0.65rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>AI</span>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="e.g. '12 mins incline 10° 4.2 speed, 9 mins incline 4.0 speed'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            style={{ width: 'auto', padding: '10px 16px', flexShrink: 0, background: loading ? 'var(--surface-border)' : '#0ea5e9' }}
          >
            {loading ? <span className="spinner" /> : <Send size={18} />}
          </button>
        </form>
        {error && (
          <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', fontSize: '0.82rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card" style={{ border: '1px solid rgba(56,189,248,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>AI Cardio Analysis</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.session_name}</div>
            </div>
            <button onClick={() => setResult(null)} style={{ width: 'auto', padding: '6px', background: 'transparent', color: 'var(--text-secondary)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Summary chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>{Math.round(result.total_duration_mins)}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>min total</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--calories-color)' }}>{Math.round(result.total_calories_burned)}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>kcal burned</div>
            </div>
          </div>

          {/* Segments toggle */}
          <button
            onClick={() => setShowSegments(v => !v)}
            className="secondary"
            style={{ marginBottom: showSegments ? '10px' : '14px', padding: '9px 14px', fontSize: '0.83rem', justifyContent: 'space-between' }}
          >
            <span>Segment Breakdown ({result.segments.length})</span>
            {showSegments ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showSegments && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {result.segments.map((seg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{seg.description}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {seg.duration_mins} min
                      {seg.speed_kmh ? ` · ${seg.speed_kmh} km/h` : ''}
                      {seg.incline_degrees ? ` · ${seg.incline_degrees}° incline` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>{Math.round(seg.calories_burned)} kcal</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleLog} style={{ flex: 2, background: '#0ea5e9' }}>
              <Flame size={16} /> Log This Session
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

export default CardioAIInput;

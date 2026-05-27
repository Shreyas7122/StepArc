import { Timer, Send, X, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { useState } from 'react';
import { getApiBase } from '../lib/utils';

const CardioAIInput = ({ onLogCardio }) => {
  const [prompt, setPrompt]             = useState('');
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState(null);
  const [showSegments, setShowSegments] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setShowSegments(false);

    try {
      const apiBase = getApiBase();
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
      setError(
        msg.includes('fetch') || msg.includes('NetworkError')
          ? 'Cannot reach the AI server. Check your connection or try again later.'
          : msg
      );
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

      {/* Input card */}
      <div
        className="glass-card"
        style={{ border: '1px solid var(--ink-700)' }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--gold-500)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px',
          }}
        >
          <Timer size={12} color="var(--yellow-500)" />
          AI CARDIO
        </div>

        {/* Section title */}
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--white)',
            marginBottom: '12px',
          }}
        >
          Log Cardio with AI
          <span
            style={{
              marginLeft: '8px',
              fontSize: '0.6rem',
              background: 'rgba(244,194,13,0.12)',
              color: 'var(--yellow-500)',
              padding: '2px 8px',
              borderRadius: 'var(--r-pill)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              verticalAlign: 'middle',
            }}
          >
            AI
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="e.g. '12 mins incline 10° 4.2 speed, 9 mins flat 4.0'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            aria-label="Submit cardio text for AI analysis"
            disabled={loading || !prompt.trim()}
            style={{
              width: 'auto',
              padding: '10px 16px',
              flexShrink: 0,
              background: loading ? 'rgba(255,255,255,0.08)' : 'var(--gradient-cta)',
              color: 'var(--black)',
              borderRadius: 'var(--r-md)',
            }}
          >
            {loading ? <span className="spinner" /> : <Send size={17} />}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 14px',
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
      </div>

      {/* Result card */}
      {result && (
        <div
          className="glass-card"
          style={{ border: '1px solid rgba(244,194,13,0.2)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--gold-500)',
                  marginBottom: '3px',
                }}
              >
                AI CARDIO ANALYSIS
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--white)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {result.session_name}
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              style={{ width: 'auto', padding: '6px', background: 'transparent', color: 'var(--gray-500)', borderRadius: 'var(--r-md)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Summary chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                textAlign: 'center',
                padding: '12px',
                background: 'var(--ink-800)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--ink-700)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--yellow-500)', lineHeight: 1 }}>
                {Math.round(result.total_duration_mins)}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', color: 'var(--gray-500)', marginTop: 3 }}>min total</div>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: '12px',
                background: 'var(--ink-800)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--ink-700)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold-500)', lineHeight: 1 }}>
                {Math.round(result.total_calories_burned)}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', color: 'var(--gray-500)', marginTop: 3 }}>kcal burned</div>
            </div>
          </div>

          {/* Segments toggle */}
          <button
            onClick={() => setShowSegments(v => !v)}
            className="secondary"
            style={{ marginBottom: showSegments ? '10px' : '14px', padding: '9px 14px', fontSize: '0.83rem', justifyContent: 'space-between' }}
          >
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', textTransform: 'none', letterSpacing: 0 }}>
              Segment Breakdown ({result.segments.length})
            </span>
            {showSegments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showSegments && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {result.segments.map((seg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '9px 12px',
                    background: 'var(--ink-800)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--ink-700)',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--white)' }}>
                      {seg.description}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: 2 }}>
                      {seg.duration_mins} min
                      {seg.speed_kmh ? ` · ${seg.speed_kmh} km/h` : ''}
                      {seg.incline_degrees ? ` · ${seg.incline_degrees}° incline` : ''}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--yellow-500)' }}>
                    {Math.round(seg.calories_burned)} kcal
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleLog}
              style={{ flex: 2, background: 'var(--gradient-cta)', color: 'var(--black)', borderRadius: 'var(--r-pill)' }}
            >
              <Flame size={15} /> LOG SESSION
            </button>
            <button
              onClick={() => setResult(null)}
              className="secondary"
              style={{ flex: 1 }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardioAIInput;

import { Sparkles, Send, X, ChevronDown, ChevronUp, Zap, Camera, Image } from 'lucide-react';
import { useRef, useState } from 'react';
import { getApiBase } from '../utils';

const MacroChip = ({ label, value, unit, color }) => (
  <div
    style={{
      textAlign: 'center',
      padding: '10px 6px',
      background: 'rgba(10,6,18,0.4)',
      borderRadius: 'var(--r-md)',
      border: '1px solid rgba(255,255,255,0.04)',
    }}
  >
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', color: 'var(--gray-500)', marginTop: 2 }}>{unit}</div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', color: 'var(--gray-500)' }}>{label}</div>
  </div>
);

const AIInput = ({ caloriesLoggedToday, calorieGoal, onLogMeal }) => {
  const [prompt, setPrompt]               = useState('');
  const [photo, setPhoto]                 = useState(null);
  const [mode, setMode]                   = useState('text');
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState(null);
  const [showIngredients, setShowIngredients] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(',')[1];
      setPhoto({ dataUrl, base64, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isPhoto = mode === 'photo' && photo;
    if (!isPhoto && !prompt.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setShowIngredients(false);

    try {
      const apiBase = getApiBase();
      let res;
      if (isPhoto) {
        res = await fetch(`${apiBase}/analyze-meal-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: photo.base64,
            mime_type: photo.mimeType,
            calories_logged_today: caloriesLoggedToday,
            calorie_goal: calorieGoal,
          }),
        });
      } else {
        res = await fetch(`${apiBase}/analyze-meal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meal_text: prompt,
            calories_logged_today: caloriesLoggedToday,
            calorie_goal: calorieGoal,
          }),
        });
      }

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
    clearPhoto();
  };

  const canSubmit = mode === 'photo' ? !!photo : !!prompt.trim();

  const modeBtnStyle = (active) => ({
    width: 'auto',
    padding: '5px 10px',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: active ? 'var(--gold-500)' : 'transparent',
    color: active ? 'var(--purple-900)' : 'var(--gray-500)',
    borderRadius: 'var(--r-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: 'none',
  });

  return (
    <div className="ai-input-wrapper" style={{ marginTop: '8px' }}>

      {/* Input card */}
      <div
        className="glass-card ai-card"
        style={{ border: '1px solid rgba(168,85,247,0.18)' }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--gold-500)" />
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--white)',
              }}
            >
              AI MEAL LOG
            </div>
            <span
              style={{
                fontSize: '0.6rem',
                background: 'var(--gold-500)',
                color: 'var(--purple-900)',
                padding: '2px 8px',
                borderRadius: 'var(--r-pill)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              GEMINI
            </span>
          </div>

          {/* Mode switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(10,6,18,0.5)',
              borderRadius: 'var(--r-sm)',
              padding: '2px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('text'); clearPhoto(); }}
              style={modeBtnStyle(mode === 'text')}
            >
              <Sparkles size={11} /> Text
            </button>
            <button
              type="button"
              onClick={() => { setMode('photo'); setPrompt(''); }}
              style={modeBtnStyle(mode === 'photo')}
            >
              <Camera size={11} /> Photo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'text' ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. '2 slices pizza, a cola, garlic bread'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                aria-label="Submit text for AI analysis"
                disabled={loading || !canSubmit}
                style={{
                  width: 'auto',
                  padding: '10px 16px',
                  flexShrink: 0,
                  background: loading ? 'rgba(255,255,255,0.08)' : 'var(--gradient-cta)',
                  color: 'var(--purple-900)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                {loading ? <span className="spinner" style={{ borderTopColor: 'var(--purple-900)' }} /> : <Send size={17} />}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
              {!photo ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'rgba(255,184,0,0.06)',
                    border: '2px dashed rgba(255,184,0,0.3)',
                    borderRadius: 'var(--r-md)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--gold-500)',
                    width: '100%',
                  }}
                >
                  <Image size={28} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Tap to take photo or upload
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--gray-500)', textTransform: 'none', letterSpacing: 0 }}>
                    JPG, PNG, WEBP
                  </span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                    <img
                      src={photo.dataUrl}
                      alt="meal preview"
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block', borderRadius: 'var(--r-md)' }}
                    />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        width: '28px', height: '28px', padding: 0,
                        background: 'rgba(0,0,0,0.6)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--white)',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="secondary"
                      style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}
                    >
                      Change Photo
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 2,
                        padding: '10px',
                        background: loading ? 'rgba(255,255,255,0.08)' : 'var(--gradient-cta)',
                        color: 'var(--purple-900)',
                        borderRadius: 'var(--r-pill)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      {loading ? <span className="spinner" style={{ borderTopColor: 'var(--purple-900)' }} /> : <><Sparkles size={15} /> ANALYSE PHOTO</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: '12px',
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
        </form>
      </div>

      {/* Result card */}
      {result && (
        <div className="glass-card ai-result-card">
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
                AI ANALYSIS
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--white)',
                }}
              >
                {result.meal_name}
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              style={{ width: 'auto', padding: '6px', background: 'transparent', color: 'var(--gray-500)', borderRadius: 'var(--r-md)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Macro chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
            <MacroChip label="Calories" value={Math.round(result.total_macros.calories)} unit="kcal" color="var(--gold-500)" />
            <MacroChip label="Protein"  value={result.total_macros.protein_g.toFixed(1)} unit="g"    color="var(--protein-color)" />
            <MacroChip label="Carbs"    value={result.total_macros.carbs_g.toFixed(1)}   unit="g"    color="var(--carbs-color)" />
            <MacroChip label="Fat"      value={result.total_macros.fat_g.toFixed(1)}     unit="g"    color="var(--fats-color)" />
          </div>

          {/* Sources */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(236,72,153,0.08)',
                border: '1px solid rgba(236,72,153,0.2)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.58rem', fontWeight: 700, color: 'var(--protein-color)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>
                TOP PROTEIN
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--white)' }}>{result.top_protein_source}</div>
            </div>
            <div
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.58rem', fontWeight: 700, color: 'var(--carbs-color)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>
                TOP CARBS
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--white)' }}>{result.top_carb_source}</div>
            </div>
          </div>

          {/* Remaining today */}
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(255,184,0,0.06)',
              border: '1px solid rgba(255,184,0,0.18)',
              borderRadius: 'var(--r-md)',
              marginBottom: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--gray-300)' }}>
              Remaining today (after this meal)
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--gold-500)', fontSize: '1rem' }}>
              {Math.round(result.daily_summary.remaining_calories)} kcal
            </span>
          </div>

          {/* Ingredients toggle */}
          <button
            onClick={() => setShowIngredients(v => !v)}
            className="secondary"
            style={{ marginBottom: showIngredients ? '10px' : '14px', padding: '9px 14px', justifyContent: 'space-between' }}
          >
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', textTransform: 'none', letterSpacing: 0 }}>
              Ingredient Breakdown ({result.ingredients.length} items)
            </span>
            {showIngredients ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showIngredients && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {result.ingredients.map((ing, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    background: 'rgba(10,6,18,0.4)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--white)' }}>{ing.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-500)' }}>{ing.amount}{ing.unit}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold-500)' }}>{Math.round(ing.calories)} kcal</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--gray-500)' }}>
                      P {ing.protein_g}g · C {ing.carbs_g}g · F {ing.fat_g}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleLog}
              style={{ flex: 2, background: 'var(--gradient-cta)', color: 'var(--purple-900)', borderRadius: 'var(--r-pill)' }}
            >
              <Zap size={15} /> LOG THIS MEAL
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

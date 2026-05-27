import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Activity, Mail, Lock, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

const AuthScreen = ({ onAuth }) => {
  const [mode, setMode]         = useState('login'); // 'login' | 'signup'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [info, setInfo]         = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo('Check your email to confirm your account, then log in.');
        setMode('login');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--black)',
        backgroundImage:
          'radial-gradient(ellipse at 10% 10%, rgba(244,194,13,0.06) 0px, transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(244,194,13,0.04) 0px, transparent 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Hero header */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--r-xl)',
          padding: '32px 28px 28px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lift)',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <div aria-hidden="true" style={{ position: 'absolute', right: -24, bottom: -16, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: '10rem', color: 'rgba(244,194,13,0.05)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>ARC</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 'var(--r-lg)', padding: '12px', marginBottom: '16px',
            }}
          >
            <Activity size={28} color="var(--gold-500)" strokeWidth={2.5} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic', fontWeight: 900,
              fontSize: 'clamp(2.5rem, 14vw, 4rem)', lineHeight: 0.92,
              letterSpacing: '-0.01em', textTransform: 'uppercase',
              color: 'var(--white)', marginBottom: '6px',
            }}
          >
            STEP<span style={{ color: 'var(--yellow-500)' }}>ARC</span>
          </h1>
          <div
            style={{
              fontFamily: 'var(--font-heading)', fontWeight: 600,
              fontSize: '0.7rem', textTransform: 'uppercase',
              letterSpacing: '0.25em', color: 'rgba(255,255,255,0.5)',
            }}
          >
            TRACK YOUR GAINS
          </div>
        </div>
      </div>

      {/* Auth card */}
      <div
        style={{
          width: '100%', maxWidth: '420px',
          background: 'var(--ink-900)',
          border: '1px solid var(--ink-700)',
          borderRadius: 'var(--r-xl)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Mode toggle */}
        <div
          style={{
            display: 'flex', gap: '4px',
            background: 'rgba(20,20,20,0.8)',
            padding: '4px', borderRadius: 'var(--r-pill)',
            marginBottom: '24px',
          }}
        >
          {['login', 'signup'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); setInfo(null); }}
              style={{
                flex: 1, padding: '10px',
                background: mode === m ? 'var(--gradient-cta)' : 'transparent',
                color: mode === m ? 'var(--black)' : 'var(--gray-500)',
                borderRadius: 'var(--r-pill)',
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                boxShadow: mode === m ? 'var(--glow-gold)' : 'none',
                transition: 'background-color 200ms var(--ease-out-expo), color 200ms var(--ease-out-expo), box-shadow 200ms var(--ease-out-expo)',
              }}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Email */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--gray-500)', pointerEvents: 'none',
                display: 'flex', alignItems: 'center',
              }}
            >
              <Mail size={16} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--gray-500)', pointerEvents: 'none',
                display: 'flex', alignItems: 'center',
              }}
            >
              <Lock size={16} />
            </div>
            <input
              type={showPw ? 'text' : 'password'}
              name="password"
              placeholder="Password (min 6 chars)"
              aria-label="Password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ paddingLeft: '40px', paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                width: 'auto', padding: '6px', background: 'transparent',
                color: 'var(--gray-500)', border: 'none',
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error / Info */}
          {error && (
            <div
              style={{
                padding: '10px 12px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-md)',
                color: '#ef4444', fontSize: '0.82rem', fontFamily: 'var(--font-body)',
              }}
            >
              {error}
            </div>
          )}
          {info && (
            <div
              style={{
                padding: '10px 12px', background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--r-md)',
                color: '#22c55e', fontSize: '0.82rem', fontFamily: 'var(--font-body)',
              }}
            >
              {info}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px',
              background: loading ? 'rgba(255,255,255,0.08)' : 'var(--gradient-cta)',
              color: loading ? 'var(--white)' : 'var(--black)',
              boxShadow: loading ? 'none' : 'var(--glow-gold)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading
              ? <span className="spinner" />
              : mode === 'login'
                ? <><LogIn size={16} /> LOG IN</>
                : <><UserPlus size={16} /> CREATE ACCOUNT</>
            }
          </button>
        </form>
      </div>

      <div
        style={{
          marginTop: '16px',
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
          color: 'var(--gray-500)', textAlign: 'center',
        }}
      >
        Your data syncs across devices · Powered by Supabase
      </div>
    </div>
  );
};

export default AuthScreen;

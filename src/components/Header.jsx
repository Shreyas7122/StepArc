import { User, LogOut } from 'lucide-react';
import { useState } from 'react';

const Header = ({ onOpenProfile, onSignOut, userEmail }) => {
  const [btnHover, setBtnHover] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  return (
    <header
      className="animate-slide-up"
      style={{
        background: 'var(--gradient-hero)',
        borderRadius: 'var(--r-xl)',
        padding: '24px 20px 20px',
        boxShadow: 'var(--shadow-lift)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 70% 50%, rgba(168,85,247,0.35) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* User button — top right */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 100 }}>
        <button
          type="button"
          onClick={() => setShowMenu(v => !v)}
          style={{
            width: 'auto',
            padding: '8px',
            background: btnHover ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 'var(--r-md)',
            color: 'var(--white)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, box-shadow 0.2s',
            boxShadow: btnHover ? 'var(--glow-gold)' : 'none',
          }}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
        >
          <User size={20} strokeWidth={2} />
        </button>

        {showMenu && (
          <>
            {/* tap-outside backdrop */}
            <div
              onClick={() => setShowMenu(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 98 }}
            />
          <div
            style={{
              position: 'fixed', top: '68px', right: '16px',
              background: 'var(--purple-800)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lift)',
              width: 260, overflow: 'hidden', zIndex: 99,
            }}
          >
            {userEmail && (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gray-500)', marginBottom: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Signed in as</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--gray-200)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
              </div>
            )}
            <button
              type="button"
              onClick={() => { setShowMenu(false); onOpenProfile(); }}
              style={{ width: '100%', padding: '11px 14px', background: 'transparent', border: 'none', color: 'var(--white)', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', fontSize: '0.85rem', fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: 0, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <User size={15} /> Edit Profile
            </button>
            <button
              type="button"
              onClick={() => { setShowMenu(false); onSignOut(); }}
              style={{ width: '100%', padding: '11px 14px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#ef4444', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', fontSize: '0.85rem', fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: 0, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
          </>
        )}
      </div>

      {/* Date eyebrow */}
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          color: 'var(--gold-400)',
          marginBottom: '10px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {dateStr}
      </div>

      {/* STEPARC display title */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3.2rem',
          lineHeight: 1,
          fontWeight: 400,
          color: 'var(--white)',
          letterSpacing: '0.02em',
          position: 'relative',
          zIndex: 1,
          marginBottom: '10px',
        }}
      >
        STEP<span style={{ color: 'var(--gold-500)' }}>ARC</span>
      </h1>

      {/* Tagline */}
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.55)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        TRACK YOUR GAINS
      </div>
    </header>
  );
};

export default Header;

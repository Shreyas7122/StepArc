import { User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

const Header = ({ onOpenProfile, onSignOut, userEmail }) => {
  const [showMenu, setShowMenu] = useState(false);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase();

  return (
    <header
      className="animate-slide-up"
      style={{
        borderRadius: 'var(--r-xl)',
        padding: 'calc(24px + env(safe-area-inset-top, 0px)) 24px 24px',
        boxShadow: 'var(--shadow-lift)',
        position: 'relative',
        border: '1px solid var(--ink-700)',
      }}
    >
      {/* Background & Ghost text wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--r-xl)',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Ghost lettermark */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: -32, top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: 'clamp(96px, 28vw, 180px)',
            color: 'rgba(244,194,13,0.06)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          ARC
        </div>
      </div>

      {/* User button — top right */}
      <div style={{ position: 'absolute', top: 'calc(18px + env(safe-area-inset-top, 0px))', right: 18, zIndex: 100 }}>
        <button
          type="button"
          aria-label="Toggle user profile and settings menu"
          onClick={() => setShowMenu(v => !v)}
          style={{
            width: 'auto',
            padding: '8px 10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--ink-700)',
            borderRadius: 'var(--r-md)',
            color: 'var(--gray-400)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,194,13,0.1)'; e.currentTarget.style.color = 'var(--yellow-500)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--gray-400)'; }}
        >
          <User size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Dropdown menu — portaled to body to escape transform containing block */}
      {showMenu && createPortal(
        <>
          <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
          <div
            style={{
              position: 'fixed',
              top: 'calc(68px + env(safe-area-inset-top, 0px))',
              right: '16px',
              background: 'var(--ink-900)',
              border: '1px solid var(--ink-700)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-lift)',
              width: 260,
              zIndex: 9999,
            }}
          >
            {userEmail && (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-700)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--gray-400)', marginBottom: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Signed in as</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--gray-200)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
              </div>
            )}
            <button
              type="button"
              onClick={() => { setShowMenu(false); onOpenProfile(); }}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'transparent', border: 'none', color: 'var(--white)',
                borderRadius: userEmail ? 0 : 'var(--r-lg) var(--r-lg) 0 0',
                display: 'flex', alignItems: 'center',
                justifyContent: 'flex-start', gap: '10px',
                fontSize: '0.85rem', fontFamily: 'var(--font-body)',
                textTransform: 'none', letterSpacing: 0, fontWeight: 500,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,194,13,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <User size={15} color="var(--yellow-500)" /> Edit Profile
            </button>
            <button
              type="button"
              onClick={() => { setShowMenu(false); onSignOut(); }}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'transparent', border: 'none',
                borderTop: '1px solid var(--ink-700)',
                color: 'var(--danger)',
                borderRadius: '0 0 var(--r-lg) var(--r-lg)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'flex-start', gap: '10px',
                fontSize: '0.85rem', fontFamily: 'var(--font-body)',
                textTransform: 'none', letterSpacing: 0, fontWeight: 500,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,77,77,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Date eyebrow */}
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.58rem',
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          color: 'var(--yellow-500)',
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
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 'clamp(3rem, 16vw, 5rem)',
          lineHeight: 0.92,
          color: 'var(--white)',
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          position: 'relative',
          zIndex: 1,
          marginBottom: '10px',
        }}
      >
        STEP<span style={{ color: 'var(--yellow-500)' }}>ARC</span>
      </h1>

      {/* Tagline */}
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.35)',
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

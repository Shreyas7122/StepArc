import { LayoutDashboard, BarChart2, Utensils, Dumbbell, ClipboardList } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Today',     Icon: LayoutDashboard },
  { id: 'history',   label: 'History',   Icon: BarChart2 },
  { id: 'food',      label: 'Nutrition', Icon: Utensils },
  { id: 'workout',   label: 'Training',  Icon: Dumbbell },
  { id: 'logs',      label: 'Logs',      Icon: ClipboardList },
];

const TabBar = ({ activeTab, setActiveTab, onResetDrafts }) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'food' || tab === 'workout') onResetDrafts();
  };

  return (
    <nav
      className="animate-slide-up delay-1"
      role="tablist"
      aria-label="Main Navigation"
      style={{
        display: 'flex',
        gap: '3px',
        background: 'var(--ink-900)',
        border: '1px solid var(--ink-700)',
        borderRadius: 'var(--r-lg)',
        padding: '5px',
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${label} tab`}
            onClick={() => handleTabClick(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '9px 4px',
              cursor: 'pointer',
              background: isActive ? 'var(--gradient-cta)' : 'transparent',
              color: isActive ? 'var(--black)' : 'var(--gray-400)',
              borderRadius: 'var(--r-md)',
              boxShadow: isActive ? 'var(--glow-yellow)' : 'none',
              transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              border: 'none',
              outline: 'none',
            }}
          >
            <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.52rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;

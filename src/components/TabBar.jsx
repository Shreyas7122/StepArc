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
      className="tabs animate-slide-up delay-1"
      role="tablist"
      aria-label="Main Navigation"
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
            className={isActive ? 'tab active' : 'tab'}
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

import { LayoutDashboard, Utensils, Dumbbell, ClipboardList } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Overview',  Icon: LayoutDashboard },
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
    <div className="tabs animate-slide-up delay-1">
      {TABS.map(({ id, label, Icon }) => (
        <div
          key={id}
          className={`tab ${activeTab === id ? 'active' : ''}`}
          onClick={() => handleTabClick(id)}
        >
          <Icon size={15} strokeWidth={2} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default TabBar;

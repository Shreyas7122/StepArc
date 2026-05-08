const TabBar = ({ activeTab, setActiveTab, onResetDrafts }) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'food' || tab === 'workout') {
      onResetDrafts();
    }
  };

  return (
    <div className="tabs animate-slide-up delay-1">
      <div
        className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => handleTabClick('dashboard')}
      >
        Overview
      </div>
      <div
        className={`tab ${activeTab === 'food' ? 'active' : ''}`}
        onClick={() => handleTabClick('food')}
      >
        Log Food
      </div>
      <div
        className={`tab ${activeTab === 'workout' ? 'active' : ''}`}
        onClick={() => handleTabClick('workout')}
      >
        Log Workout
      </div>
    </div>
  );
};

export default TabBar;

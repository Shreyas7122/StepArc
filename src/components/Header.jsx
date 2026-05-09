import { Activity } from 'lucide-react';

const Header = () => (
  <header className="header animate-slide-up">
    <div>
      <div className="date-text">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
      <h1 className="app-title">StepArc</h1>
    </div>
    <div className="logo-icon">
      <Activity color="white" size={22} strokeWidth={2.5} />
    </div>
  </header>
);

export default Header;

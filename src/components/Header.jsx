import { Target } from 'lucide-react';

const Header = () => (
  <header className="header animate-slide-up">
    <div>
      <div className="date-text">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
      <h1>MacroTrack</h1>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}>
      <Target color="var(--primary-color)" size={24} />
    </div>
  </header>
);

export default Header;

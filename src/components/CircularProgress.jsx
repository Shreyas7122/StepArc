const CircularProgress = ({ percentage, color, value, label, subtext }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--surface-border)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color }}>{value}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{subtext}</div>
      </div>
    </div>
  );
};

export default CircularProgress;

const CircularProgress = ({ percentage, color, value, label, subtext }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, percentage) / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        {/* Track */}
        <circle
          cx="45" cy="45" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="7"
        />
        {/* Progress */}
        <circle
          cx="45" cy="45" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>

      {/* Value */}
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 400,
            color: color,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--gray-300)',
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        {label}
      </div>

      {/* Subtext */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.62rem',
          color: 'var(--gray-500)',
          textAlign: 'center',
          marginTop: 1,
        }}
      >
        {subtext}
      </div>
    </div>
  );
};

export default CircularProgress;

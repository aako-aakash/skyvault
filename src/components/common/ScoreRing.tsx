import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  textColor?: string;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 80, textColor = '#fff' }) => {
  const pct   = ((score - 300) / (850 - 300)) * 100;
  const r     = size / 2 - 7;
  const circ  = 2 * Math.PI * r;
  const grade = score >= 750 ? 'Excellent' : score >= 680 ? 'Good' : score >= 600 ? 'Fair' : 'Poor';

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`Pre-approval score: ${score} out of 850 — ${grade}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={7}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={textColor} strokeWidth={7}
            strokeDasharray={`${(circ * pct) / 100} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ color: textColor }}
        >
          <span className="font-heading font-bold leading-none" style={{ fontSize: size * 0.23 }}>
            {score}
          </span>
          <span style={{ fontSize: size * 0.1, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            /850
          </span>
        </div>
      </div>
      <span style={{ fontSize: 11, opacity: 0.75, marginTop: 6, color: textColor }}>{grade}</span>
    </div>
  );
};

export default ScoreRing;

// components/ScoreCircle.jsx
// Animated SVG donut chart — SVG attributes stay inline; wrapper uses Tailwind

import React, { useEffect, useState } from 'react';

export const getScoreColor = (score) => {
  if (score >= 75) return { stroke: '#34d399', label: 'Great' };
  if (score >= 50) return { stroke: '#fbbf24', label: 'Okay' };
  if (score >= 25) return { stroke: '#fb713c', label: 'Weak' };
  return { stroke: '#f87171', label: 'Yikes' };
};

export const getGrade = (score) => {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
};

const ScoreCircle = ({
  score       = 0,
  size        = 140,
  strokeWidth = 10,
  label       = 'Overall Score',
  showGrade   = false,
  animate     = true,
}) => {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [mounted, setMounted]           = useState(false);

  const radius       = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center        = size / 2;
  const { stroke }    = getScoreColor(score);

  useEffect(() => {
    setMounted(true);
    if (!animate) return;
    let current = 0;
    const increment = score / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) { setDisplayScore(score); clearInterval(timer); }
      else                  { setDisplayScore(Math.floor(current)); }
    }, 30);
    return () => clearInterval(timer);
  }, [score, animate]);

  const progress   = mounted ? displayScore / 100 : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />

        {/* Progress */}
        <circle
          cx={center} cy={center} r={radius} fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: animate ? 'stroke-dashoffset 0.05s linear' : 'none',
            filter: `drop-shadow(0 0 6px ${stroke}80)`,
          }}
        />

        {/* Score */}
        <text x={center} y={center - (size * 0.06)} textAnchor="middle" dominantBaseline="middle"
              fill="#f1f1f3" fontSize={size * 0.22} fontWeight="800"
              fontFamily="'Space Grotesk', sans-serif" letterSpacing="-1">
          {displayScore}
        </text>

        {/* /100 */}
        <text x={center} y={center + (size * 0.14)} textAnchor="middle" dominantBaseline="middle"
              fill="#5a5a70" fontSize={size * 0.1} fontWeight="500" fontFamily="Inter, sans-serif">
          /100
        </text>
      </svg>

      <p className="text-[#9898ac] text-[0.72rem] font-semibold uppercase tracking-widest text-center">
        {label}
      </p>

      {showGrade && (
        <span className="text-xs font-bold tracking-wider" style={{ color: stroke }}>
          Grade: {getGrade(score)}
        </span>
      )}
    </div>
  );
};

export default ScoreCircle;

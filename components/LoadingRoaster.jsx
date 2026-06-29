// components/LoadingRoaster.jsx
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Reading your resume... oh my.",
  "Counting the buzzwords...",
  "Googling what 'rockstar developer' means...",
  "Finding the clichés you thought were clever...",
  "Judging your 2-page resume for a junior role...",
  "Wondering why you put 'proficient in Microsoft Word'...",
  "Noting that you've had 6 jobs in 3 years...",
  "Checking if your summary has 'passionate self-starter'...",
  "Sighing deeply at your skills section...",
  "Preparing the verdict. It will not be gentle.",
  "Almost done. Brace yourself.",
];

const LoadingRoaster = () => {
  const [msgIdx, setMsgIdx]   = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setMsgIdx((i) => (i + 1) % MESSAGES.length); setVisible(true); }, 300);
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">

      {/* Spinning fire ring */}
      <div className="relative w-[120px] h-[120px] flex items-center justify-center">
        <span className="text-5xl animate-float absolute z-10">🔥</span>
        <svg className="absolute inset-0 animate-spin-fast" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
          <circle cx="60" cy="60" r="54" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="200 140"
                  stroke="url(#lg)" transform="rotate(-90 60 60)"/>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fb713c"/><stop offset="1" stopColor="#f5a623"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h2 className="font-display text-2xl font-bold text-[#f1f1f3] tracking-tight">
        Roasting your resume...
      </h2>

      <p
        className="text-fire italic text-base max-w-sm min-h-[1.5em] transition-all duration-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
      >
        {MESSAGES[msgIdx]}
      </p>

      <p className="text-[#5a5a70] text-sm">Claude is reading every line. Brutally.</p>

      {/* Animated dots */}
      <div className="flex gap-2 mt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-fire/50 animate-pulse-fire"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingRoaster;

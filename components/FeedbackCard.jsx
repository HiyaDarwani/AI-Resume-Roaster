// components/FeedbackCard.jsx
import React, { useState } from 'react';
import ScoreCircle, { getScoreColor } from './ScoreCircle';

const FeedbackCard = ({ section, index = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const { stroke }              = getScoreColor(section.score);

  return (
    <div
      className="animate-fade-in bg-card-gradient border border-white/[0.06] rounded-2xl overflow-hidden
                 shadow-card hover:border-white/[0.12] transition-all duration-250"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      {/* Header (toggle) */}
      <button
        id={`feedback-section-${index}`}
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-transparent border-0 cursor-pointer flex items-center justify-between
                   px-6 py-5 gap-4 text-left"
      >
        <div className="flex items-center gap-4">
          <ScoreCircle score={section.score} size={52} strokeWidth={5} animate={false} />
          <div>
            <h3 className="text-[#f1f1f3] text-base font-bold font-display m-0 mb-1">
              {section.name}
            </h3>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{ color: stroke, background: `${stroke}18`, borderColor: `${stroke}40` }}
            >
              {section.score}/100
            </span>
          </div>
        </div>
        <span
          className="text-[#5a5a70] text-lg flex-shrink-0 transition-transform duration-250"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Roast */}
          <div className="bg-fire/[0.04] border border-fire/[0.12] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-fire text-[0.72rem] font-bold uppercase tracking-widest mb-3">
              🔥 The Roast
            </div>
            <p className="text-[#c4c4d4] text-sm leading-7 m-0 italic">{section.roast}</p>
          </div>

          <div className="h-px bg-white/[0.05]" />

          {/* Advice */}
          <div className="bg-brand-green/[0.04] border border-brand-green/[0.15] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-brand-green text-[0.72rem] font-bold uppercase tracking-widest mb-3">
              ✅ What to Do Instead
            </div>
            <p className="text-[#d4fae8] text-sm leading-7 m-0">{section.advice}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;

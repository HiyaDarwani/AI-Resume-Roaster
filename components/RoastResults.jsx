// components/RoastResults.jsx
import React from 'react';
import ScoreCircle, { getScoreColor, getGrade } from './ScoreCircle';
import FeedbackCard from './FeedbackCard';

const ROAST_LEVEL_CONFIG = {
  mild:    { emoji: '🌶️',      color: '#fbbf24', label: 'Mild Roast' },
  medium:  { emoji: '🌶️🌶️',    color: '#fb713c', label: 'Medium Roast' },
  spicy:   { emoji: '🌶️🌶️🌶️',  color: '#f87171', label: 'Spicy Roast' },
  nuclear: { emoji: '☢️',       color: '#ec4899', label: 'NUCLEAR Roast' },
};

const RoastLevelBadge = ({ level }) => {
  const cfg = ROAST_LEVEL_CONFIG[level] ?? { emoji: '🔥', color: '#fb713c', label: 'Roasted' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
      style={{ color: cfg.color, background: `${cfg.color}15`, borderColor: `${cfg.color}40` }}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
};

const RoastResults = ({ roast, filename }) => {
  if (!roast) return null;

  const { stroke: scoreColor } = getScoreColor(roast.overallScore);
  const grade                  = getGrade(roast.overallScore);

  return (
    <div className="flex flex-col gap-8">

      {/* ── Hero Score Banner ── */}
      <div className="bg-card-gradient border border-white/[0.08] rounded-3xl p-10 shadow-card-lg flex flex-wrap items-center gap-10">
        <div className="flex-shrink-0">
          <ScoreCircle score={roast.overallScore} size={160} strokeWidth={12} label="Overall Score" showGrade animate />
        </div>
        <div className="flex-1 min-w-[200px] flex flex-col gap-3">
          <RoastLevelBadge level={roast.roastLevel} />
          <h2 className="font-display text-3xl font-extrabold text-[#f1f1f3] tracking-tight m-0">
            Resume Roast Complete 🔥
          </h2>
          {filename && <p className="text-[#5a5a70] text-sm m-0">📄 {filename}</p>}
          <p className="text-[#c4c4d4] italic text-base leading-relaxed m-0">"{roast.tldr}"</p>
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <span
              className="px-3 py-1 rounded-full text-sm font-bold border"
              style={{ color: scoreColor, background: `${scoreColor}15`, borderColor: `${scoreColor}50` }}
            >
              Grade: {grade}
            </span>
            <span className={`text-sm font-bold ${roast.hireable ? 'text-brand-green' : 'text-brand-red'}`}>
              {roast.hireable ? '✅ Hireable' : '❌ Not Hireable (yet)'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Section Mini Scores ── */}
      {roast.sections?.length > 0 && (
        <div className="bg-card-gradient border border-white/[0.06] rounded-2xl px-6 py-7 flex flex-wrap gap-5 justify-center">
          {roast.sections.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
              <ScoreCircle score={s.score} size={72} strokeWidth={6} animate={false} />
              <p className="text-[#9898ac] text-[0.68rem] font-semibold uppercase tracking-wider text-center m-0 max-w-[80px]">
                {s.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Section-by-Section Cards ── */}
      {roast.sections?.length > 0 && (
        <section>
          <h3 className="font-display text-xl font-bold text-[#f1f1f3] tracking-tight mb-4">
            Section-by-Section Breakdown
          </h3>
          <div className="flex flex-col gap-3">
            {roast.sections.map((section, i) => (
              <FeedbackCard key={i} section={section} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Red & Green Flags ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {roast.redFlags?.length > 0 && (
          <div className="bg-brand-red/[0.04] border border-brand-red/[0.15] rounded-2xl p-6">
            <h3 className="text-brand-red text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
              🚩 Red Flags
            </h3>
            <ul className="list-none flex flex-col gap-2.5">
              {roast.redFlags.map((flag, i) => (
                <li key={i} className="flex gap-2.5 text-[#e8b4b4] text-sm leading-relaxed">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {roast.greenFlags?.length > 0 && (
          <div className="bg-brand-green/[0.04] border border-brand-green/[0.15] rounded-2xl p-6">
            <h3 className="text-brand-green text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
              ✅ Green Flags
            </h3>
            <ul className="list-none flex flex-col gap-2.5">
              {roast.greenFlags.map((flag, i) => (
                <li key={i} className="flex gap-2.5 text-[#b4e8d0] text-sm leading-relaxed">
                  <span className="flex-shrink-0 mt-0.5">⭐</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Final Verdict ── */}
      {roast.finalVerdict && (
        <div className="flex gap-6 items-start p-8 rounded-2xl border border-fire/25"
             style={{ background: 'linear-gradient(135deg, rgba(251,113,60,0.08) 0%, rgba(245,166,35,0.06) 100%)' }}>
          <span className="text-4xl flex-shrink-0">⚖️</span>
          <div>
            <h3 className="text-fire text-xs font-bold uppercase tracking-widest mb-3">Final Verdict</h3>
            <p className="text-[#d4c4b8] text-base leading-[1.8] italic m-0">{roast.finalVerdict}</p>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="flex gap-3 flex-wrap justify-center pt-2">
        <a href="/upload" id="roast-another-btn" className="btn-primary text-sm px-7 py-3.5">
          🔥 Roast Another Resume
        </a>
        <button onClick={() => window.print()} id="print-results-btn" className="btn-secondary text-sm px-7 py-3.5">
          🖨️ Print Results
        </button>
      </div>
    </div>
  );
};

export default RoastResults;

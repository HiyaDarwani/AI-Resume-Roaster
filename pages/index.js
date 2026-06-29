// pages/index.js — Landing Page
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import Header from '../components/Header';

const FEATURES = [
  { icon: '🔥', title: 'Brutally Honest',      desc: "We don't sugarcoat. Every cliché, vague bullet, and rookie mistake gets called out." },
  { icon: '🎯', title: 'Constructive Feedback', desc: "Every roast comes with a fix. We show exactly what to write, not just what's wrong." },
  { icon: '⚡', title: 'Instant Results',       desc: 'Upload your PDF and get a full AI analysis in under 30 seconds.' },
  { icon: '📊', title: 'Scored Sections',       desc: 'Each section gets an individual score so you know where to focus your energy first.' },
];

const SAMPLE_ROAST = {
  section: 'Work Experience',
  roast: '"Responsible for managing team deliverables and synergizing cross-functional stakeholders to drive impactful outcomes." — This sentence says absolutely nothing. A hiring manager has read this exact sentence 10,000 times this week.',
  advice: 'Replace with numbers: "Led a team of 5 engineers, shipped 3 features in Q3, reduced bug backlog by 40%."',
};

export default function Home() {
  const { data: session } = useSession();

  const CTAButton = ({ id, children }) => (
    <Link href="/upload" id={id} className="btn-primary text-base">
      {children}
    </Link>
  );

  return (
    <>
      <Head>
        <title>Resume Roaster — Brutally Honest AI Feedback on Your Resume</title>
        <meta name="description" content="Upload your PDF resume and get brutal, constructive AI feedback powered by Claude. Score your resume, spot red flags, and get actionable advice instantly." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔥</text></svg>" />
      </Head>

      <Header />

      <main>
        {/* ── Hero ── */}
        <section className="relative flex justify-center px-6 py-[120px] overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow pointer-events-none" aria-hidden="true" />
          <div className="relative z-10 max-w-2xl text-center flex flex-col items-center gap-6">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fire/10 border border-fire/25 text-fire text-sm font-semibold">
              🔥 AI-Powered Resume Analysis
            </div>

            <h1 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] font-black text-[#f1f1f3] tracking-[-0.04em] leading-none m-0">
              Your Resume<br />
              <span className="text-gradient">Deserves the Truth</span>
            </h1>

            <p className="text-[#9898ac] text-lg leading-[1.7] max-w-xl m-0">
              Upload your PDF resume. Claude AI reads every line and delivers a{' '}
              <strong className="text-fire font-semibold">brutal but constructive roast</strong>.
              No sugarcoating. No buzzword tolerance.
            </p>

            <div className="flex flex-col items-center gap-3">
              <CTAButton id="hero-cta-btn">🔥 Get Roasted — Sign In Free</CTAButton>
              <p className="text-[#5a5a70] text-xs m-0">No credit card · PDF upload · Results in 30s</p>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 flex-wrap justify-center pt-3">
              {[
                { val: '10+',    label: 'Sections Analyzed' },
                { val: '4-Layer', label: 'AI Prompting' },
                { val: '0%',     label: 'Sugarcoating' },
                { val: '<30s',   label: 'Turnaround' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="font-display text-[1.4rem] font-extrabold text-[#f1f1f3] tracking-tight">{s.val}</span>
                  <span className="text-[#5a5a70] text-[0.72rem] uppercase tracking-widest font-semibold">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-[#f1f1f3] text-center tracking-tight mb-2">
              How It Works
            </h2>
            <p className="text-[#5a5a70] text-center text-sm mb-12">Three steps between you and the truth</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', icon: '🔐', title: 'Sign In',      desc: 'Authenticate with your Google account in one click.' },
                { step: '02', icon: '📤', title: 'Upload PDF',   desc: 'Drag and drop your resume PDF. Max 5 MB.' },
                { step: '03', icon: '🔥', title: 'Get Roasted',  desc: 'Claude analyzes every section and delivers your score, red flags, and fixes.' },
              ].map((s) => (
                <div key={s.step} className="card flex flex-col gap-3">
                  <span className="text-fire/30 text-xs font-extrabold tracking-widest font-display">{s.step}</span>
                  <span className="text-3xl">{s.icon}</span>
                  <h3 className="font-display text-lg font-bold text-[#f1f1f3] m-0">{s.title}</h3>
                  <p className="text-[#9898ac] text-sm leading-relaxed m-0">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-20 px-6 bg-dark-800/60">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-[#f1f1f3] text-center tracking-tight mb-2">
              What You Get
            </h2>
            <p className="text-[#5a5a70] text-center text-sm mb-12">Everything a real hiring manager would say, minus the HR filter</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((f) => (
                <div key={f.title} className="card flex flex-col gap-3">
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="font-display text-base font-bold text-[#f1f1f3] m-0">{f.title}</h3>
                  <p className="text-[#9898ac] text-sm leading-relaxed m-0">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sample Roast ── */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-[#f1f1f3] text-center tracking-tight mb-2">
              A Taste of the Roast
            </h2>
            <p className="text-[#5a5a70] text-center text-sm mb-10">Here's what Claude says about typical resume nonsense</p>

            <div className="bg-card-gradient border border-white/[0.08] rounded-2xl overflow-hidden shadow-card-lg">
              <div className="px-7 pt-5">
                <span className="text-[#9898ac] text-xs font-semibold uppercase tracking-widest">📋 {SAMPLE_ROAST.section}</span>
              </div>
              <div className="px-7 py-5 mt-4 bg-fire/[0.04] border-t border-fire/[0.1] border-b border-white/[0.04]">
                <p className="text-fire text-[0.72rem] font-bold uppercase tracking-widest mb-2.5">🔥 The Roast</p>
                <p className="text-[#c4c4d4] text-sm leading-[1.8] italic m-0">{SAMPLE_ROAST.roast}</p>
              </div>
              <div className="px-7 py-5 bg-brand-green/[0.03]">
                <p className="text-brand-green text-[0.72rem] font-bold uppercase tracking-widest mb-2.5">✅ What to Write Instead</p>
                <p className="text-[#d4fae8] text-sm leading-[1.8] m-0">{SAMPLE_ROAST.advice}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 px-6 text-center"
                 style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(251,113,60,0.04) 50%, transparent 100%)' }}>
          <div className="max-w-lg mx-auto flex flex-col items-center gap-5">
            <span className="text-5xl">🔥</span>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-[#f1f1f3] tracking-tight m-0">
              Ready to Face the Truth?
            </h2>
            <p className="text-[#9898ac] text-base leading-[1.7] m-0">
              Stop wondering why you're not getting callbacks. Let Claude tell you exactly what's wrong — and how to fix it.
            </p>
            <CTAButton id="final-cta-btn">Sign In & Get Roasted Free</CTAButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.05] py-8 px-6 text-center">
        <p className="text-[#5a5a70] text-sm m-0">🔥 Resume Roaster · Built with Next.js 14, Claude AI & Tailwind CSS</p>
      </footer>
    </>
  );
}

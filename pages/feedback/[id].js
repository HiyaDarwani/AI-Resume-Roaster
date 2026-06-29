// pages/feedback/[id].js — Dynamic feedback page
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import RoastResults from '../../components/RoastResults';

export default function FeedbackPage() {
  const [roast,    setRoast]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('latestRoast');
      if (cached) { setRoast(JSON.parse(cached)); setLoading(false); return; }
    } catch (_) {}
    setNotFound(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-full border-[3px] border-white/[0.08] border-t-fire animate-spin" />
        </div>
      </>
    );
  }

  if (notFound || !roast) {
    return (
      <>
        <Head><title>Roast Not Found — Resume Roaster</title></Head>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-10 gap-4 text-center">
          <span className="text-6xl">🤷</span>
          <h2 className="font-display text-[1.8rem] font-extrabold text-[#f1f1f3] tracking-tight m-0">
            Roast Not Found
          </h2>
          <p className="text-[#9898ac] text-base leading-[1.7] max-w-sm m-0">
            This roast session has expired or doesn't exist. Please upload your resume again.
          </p>
          <Link href="/upload" id="back-to-upload-btn" className="btn-primary mt-2">
            🔥 Upload Resume
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Your Resume Roast Results — Resume Roaster</title>
        <meta name="description" content="See your AI-powered resume roast results from Claude. Scores, red flags, and actionable feedback for every section." />
      </Head>
      <Header />
      <main className="py-16 px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <h1 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-[#f1f1f3] tracking-tight m-0">
              Your Resume Roast 🔥
            </h1>
            <Link href="/upload" id="roast-again-btn"
                  className="btn-ghost border border-white/[0.08] text-sm px-4 py-2 rounded-xl">
              ← Roast Another
            </Link>
          </div>
          <RoastResults roast={roast} />
        </div>
      </main>
    </>
  );
}

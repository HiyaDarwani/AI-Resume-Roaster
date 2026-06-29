// pages/upload.js — Upload & Roast Page
import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import Header from '../components/Header';
import UploadDropzone from '../components/UploadDropzone';
import LoadingRoaster from '../components/LoadingRoaster';
import RoastResults from '../components/RoastResults';

const STEPS = { IDLE: 'idle', UPLOADING: 'uploading', ROASTING: 'roasting', DONE: 'done', ERROR: 'error' };

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 12.076 17.64 9.769 17.64 9.2Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

export default function UploadPage() {
  const { data: session, status } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [step,         setStep]         = useState(STEPS.IDLE);
  const [roastData,    setRoastData]    = useState(null);
  const [errorMsg,     setErrorMsg]     = useState('');

  const handleFileSelected = useCallback((file) => {
    setSelectedFile(file);
    setStep(STEPS.IDLE);
    setErrorMsg('');
    setRoastData(null);
  }, []);

  const handleRoast = async () => {
    if (!selectedFile) return;
    setErrorMsg('');

    try {
      // ── Step 1: Extract PDF text ──
      setStep(STEPS.UPLOADING);
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const uploadRes  = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed. Please try again.');

      // ── Step 2: Claude roast ──
      setStep(STEPS.ROASTING);
      const roastRes  = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: uploadData.resumeText,
          filename: selectedFile?.name || 'resume.pdf'
        }),
      });
      const roastResult = await roastRes.json();
      if (!roastRes.ok) throw new Error(roastResult.error || 'The roast failed. Please try again.');

      setRoastData(roastResult.roast);
      setStep(STEPS.DONE);

    } catch (err) {
      console.error('Roast flow error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStep(STEPS.ERROR);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStep(STEPS.IDLE);
    setRoastData(null);
    setErrorMsg('');
  };

  // ── Auth loading ──
  if (status === 'loading') {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-full border-[3px] border-white/[0.08] border-t-fire animate-spin" />
        </div>
      </>
    );
  }

  // ── Auth gate ──
  if (!session) {
    return (
      <>
        <Head><title>Sign In — Resume Roaster</title></Head>
        <Header />
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-6 py-10">
          <div className="bg-card-gradient border border-white/[0.06] rounded-3xl p-14 max-w-md w-full flex flex-col items-center gap-4 text-center shadow-card-lg">
            <span className="text-5xl">🔐</span>
            <h2 className="font-display text-2xl font-extrabold text-[#f1f1f3] tracking-tight m-0">
              Sign In to Get Roasted
            </h2>
            <p className="text-[#9898ac] text-base leading-[1.7] m-0">
              You need to sign in with Google to upload and roast your resume. Free, takes 10 seconds.
            </p>
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => signIn('google')}
                id="upload-page-signin-btn"
                className="flex items-center justify-center gap-2.5 bg-white text-[#1a1a1a] border-0
                           px-7 py-3.5 rounded-xl text-base font-bold cursor-pointer
                           shadow-[0_2px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]
                           hover:-translate-y-0.5 transition-all duration-200"
              >
                <GoogleIcon /> Continue with Google
              </button>
              <button
                onClick={() => signIn('credentials')}
                id="upload-page-sandbox-signin-btn"
                className="btn-secondary w-full py-3.5 rounded-xl border-dashed"
              >
                🧪 Sign in as Sandbox Tester (Demo Mode)
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Upload Resume — Resume Roaster</title>
        <meta name="description" content="Upload your PDF resume for a brutal AI-powered roast. Get scored, see red flags, and receive actionable advice." />
      </Head>
      <Header />

      <main className="py-16 px-6 pb-24">
        <div className="max-w-2xl mx-auto">

          {/* ── Loading ── */}
          {(step === STEPS.UPLOADING || step === STEPS.ROASTING) && <LoadingRoaster />}

          {/* ── Results ── */}
          {step === STEPS.DONE && roastData && (
            <>
              <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                <h1 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-[#f1f1f3] tracking-tight m-0">
                  Your Resume Roast 🔥
                </h1>
                <button onClick={handleReset} id="start-over-btn"
                        className="btn-ghost border border-white/[0.08] text-sm px-4 py-2 rounded-xl">
                  ↩ Start Over
                </button>
              </div>
              <RoastResults roast={roastData} filename={selectedFile?.name} />
            </>
          )}

          {/* ── Upload form ── */}
          {(step === STEPS.IDLE || step === STEPS.ERROR) && (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-[#f1f1f3] tracking-tight m-0 mb-2">
                  Upload Your Resume
                </h1>
                <p className="text-[#5a5a70] text-sm m-0">PDF only · Max 5 MB · Results in ~30 seconds</p>
              </div>

              <div className="bg-card-gradient border border-white/[0.06] rounded-2xl p-8 flex flex-col gap-5 shadow-card-lg mb-6">
                <UploadDropzone onFileSelected={handleFileSelected} disabled={false} />

                {/* Error banner */}
                {step === STEPS.ERROR && errorMsg && (
                  <div role="alert" className="flex items-start gap-3 px-5 py-4 bg-brand-red/[0.08] border border-brand-red/25 rounded-xl text-[#f8b4b4] text-sm leading-relaxed">
                    <span className="flex-shrink-0 text-base">❌</span>
                    <div>
                      <strong className="block mb-1 text-brand-red">Something went wrong</strong>
                      {errorMsg}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleRoast}
                  disabled={!selectedFile}
                  id="roast-submit-btn"
                  className="btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                >
                  🔥 Roast My Resume
                </button>

                <p className="text-[#5a5a70] text-xs text-center m-0">
                  Your resume is processed securely and not stored on our servers.
                </p>
              </div>

              {/* Tips */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
                <h3 className="text-[#9898ac] text-xs font-bold uppercase tracking-widest mb-4">
                  💡 Tips for Best Results
                </h3>
                <ul className="list-none flex flex-col gap-2.5">
                  {[
                    'Use a text-based PDF (not a scanned image)',
                    'Keep your resume under 5 MB',
                    'Make sure the PDF is not password-protected',
                    'Standard single or double column formats work best',
                  ].map((tip) => (
                    <li key={tip} className="flex gap-2.5 text-[#5a5a70] text-sm leading-relaxed">
                      <span className="text-fire flex-shrink-0">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

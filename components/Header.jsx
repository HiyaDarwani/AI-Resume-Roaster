// components/Header.jsx
import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 12.076 17.64 9.769 17.64 9.2Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const Header = () => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline flex-shrink-0">
          <span className="text-2xl leading-none">🔥</span>
          <span className="font-display text-xl font-bold text-[#f1f1f3] tracking-tight">
            Resume<span className="text-fire">Roaster</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          <Link href="/"
            className="text-[#9898ac] no-underline text-sm font-medium px-3 py-1.5 rounded-lg
                       hover:text-[#f1f1f3] hover:bg-white/[0.05] transition-all duration-200">
            Home
          </Link>
          {session && (
            <Link href="/upload"
              className="text-[#9898ac] no-underline text-sm font-medium px-3 py-1.5 rounded-lg
                         hover:text-[#f1f1f3] hover:bg-white/[0.05] transition-all duration-200">
              Roast Mine
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center flex-shrink-0">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-2.5">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-8 h-8 rounded-full border-2 border-fire/40"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="text-[#f1f1f3] text-sm font-medium hidden sm:block">
                {session.user?.name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut()}
                id="sign-out-btn"
                className="btn-ghost text-sm px-3 py-1.5 border border-white/[0.12] rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => signIn('google')}
                id="sign-in-btn"
                className="flex items-center gap-2 bg-white text-[#1a1a1a] border-0
                           px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer
                           shadow-[0_2px_8px_rgba(0,0,0,0.4)]
                           hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)]
                           hover:-translate-y-px transition-all duration-200"
              >
                <GoogleIcon />
                Sign in
              </button>
              <button
                onClick={() => signIn('credentials')}
                id="sandbox-sign-in-btn"
                className="btn-secondary text-xs px-3 py-2 rounded-xl border-dashed"
              >
                Sandbox Mode 🧪
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        fire: {
          DEFAULT: '#fb713c',
          light: '#ff9a6c',
        },
        dark: {
          950: '#0a0a0f',
          900: '#111118',
          800: '#16161f',
          700: '#1a1a24',
          600: '#1e1e2a',
        },
        brand: {
          green: '#34d399',
          red: '#f87171',
          gold: '#f5a623',
          blue: '#818cf8',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      animation: {
        float:        'float 3s ease-in-out infinite',
        'pulse-fire': 'pulse-fire 1.2s ease-in-out infinite',
        'spin-fast':  'spin 1.2s linear infinite',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'slide-up':   'slideUp 0.5s ease forwards',
      },
      boxShadow: {
        fire:    '0 4px 20px rgba(251,113,60,0.35)',
        'fire-lg':'0 8px 40px rgba(251,113,60,0.5)',
        card:    '0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
        'card-lg':'0 8px 40px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'fire-gradient': 'linear-gradient(135deg, #fb713c 0%, #f5a623 100%)',
        'card-gradient': 'linear-gradient(145deg, #16161f 0%, #1a1a24 100%)',
        'hero-glow':     'radial-gradient(ellipse at 50% 0%, rgba(251,113,60,0.12) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
};

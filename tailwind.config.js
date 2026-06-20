/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ============================================================
      // Brand Colors — Twistgram "Cosmic Violet → Blue"
      // ============================================================
      colors: {
        // Primary: Violet
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Accent: Blue
        accent: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Surface: Dark mode backgrounds
        surface: {
          950: '#09090f',
          900: '#111118',
          800: '#1c1c27',
          700: '#2a2a3d',
          600: '#38384f',
          500: '#4a4a61',
        },
        // Success / Warning / Danger
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },

      // ============================================================
      // Typography
      // ============================================================
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      // ============================================================
      // Gradients (registered as background-image utilities)
      // ============================================================
      backgroundImage: {
        'brand-gradient':     'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
        'brand-gradient-r':   'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'brand-gradient-t':   'linear-gradient(to top, #8b5cf6 0%, #3b82f6 100%)',
        'surface-gradient':   'linear-gradient(135deg, #1c1c27 0%, #111118 100%)',
        'glow-brand':         'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)',
      },

      // ============================================================
      // Box Shadow
      // ============================================================
      boxShadow: {
        'glow-sm':    '0 0 12px rgba(139, 92, 246, 0.25)',
        'glow-md':    '0 0 24px rgba(139, 92, 246, 0.35)',
        'glow-lg':    '0 0 40px rgba(139, 92, 246, 0.45)',
        'glow-blue':  '0 0 20px rgba(59, 130, 246, 0.3)',
        'card':       '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5)',
        'modal':      '0 25px 50px rgba(0,0,0,0.7)',
      },

      // ============================================================
      // Border Radius
      // ============================================================
      borderRadius: {
        '4xl': '2rem',
      },

      // ============================================================
      // Animation
      // ============================================================
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to:   { opacity: '0', transform: 'translateY(8px)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(139,92,246,0.25)' },
          '50%':       { boxShadow: '0 0 24px rgba(139,92,246,0.5)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'progress': {
          from: { width: '100%' },
          to:   { width: '0%' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.2s ease-out',
        'fade-out':      'fade-out 0.2s ease-in',
        'slide-in-right':'slide-in-right 0.25s ease-out',
        'slide-up':      'slide-up 0.3s ease-out',
        'scale-in':      'scale-in 0.2s ease-out',
        'spin-slow':     'spin-slow 1.2s linear infinite',
        'pulse-glow':    'pulse-glow 2s ease-in-out infinite',
        'toast-in':      'toast-in 0.3s ease-out',
        'progress':      'progress linear forwards',
      },

      // ============================================================
      // Screens (breakpoints)
      // ============================================================
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};

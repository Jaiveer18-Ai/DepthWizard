/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        geo: {
          bg: '#07111F',
          'bg-alt': '#0B1728',
          surface: '#101E31',
          elevated: '#14263D',
          border: '#1E314B',
          'border-subtle': '#16273C',
          cyan: '#06b6d4',
          teal: '#14b8a6',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          text: '#f8fafc',
          muted: '#94a3b8',
          subtle: '#64748b',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'geo-card': '0 8px 30px rgba(0, 0, 0, 0.45)',
        'geo-glow': '0 0 25px -5px rgba(6, 182, 212, 0.2)',
        'geo-elevated': '0 12px 40px rgba(0, 0, 0, 0.55)',
        'geo-glow-lg': '0 0 50px -10px rgba(6, 182, 212, 0.3)',
        'geo-glow-xl': '0 0 80px -15px rgba(6, 182, 212, 0.2)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px -5px rgba(6, 182, 212, 0.15)' },
          '50%': { boxShadow: '0 0 40px -5px rgba(6, 182, 212, 0.35)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(6, 182, 212, 0.2)' },
          '50%': { borderColor: 'rgba(6, 182, 212, 0.6)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 10s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 6s ease infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'subtle-pulse': 'subtlePulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

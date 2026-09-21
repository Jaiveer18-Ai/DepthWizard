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
      }
    },
  },
  plugins: [],
}

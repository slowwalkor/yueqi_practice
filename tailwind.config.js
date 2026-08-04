/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bamboo: { light: '#4a7c23', DEFAULT: '#2d5016', dark: '#1a3009' },
        cream: '#f5f0e8',
        amber: '#d97706',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.5)' },
          '70%': { boxShadow: '0 0 0 12px rgba(220, 38, 38, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0)' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.2s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bamboo: {
          50: '#f0f7ed',
          100: '#d4e8cc',
          light: '#4a7c23',
          DEFAULT: '#2d5016',
          dark: '#1a3b0a',
        },
        ink: {
          DEFAULT: '#2c2c2c',
          light: '#5a5a5a',
          wash: '#9b9b9b',
        },
        paper: {
          DEFAULT: '#f8f4ec',
          warm: '#f3ece0',
        },
        vermilion: '#c41d1d',
        gold: '#b8860b',
        cream: '#f5f0e8',
        amber: '#d97706',
      },
      fontFamily: {
        brush: ['STKaiti', 'KaiTi', 'FangSong', 'serif'],
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
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.2s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'page-enter': 'fadeSlideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

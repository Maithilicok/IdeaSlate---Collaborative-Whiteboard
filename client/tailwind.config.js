/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pin: {
          50:  '#fff0f3',
          100: '#fce8ef',
          200: '#f5c0cc',
          300: '#ff6b8a',
          400: '#ff1a3a',
          500: '#e60023',
          600: '#c0001e',
          700: '#4d0025',
          800: '#280015',
          900: '#1e0010',
          950: '#130008',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        pin:    '0 4px 24px rgba(230,0,35,0.18)',
        'pin-lg': '0 12px 48px rgba(230,0,35,0.28)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'scale-in': 'scaleIn 0.3s ease both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
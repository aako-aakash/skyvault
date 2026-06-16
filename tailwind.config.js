/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EBF3FB',
          100: '#C7DCF2',
          200: '#9EC0E8',
          300: '#6FA0D9',
          400: '#4A84CC',
          500: '#2980B9',
          600: '#1F4E79',
          700: '#163855',
          800: '#0E2537',
          900: '#06121A',
          DEFAULT: '#1F4E79',
        },
        success: {
          DEFAULT: '#27AE60',
          light: '#EBF8F1',
          border: '#A7D9B7',
        },
        warning: {
          DEFAULT: '#F39C12',
          light: '#FFF7ED',
          border: '#FAD097',
        },
        danger: {
          DEFAULT: '#E74C3C',
          light: '#FEF0F0',
          border: '#F5C0C0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 8px 32px rgba(0,0,0,0.13)',
        float: '0 4px 16px rgba(0,0,0,0.09)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'pulse-dot': 'pulseDot 2s infinite',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
      },
    },
  },
  plugins: [],
};

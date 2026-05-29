/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1F4C',
          900: '#0A1638',
          700: '#1A2D5E',
        },
        accent: {
          green: '#39D77B',
          mint:  '#A8F0C8',
          deep:  '#0F4E3A',
        },
        cream: '#F4F4EF',
        ink: '#0A0A0A',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans:    ['"Inter Tight"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,31,76,0.04), 0 4px 12px rgba(15,31,76,0.06)',
      },
    },
  },
  plugins: [],
};
module.exports = config;

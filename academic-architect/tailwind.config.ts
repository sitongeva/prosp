import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pulled from your mockups
        navy: {
          DEFAULT: '#0F1F4C',   // primary deep navy (headers, buttons)
          900: '#0A1638',
          700: '#1A2D5E',
        },
        accent: {
          green: '#39D77B',     // step pill + progress bar
          mint:  '#A8F0C8',
          deep:  '#0F4E3A',     // green-dark sidebar callouts
        },
        cream: '#F4F4EF',       // page background
        ink: '#0A0A0A',
      },
      fontFamily: {
        // Distinctive, refined editorial pairing
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
export default config;

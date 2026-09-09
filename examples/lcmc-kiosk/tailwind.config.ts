import type { Config } from 'tailwindcss';

/**
 * PLACEHOLDER LCMC Health palette — not official brand tokens.
 * Confirm navy/teal/green with brand before go-live. Do not treat these hex
 * values as approved Brandfolder colors.
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lcmc: {
          navy: '#0A3D62',
          'navy-dark': '#06263D',
          teal: '#0E8A8A',
          'teal-light': '#14B0B0',
          green: '#00A74D',
          cream: '#F4F7F8',
          ink: '#1A2B33',
          muted: '#4A5C64',
        },
      },
      minHeight: {
        tap: '64px',
      },
      minWidth: {
        tap: '64px',
      },
    },
  },
  plugins: [],
};

export default config;

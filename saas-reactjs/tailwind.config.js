import { COLORS } from './src/config/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        error: COLORS.error,
        success: COLORS.success,
      },
    },
  },
  plugins: [],
};

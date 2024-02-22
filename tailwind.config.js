/** @type {import('tailwindcss').Config} */

import { content, theme } from '@luminescent/ui/config';

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', ...content],
  theme: {
    extend: {
      animation: {
        ...theme.extend.animation,
      },
      keyframes: {
        ...theme.extend.keyframes,
      },
    },
  },
  plugins: [
    require('@anuragroy/tailwindcss-animate'),
  ]
};

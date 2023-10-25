/** @type {import('tailwindcss').Config} */

const gray = {
  50: "hsl(0deg, 0%, 95%)",
  100: "hsl(0deg, 0%, 85%)",
  200: "hsl(0deg, 0%, 75%)",
  300: "hsl(0deg, 0%, 65%)",
  400: "hsl(0deg, 0%, 55%)",
  500: "hsl(0deg, 0%, 45%)",
  600: "hsl(0deg, 0%, 32%)",
  700: "hsl(0deg, 0%, 21%)",
  800: "hsl(0deg, 0%, 12%)",
  900: "hsl(0deg, 0%, 5%)",
};

const luminescent = {
  50: "hsl(286deg, 65%, 97%)",
  100: "hsl(286deg, 60%, 95%)",
  200: "hsl(286deg, 55%, 90%)",
  300: "hsl(286deg, 50%, 82%)",
  400: "hsl(286deg, 45%, 75%)",
  500: "hsl(286deg, 40%, 60%)",
  600: "hsl(286deg, 35%, 51%)",
  700: "hsl(286deg, 30%, 42%)",
  800: "hsl(286deg, 25%, 35%)",
  900: "hsl(286deg, 20%, 30%)",
  950: "hsl(286deg, 15%, 17%)"
};

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { gray, luminescent },
      animation: {
        blob: "blob 16s infinite",
        float: "float 6s infinite"
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)"
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.2)"
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.8)"
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)"
          }
        },
        float: {
          "0%": {
            transform: "translatey(0px);"
          },
          "50%": {
            transform: "translatey(-20px);"
          },
          "100%": {
            transform: "translatey(0px);"
          }
        }
      }
    },
  },
  plugins: [],
};
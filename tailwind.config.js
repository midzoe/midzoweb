/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#44a46b',
        secondary: '#4748cc',
        gold: {
          50: '#FDFBF7',
          100: '#FBF5EE',
          200: '#F7E8DC',
          300: '#F0D5C4',
          400: '#E8BFA5',
          500: '#D4AF37',
          600: '#C9A12E',
          700: '#A68220',
          800: '#8B6914',
          900: '#704F0E',
        },
      },
    },
  },
  plugins: [],
}
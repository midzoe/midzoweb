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
        'primary-dark': '#2f8f5c',
        secondary: '#4748cc',
        cream: '#FBF7F0',
        gold: {
          50: '#FDFBF7',
          100: '#FBF5EE',
          200: '#F1E4D0',
          300: '#E6D2B0',
          400: '#D9BC85',
          500: '#C9A227',
          600: '#B08A1E',
          700: '#8B6914',
          800: '#6E520F',
          900: '#573F0C',
        },
      },
      fontFamily: {
        // Éditorial : titres en serif chaleureux (Fraunces), corps sur la pile existante.
        display: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
      },
      boxShadow: {
        // Ombres douces et chaudes (pas de halo coloré).
        card: '0 1px 2px rgba(87,63,12,0.04), 0 8px 24px -12px rgba(87,63,12,0.12)',
        'card-hover': '0 14px 32px -14px rgba(87,63,12,0.22)',
      },
    },
  },
  plugins: [],
}

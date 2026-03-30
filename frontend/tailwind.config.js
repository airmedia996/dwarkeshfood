/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        'coffee': '#6F4E37',
        'gold': '#D4A574',
        'dark-coffee': '#4A3728',
        'light-coffee': '#B8956A'
      },
      spacing: {
        'section': '5rem'
      }
    },
  },
  plugins: [],
}

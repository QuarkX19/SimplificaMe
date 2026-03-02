/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neuro: {
          cyan: '#00ffff',
          dark: '#02040a',
          card: '#050811'
        }
      }
    },
  },
  plugins: [],
}
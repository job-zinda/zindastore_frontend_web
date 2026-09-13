/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zinda': '#6B21A8',
        'zinda-light': '#F5F0FF',
        'zinda-text': '#1F2937',
      }
    },
  },
  plugins: [],
}
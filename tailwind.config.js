/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617', // Main background
          900: '#0f172a', // Card background
          800: '#1e293b', // Borders
        },
        neonGreen: '#22c55e',
        neonRed: '#ef4444',
      },
    },
  },
  plugins: [],
}
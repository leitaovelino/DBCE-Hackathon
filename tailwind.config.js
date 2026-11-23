/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        goa: {
          blue: '#0E7490',      // Deep Ocean Turquoise
          blueLight: '#E0F2FE', // Serene Sky Blue tint
          sand: '#F7EEDD',      // Warm golden sand
          green: '#059669',     // Lush Western Ghats green
          emerald: '#10B981',   // Nature / Low crowd green
          amber: '#F59E0B',     // Moderate crowd amber
          orange: '#EA580C',    // High crowd sunset orange
          red: '#DC2626',       // Heavy congestion red
          dark: '#0F172A',      // Slate 900
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

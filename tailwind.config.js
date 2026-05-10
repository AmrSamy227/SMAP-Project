
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#06b6d4', // cyan-500 (replacing purple #5B4FCF)
        secondary: '#0891b2', // cyan-600 (replacing teal #0B7B7B)
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      borderRadius: {
        'card': '8px',
        'input': '6px',
        'pill': '999px',
      }
    },
  },
  plugins: [],
}

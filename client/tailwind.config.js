/** @type {import('tailwindcss').Config} */
export default {
  // ✅ This line is required for the manual Dark/Light switch to work
  darkMode: 'class', 

  content: [
    "./index.html", 
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
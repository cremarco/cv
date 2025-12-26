/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'ink': '#252338',
        'muted': '#6f7283',
        'subtle': '#9fa3b5',
        'accent': '#6a42c2',
        'accent-soft': '#eee2f7',
        'line': '#e5e5ea',
        'sidebar-bg': '#fcfcfe',
      }
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.html"
  ],
  theme: {
    extend: {
      spacing: {
        '54': '13.5rem',
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
      },
      colors: {
        'ink': '#2e2e48',
        'muted': '#79819a',
        'subtle': '#9fa3b5',
        'accent': '#9251f7',
        'accent-soft': '#efe2f9',
        'accent-lightest': '#f8f2fc',
        'accent-dark': '#5531a7',
        'line': '#e2e6ee',
        'sidebar-bg': '#ffffff',
        'gray-dark': '#47516b',
        'gray-darkest': '#232339',
        'gray-lighter': '#d9dfe8',
        'gray-lightest': '#f7f9fc',
        'linkedin': '#0077b5',
        'github': '#030943',
      },
      fontSize: {
        'xs-6': ['6px', { lineHeight: '8px', letterSpacing: '0.06px' }],
        'xs-5': ['5px', { lineHeight: 'normal', letterSpacing: '0.05px' }],
        'xs-7': ['7px', { lineHeight: '9px', letterSpacing: '0.07px' }],
        'xs-8': ['8px', { lineHeight: '10px', letterSpacing: '0' }],
        'xs-12': ['12px', { lineHeight: '16px', letterSpacing: '0.12px' }],
        'xs-16': ['16px', { lineHeight: '20px', letterSpacing: '-0.32px' }],
      }
    },
  },
  plugins: [],
}

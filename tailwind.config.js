/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.js"
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
      fontSize: {
        'xs-6': ['9px', { lineHeight: '12px', letterSpacing: '0.06px' }],
        'xs-5': ['8px', { lineHeight: '11px', letterSpacing: '0.05px' }], // Changed from 'normal' to '11px' to prevent overlapping
        'xs-7': ['10px', { lineHeight: '13px', letterSpacing: '0.07px' }],
        'xs-8': ['11px', { lineHeight: '14px', letterSpacing: '0' }],
        'xs-12': ['14px', { lineHeight: '18px', letterSpacing: '0.12px' }],
        'xs-16': ['18px', { lineHeight: '22px', letterSpacing: '-0.32px' }],
      }
    },
  },
  plugins: [],
}

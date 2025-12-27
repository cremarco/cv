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
      colors: {
        'ink': 'var(--color-ink)',
        'muted': 'var(--color-muted)',
        'subtle': 'var(--color-subtle)',
        'accent': 'var(--color-accent)',
        'accent-soft': 'var(--color-accent-soft)',
        'accent-lightest': 'var(--color-accent-lightest)',
        'accent-dark': 'var(--color-accent-dark)',
        'line': 'var(--color-line)',
        'sidebar-bg': 'var(--color-sidebar-bg)',
        'gray-dark': 'var(--color-gray-dark)',
        'gray-darkest': 'var(--color-gray-darkest)',
        'gray-lighter': 'var(--color-gray-lighter)',
        'gray-lightest': 'var(--color-gray-lightest)',
        'linkedin': 'var(--color-linkedin)',
        'github': 'var(--color-github)',
        'gradient-start': 'var(--color-gradient-start)',
        'gradient-end': 'var(--color-gradient-end)',
        'orcid': 'var(--color-orcid)',
        'award-gold': 'var(--color-award-gold)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(to right, var(--color-gradient-start), var(--color-gradient-end))',
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

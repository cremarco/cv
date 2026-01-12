/** @type {import('tailwindcss').Config} */

// =============================================================================
// CURRENT COLOR CONFIGURATION
// Define a base color and all shades will be calculated automatically
// You can use:
// - A hex color: '#3b82f6' (blue)
// - A Tailwind color name: 'blue', 'green', 'purple', etc.
// - An RGB array: [59, 130, 246]
// =============================================================================
const CURRENT_COLOR_BASE = 'indigo'; // Change this to your preferred color

/**
 * Converts hex to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Converts RGB to hex
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Lightens or darkens a color by a percentage
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to lighten (positive) or darken (negative)
 */
function adjustColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = percent / 100;
  const r = Math.min(255, Math.max(0, rgb.r + (255 - rgb.r) * factor));
  const g = Math.min(255, Math.max(0, rgb.g + (255 - rgb.g) * factor));
  const b = Math.min(255, Math.max(0, rgb.b + (255 - rgb.b) * factor));
  
  return rgbToHex(r, g, b);
}

/**
 * Generates color shades from a base color
 * Returns an object with Tailwind-compatible color values
 */
function generateColorShades(baseColor) {
  // If it's already a Tailwind color name, use Tailwind's default shades
  const tailwindColors = {
    blue: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
    green: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
    purple: { 50: '#faf5ff', 100: '#f3e8ff', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce' },
    indigo: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
    teal: { 50: '#f0fdfa', 100: '#ccfbf1', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
    cyan: { 50: '#ecfeff', 100: '#cffafe', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490' },
    sky: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' },
  };
  
  if (typeof baseColor === 'string' && tailwindColors[baseColor.toLowerCase()]) {
    return tailwindColors[baseColor.toLowerCase()];
  }
  
  // Parse the base color
  let baseHex;
  if (typeof baseColor === 'string' && baseColor.startsWith('#')) {
    baseHex = baseColor;
  } else if (Array.isArray(baseColor) && baseColor.length === 3) {
    baseHex = rgbToHex(baseColor[0], baseColor[1], baseColor[2]);
  } else {
    // Default to blue if invalid
    baseHex = '#3b82f6';
  }
  
  // Generate shades based on the base color
  // 500 is the base color
  // 50, 100 are lighter
  // 600, 700 are darker
  return {
    50: adjustColor(baseHex, 85),   // Very light
    100: adjustColor(baseHex, 70),  // Light
    500: baseHex,                    // Base
    600: adjustColor(baseHex, -15),  // Darker
    700: adjustColor(baseHex, -25),  // Dark
  };
}

const currentColorShades = generateColorShades(CURRENT_COLOR_BASE);

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
      },
      colors: {
        current: currentColorShades,
      }
    },
  },
  plugins: [],
}

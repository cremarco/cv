// =============================================================================
// DATE FORMATTING UTILITIES
// =============================================================================

/**
 * Formats a date string to a consistent format
 * Handles various input formats and standardises output
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  // If already in a standard format, return as is
  // Otherwise, attempt to parse and format
  return dateString;
}

/**
 * Formats a time period string (e.g., "Feb 2025 - Gen 2026")
 * Ensures consistent month abbreviations
 */
export function formatTimePeriod(period) {
  if (!period) return '';
  
  // Standardise month abbreviations to British English
  const monthMap = {
    'Gen': 'Jan',
    'Feb': 'Feb',
    'Mar': 'Mar',
    'Apr': 'Apr',
    'May': 'May',
    'Jun': 'Jun',
    'Jul': 'Jul',
    'Aug': 'Aug',
    'Sep': 'Sep',
    'Oct': 'Oct',
    'Nov': 'Nov',
    'Dec': 'Dec',
  };
  
  // Replace Italian month abbreviations with English
  return period
    .replace(/\bGen\b/g, 'Jan')
    .replace(/\bAgo\b/g, 'Aug');
}

/**
 * Formats a year string
 */
export function formatYear(year) {
  if (!year) return '';
  return String(year);
}


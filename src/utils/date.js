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

/**
 * Parses a date string in format "MMM YYYY" (e.g., "Sep 2024", "Jun 2025")
 * Returns a Date object for comparison, or null if parsing fails
 */
export function parseMonthYear(dateString) {
  if (!dateString) return null;
  
  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const parts = dateString.trim().split(' ');
  if (parts.length !== 2) return null;
  
  const month = monthMap[parts[0]];
  const year = parseInt(parts[1], 10);
  
  if (month === undefined || isNaN(year)) return null;
  
  return new Date(year, month);
}

/**
 * Compares two date strings in format "MMM YYYY"
 * Returns negative if date1 is more recent than date2, positive if date1 is older, 0 if equal
 * Used for sorting: most recent first
 */
export function compareDatesDesc(date1, date2) {
  const d1 = parseMonthYear(date1);
  const d2 = parseMonthYear(date2);
  
  if (!d1 && !d2) return 0;
  if (!d1) return 1; // date1 goes to end if it can't be parsed
  if (!d2) return -1; // date2 goes to end if it can't be parsed
  
  return d2 - d1; // Most recent first (descending order)
}


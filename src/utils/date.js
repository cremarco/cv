// =============================================================================
// DATE UTILITIES
// =============================================================================

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

// =============================================================================
// DATE UTILITIES
// =============================================================================

/**
 * Parses a date string in format "MMM YYYY" or "D MMM YYYY"
 * (e.g., "Sep 2024", "Jun 2025", "12 Jun 2026")
 * Returns a Date object for comparison, or null if parsing fails
 */
export function parseMonthYear(dateString) {
  if (!dateString) return null;
  
  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const parts = dateString.trim().split(/\s+/);
  if (parts.length !== 2 && parts.length !== 3) return null;

  const hasDay = parts.length === 3;
  const day = hasDay ? parseInt(parts[0], 10) : 1;
  const monthPart = hasDay ? parts[1] : parts[0];
  const yearPart = hasDay ? parts[2] : parts[1];

  const month = monthMap[monthPart];
  const year = parseInt(yearPart, 10);
  
  if (month === undefined || isNaN(year) || isNaN(day) || day < 1 || day > 31) return null;
  
  return new Date(year, month, day);
}

function parseComparableDate(dateString) {
  if (!dateString) return null;

  const period = dateString.trim();
  if (period.includes(' - ')) {
    const parts = period.split(' - ');
    return parseComparableDate(parts[parts.length - 1].trim());
  }

  if (/^(Present|Current)$/i.test(period)) {
    return new Date(9999, 11, 31);
  }

  if (/^\d{4}$/.test(period)) {
    return new Date(parseInt(period, 10), 11, 31);
  }

  return parseMonthYear(period);
}

/**
 * Compares two date strings in format "MMM YYYY" or "D MMM YYYY"
 * Returns negative if date1 is more recent than date2, positive if date1 is older, 0 if equal
 * Used for sorting: most recent first
 */
export function compareDatesDesc(date1, date2) {
  const d1 = parseComparableDate(date1);
  const d2 = parseComparableDate(date2);
  
  if (!d1 && !d2) return 0;
  if (!d1) return 1; // date1 goes to end if it can't be parsed
  if (!d2) return -1; // date2 goes to end if it can't be parsed
  
  return d2 - d1; // Most recent first (descending order)
}

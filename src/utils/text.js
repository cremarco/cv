// =============================================================================
// TEXT FORMATTING UTILITIES
// =============================================================================

/**
 * Ensures text ends with a period
 */
export function formatSentence(text) {
  if (!text) return '';
  const trimmed = String(text).trim();
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
}

/**
 * Builds topic text with optional SSD suffix
 */
export function buildTopicText(exp) {
  const parts = [];
  if (exp.topic) parts.push(exp.topic);
  if (exp.ssd) parts.push(`SSD ${exp.ssd}`);
  return parts.join(', ');
}




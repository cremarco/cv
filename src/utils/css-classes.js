// =============================================================================
// CSS CLASS UTILITIES
// =============================================================================

import { CARD_BASE_CLASSES } from '../config.js';

/**
 * Determines card CSS classes based on position in section/page
 */
export function getCardClasses({ isFirstInPage, isFirstInSection, isCurrent }) {
  const hasTopRounded = isFirstInSection && isFirstInPage;
  
  if (isFirstInPage && isCurrent) {
    const baseClasses = `${CARD_BASE_CLASSES} bg-accent-lightest border border-accent-soft border-b-0`;
    return hasTopRounded ? `${baseClasses} rounded-t-md` : baseClasses;
  }
  
  if (isFirstInPage) {
    const baseClasses = `${CARD_BASE_CLASSES} bg-white border border-gray-200 border-b-0`;
    return hasTopRounded ? `${baseClasses} rounded-t-md` : baseClasses;
  }
  
  return `${CARD_BASE_CLASSES} bg-white border border-gray-200 border-t-0`;
}

/**
 * Returns time badge classes based on current status
 */
export function getTimeBadgeClasses(isCurrent) {
  const base = 'inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded-md';
  return isCurrent 
    ? `${base} bg-purple-100 text-purple-700`
    : `${base} bg-gray-100 text-gray-700`;
}


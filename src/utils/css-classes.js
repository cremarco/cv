// =============================================================================
// CSS CLASS UTILITIES
// =============================================================================

import { CARD_BASE_CLASSES, CURRENT_CARD_BG, CURRENT_BADGE_BG, CURRENT_BADGE_TEXT } from '../config.js';

/**
 * Determines card CSS classes based on position in section/page
 * All cards have uniform style: same shadows and styling
 * First card of section gets rounded-t-md, last card gets rounded-b-md
 */
export function getCardClasses({ isFirstInPage, isFirstInSection, isLast, isCurrent }) {
  // Background: accent for current, white for others
  const bgClass = isCurrent ? CURRENT_CARD_BG : 'bg-white';
  
  // No border style
  const borderClass = '';
  
  // Rounded corners: first card of section gets rounded-t-md, last card gets rounded-b-md
  const roundedClasses = [];
  if (isFirstInSection) {
    roundedClasses.push('rounded-t-md');
  }
  if (isLast) {
    roundedClasses.push('rounded-b-md');
  }
  const roundedClass = roundedClasses.join(' ');
  
  // Combine all classes
  const baseClasses = `${CARD_BASE_CLASSES} ${bgClass} ${borderClass} ${roundedClass}`.trim();
  
  return baseClasses;
}

/**
 * Returns time badge classes based on current status
 */
export function getTimeBadgeClasses(isCurrent) {
  const base = 'inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md';
  return isCurrent 
    ? `${base} ${CURRENT_BADGE_BG} ${CURRENT_BADGE_TEXT}`
    : `${base} bg-gray-100 text-gray-700`;
}



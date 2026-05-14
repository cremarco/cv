// =============================================================================
// ACTIVE ITEM HIGHLIGHTER
// Automatically highlights cards or dates if the item is currently active
// based on date analysis
// =============================================================================

import { SECTION_CONFIG, CURRENT_CARD_BG, CURRENT_BADGE_BG, CURRENT_BADGE_TEXT, CURRENT_TEXT } from '../config.js';
import { parseMonthYear } from './date.js';

/**
 * Checks if a time period string indicates an active/current or not-yet-expired period
 * Handles formats like:
 * - "D MMM YYYY - D MMM YYYY" (e.g., "11 Nov 2026 - 12 Nov 2026")
 * - "MMM YYYY - MMM YYYY" (e.g., "Feb 2025 - Jan 2026")
 * - "MMM YYYY - Present" (e.g., "Jan 2019 - Present")
 * - "YYYY - Present" (e.g., "2019 - Present")
 * - "YYYY" (e.g., "2025")
 * - "YYYY - YYYY" (e.g., "2024 - 2025")
 */
function parseBoundaryDate(value, { isEnd = false } = {}) {
  if (!value) return null;

  const dateText = value.trim();
  if (/^(Present|Current)$/i.test(dateText)) {
    return new Date(9999, 11, 31);
  }

  const yearOnly = dateText.match(/^\d{4}$/);
  if (yearOnly) {
    return new Date(parseInt(dateText, 10), isEnd ? 11 : 0, isEnd ? 31 : 1);
  }

  const parsedDate = parseMonthYear(dateText);
  if (!parsedDate) return null;

  const isMonthYearOnly = /^[A-Z][a-z]{2} \d{4}$/.test(dateText);
  if (isEnd && isMonthYearOnly) {
    return new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
  }

  return parsedDate;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isNotExpired(endDate, referenceDate) {
  return endDate >= startOfDay(referenceDate);
}

export function isTimePeriodActive(timePeriod, referenceDate = new Date()) {
  if (!timePeriod) return false;
  
  const period = timePeriod.trim();
  
  // Check for "Present" keyword (case insensitive)
  if (period.toLowerCase().includes('present')) {
    return true;
  }
  
  // Check for "Current" keyword (case insensitive)
  if (period.toLowerCase().includes('current')) {
    return true;
  }
  
  // Handle range format: "MMM YYYY - MMM YYYY" or "MMM YYYY - Present"
  if (period.includes(' - ')) {
    const parts = period.split(' - ');
    if (parts.length === 2) {
      const endDateStr = parts[1].trim();
      const endDate = parseBoundaryDate(endDateStr, { isEnd: true });
      return endDate ? isNotExpired(endDate, referenceDate) : false;
    }
  }
  
  const singleDate = parseBoundaryDate(period, { isEnd: true });
  if (singleDate) return isNotExpired(singleDate, referenceDate);
  
  return false;
}

const ACTIVE_BACKGROUND_SECTIONS = Object.values(SECTION_CONFIG)
  .filter(config => config.highlightActiveBackground)
  .map(config => config.sectionId);

function getTimePeriodFromElement(element) {
  return element.dataset.timePeriod || element.textContent.trim();
}

function applyActiveBadgeStyles(badge) {
  badge.classList.remove('bg-gray-100', 'text-gray-700');
  badge.classList.add(CURRENT_BADGE_BG, CURRENT_BADGE_TEXT);
}

function applyActiveTextStyles(element) {
  element.classList.remove('text-slate-600', 'text-slate-800');
  if (!element.classList.contains(CURRENT_TEXT)) {
    element.classList.add(CURRENT_TEXT);
  }
}

/**
 * Finds all time period badges in cards and highlights active ones
 */
function highlightActiveTimeBadges() {
  const timeElements = document.querySelectorAll('[data-time-period]');
  
  timeElements.forEach(element => {
    const timePeriod = getTimePeriodFromElement(element);
    if (!isTimePeriodActive(timePeriod)) return;
    
    if (element.dataset.timeKind === 'text') {
      applyActiveTextStyles(element);
    } else {
      applyActiveBadgeStyles(element);
    }
  });
}

/**
 * Highlights the background of cards that contain active time periods
 * Only for specific sections: academic-experiences, research-and-technology-transfer,
 * international-research-projects, italian-research-projects, projects
 */
function highlightActiveCardBackgrounds() {
  ACTIVE_BACKGROUND_SECTIONS.forEach(sectionId => {
    const sectionContainer = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (!sectionContainer) {
      return;
    }
    
    const cards = sectionContainer.querySelectorAll('[data-card]');
    
    cards.forEach(card => {
      const timeElements = card.querySelectorAll('[data-time-period]');
      if (!timeElements.length) {
        return;
      }
      
      let isActive = false;
      timeElements.forEach(element => {
        const timePeriod = getTimePeriodFromElement(element);
        if (isTimePeriodActive(timePeriod)) {
          isActive = true;
        }
      });
      
      if (!isActive) {
        return;
      }
      
      if (!card.classList.contains(CURRENT_CARD_BG)) {
        card.classList.remove('bg-white');
        card.classList.add(CURRENT_CARD_BG);
      }
    });
  });
}

/**
 * Main function to highlight all active items
 * @param {Object} options - Configuration options
 * @param {boolean} options.highlightBackground - Whether to highlight card backgrounds (default: true)
 * @param {boolean} options.highlightDates - Whether to highlight date badges (default: true)
 */
export function highlightActiveItems(options = {}) {
  const {
    highlightBackground = true,
    highlightDates = true
  } = options;
  
  if (highlightDates) {
    highlightActiveTimeBadges();
  }
  
  if (highlightBackground) {
    highlightActiveCardBackgrounds();
  }
}

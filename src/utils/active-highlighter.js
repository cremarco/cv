// =============================================================================
// ACTIVE ITEM HIGHLIGHTER
// Automatically highlights cards or dates if the item is currently active
// based on date analysis
// =============================================================================

import { SECTION_CONFIG } from '../config.js';
import { parseMonthYear } from './date.js';

/**
 * Checks if a time period string indicates an active/current period
 * Handles formats like:
 * - "MMM YYYY - MMM YYYY" (e.g., "Feb 2025 - Jan 2026")
 * - "MMM YYYY - Present" (e.g., "Jan 2019 - Present")
 * - "YYYY - Present" (e.g., "2019 - Present")
 * - "YYYY" (e.g., "2025")
 * - "YYYY - YYYY" (e.g., "2024 - 2025")
 */
function isTimePeriodActive(timePeriod) {
  if (!timePeriod) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
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
      const startDateStr = parts[0].trim();
      const endDateStr = parts[1].trim();
      const currentDate = new Date(currentYear, currentMonth);
      
      // If end date is "Present", check if start date has passed
      if (endDateStr.toLowerCase() === 'present') {
        const startDate = parseMonthYear(startDateStr);
        if (startDate) {
          return startDate <= currentDate;
        }
        // If start is just a year
        const startYear = parseInt(startDateStr, 10);
        if (!isNaN(startYear) && startYear.toString().length === 4) {
          return startYear <= currentYear;
        }
        // If we can't parse start, assume it's active if it says "Present"
        return true;
      }
      
      // Try to parse both dates
      const startDate = parseMonthYear(startDateStr);
      const endDate = parseMonthYear(endDateStr);
      
      if (startDate && endDate) {
        // Period is active if current date is between start and end (inclusive)
        return startDate <= currentDate && endDate >= currentDate;
      }
      
      // Handle year-only ranges: "YYYY - YYYY"
      const startYear = parseInt(startDateStr, 10);
      const endYear = parseInt(endDateStr, 10);
      if (!isNaN(startYear) && !isNaN(endYear) && 
          startYear.toString().length === 4 && endYear.toString().length === 4) {
        return startYear <= currentYear && endYear >= currentYear;
      }
      
      // Mixed formats: try to parse what we can
      if (startDate && !endDate) {
        const endYear = parseInt(endDateStr, 10);
        if (!isNaN(endYear) && endYear.toString().length === 4) {
          return startDate <= currentDate && endYear >= currentYear;
        }
      }
      
      if (!startDate && endDate) {
        const startYear = parseInt(startDateStr, 10);
        if (!isNaN(startYear) && startYear.toString().length === 4) {
          return startYear <= currentYear && endDate >= currentDate;
        }
      }
    }
  }
  
  // Handle single year format: "YYYY"
  // A single year is considered active if it's the current year
  const singleYear = parseInt(period, 10);
  if (!isNaN(singleYear) && singleYear.toString().length === 4) {
    return singleYear === currentYear;
  }
  
  // Handle single month-year format: "MMM YYYY"
  // A single date is considered active if it's the current month or a past month in current year
  const singleDate = parseMonthYear(period);
  if (singleDate) {
    const currentDate = new Date(currentYear, currentMonth);
    // Consider active if it's in the current month or past months of current year
    return singleDate.getFullYear() === currentYear && 
           singleDate.getMonth() <= currentMonth;
  }
  
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
  badge.classList.add('bg-purple-100', 'text-purple-700');
}

function applyActiveTextStyles(element) {
  element.classList.remove('text-gray-dark', 'text-ink');
  if (!element.classList.contains('text-purple-600')) {
    element.classList.add('text-purple-600');
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
 * international-research-projects, italian-research-projects
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
      
      if (!card.classList.contains('bg-accent-lightest')) {
        card.classList.remove('bg-white');
        card.classList.add('bg-accent-lightest');
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

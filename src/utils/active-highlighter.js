// =============================================================================
// ACTIVE ITEM HIGHLIGHTER
// Automatically highlights cards or dates if the item is currently active
// based on date analysis
// =============================================================================

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

/**
 * Finds all time period badges in cards and highlights active ones
 */
function highlightActiveTimeBadges() {
  // Find all cards - they have px-4 py-3 (card padding) and shadow classes
  // Use a more flexible approach: find elements that contain all these classes
  const allElements = document.querySelectorAll('*');
  const cards = Array.from(allElements).filter(el => {
    const classes = el.className || '';
    // Check if element has the card classes (px-4, py-3, and shadow)
    return typeof classes === 'string' && 
           classes.includes('px-4') && 
           classes.includes('py-3') && 
           classes.includes('shadow') &&
           classes.includes('flex') &&
           classes.includes('gap-3');
  });
  
  cards.forEach(card => {
    // Find time period badge - spans with inline-flex and px-1.5 (time badge pattern)
    // Use a more flexible selector
    const timeBadges = Array.from(card.querySelectorAll('span')).filter(span => {
      const classes = span.className;
      return classes.includes('inline-flex') && 
             classes.includes('items-center') && 
             (classes.includes('px-1.5') || classes.includes('px-1') || classes.includes('px-0.5'));
    });
    
    timeBadges.forEach(badge => {
      const timePeriod = badge.textContent.trim();
      
      if (isTimePeriodActive(timePeriod)) {
        // Apply active styling to the badge
        badge.classList.remove('bg-gray-100', 'text-gray-700');
        badge.classList.add('bg-purple-100', 'text-purple-700');
      }
    });
    
    // Also check for date elements in teaching cards and other cards
    // Look for elements with text-xs-6 or text-[7px] that might contain dates
    const dateElements = Array.from(card.querySelectorAll('[class*="text-xs-6"], [class*="text-[7px]"]')).filter(el => {
      const text = el.textContent.trim();
      // Check if it looks like a date (contains month names or year patterns)
      return /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}|Present|Current)/i.test(text);
    });
    
    dateElements.forEach(dateEl => {
      const timePeriod = dateEl.textContent.trim();
      
      if (isTimePeriodActive(timePeriod)) {
        // Apply active styling to the date
        dateEl.classList.remove('text-gray-dark', 'text-ink');
        if (!dateEl.classList.contains('text-purple-600')) {
          dateEl.classList.add('text-purple-600');
        }
      }
    });
    
    // Also check for period text in project cards (they use different structure)
    const periodElements = Array.from(card.querySelectorAll('p, div')).filter(el => {
      const text = el.textContent.trim();
      const classes = el.className;
      // Look for elements that contain date-like text and are styled as dates
      return /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}.*\d{4}|Present|Current)/i.test(text) &&
             (classes.includes('text-xs-6') || classes.includes('text-gray-dark'));
    });
    
    periodElements.forEach(periodEl => {
      const timePeriod = periodEl.textContent.trim();
      
      if (isTimePeriodActive(timePeriod)) {
        periodEl.classList.remove('text-gray-dark');
        if (!periodEl.classList.contains('text-purple-600')) {
          periodEl.classList.add('text-purple-600');
        }
      }
    });
  });
}

/**
 * Gets the section ID for a card by finding the nearest parent with data-section attribute
 * or container with matching ID
 */
function getCardSectionId(card) {
  let element = card;
  let maxDepth = 20; // Safety limit
  let depth = 0;
  
  // Traverse up the DOM tree to find the section
  while (element && element !== document.body && depth < maxDepth) {
    // First check for data-section attribute
    if (element.hasAttribute && element.hasAttribute('data-section')) {
      return element.getAttribute('data-section');
    }
    
    // Also check if we're inside a container with an ID that matches a section
    if (element.id) {
      // Section containers have IDs like "academic-experiences", "research-and-technology-transfer", etc.
      // Check if this ID matches known section IDs
      const knownSectionIds = [
        'academic-experiences',
        'foreign-research-contracts',
        'research-and-technology-transfer',
        'entrepreneurial-initiatives',
        'education',
        'teaching-in-phd-courses',
        'teaching',
        'teaching-webinar',
        'thesis-supervisor',
        'awards',
        'publications',
        'community-service',
        'community-service-editorial',
        'international-research-projects',
        'italian-research-projects',
        'projects',
        'tender-commissions'
      ];
      
      if (knownSectionIds.includes(element.id)) {
        return element.id;
      }
    }
    
    element = element.parentElement;
    depth++;
  }
  return null;
}

/**
 * Highlights the background of cards that contain active time periods
 * Only for specific sections: academic-experiences, research-and-technology-transfer,
 * international-research-projects, italian-research-projects
 */
function highlightActiveCardBackgrounds() {
  // Sections that should have background highlighting
  const sectionsWithBackground = [
    'academic-experiences',
    'research-and-technology-transfer',
    'international-research-projects',
    'italian-research-projects'
  ];
  
  // Find cards directly within the specified sections
  sectionsWithBackground.forEach(sectionId => {
    // Find the section container by ID or data-section
    const sectionContainer = document.getElementById(sectionId) || 
                            document.querySelector(`[data-section="${sectionId}"]`);
    
    if (!sectionContainer) {
      return; // Section not found
    }
    
    // Find all cards within this section - they have px-4 py-3 (card padding) and shadow classes
    const allElements = sectionContainer.querySelectorAll('*');
    const cards = Array.from(allElements).filter(el => {
      const classes = el.className || '';
      // Check if element has the card classes (px-4, py-3, shadow, flex, gap-3)
      return typeof classes === 'string' && 
             classes.includes('px-4') && 
             classes.includes('py-3') && 
             classes.includes('shadow') &&
             classes.includes('flex') &&
             classes.includes('gap-3');
    });
    
    cards.forEach(card => {
    
    // Find time period badge or date element
    const timeBadges = Array.from(card.querySelectorAll('span')).filter(span => {
      const classes = span.className;
      return classes.includes('inline-flex') && 
             classes.includes('items-center') && 
             (classes.includes('px-1.5') || classes.includes('px-1') || classes.includes('px-0.5'));
    });
    
    // Find all potential date elements
    const allElements = Array.from(card.querySelectorAll('*'));
    const dateElements = allElements.filter(el => {
      const text = el.textContent.trim();
      // Check if it looks like a date
      return /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}.*\d{4}|\d{4}.*Present|Present|Current)/i.test(text) &&
             text.length < 50; // Reasonable date length
    });
    
    let isActive = false;
    
    // Check badges
    timeBadges.forEach(badge => {
      const timePeriod = badge.textContent.trim();
      if (isTimePeriodActive(timePeriod)) {
        isActive = true;
      }
    });
    
    // Check date elements
    if (!isActive) {
      dateElements.forEach(dateEl => {
        const timePeriod = dateEl.textContent.trim();
        if (isTimePeriodActive(timePeriod)) {
          isActive = true;
        }
      });
    }
    
      // Apply background highlight if active
      if (isActive) {
        // Check if it's already highlighted (first in page with current)
        if (!card.classList.contains('bg-accent-lightest')) {
          // Remove bg-white to allow bg-purple-50 to show
          // Remove all instances of bg-white (in case it appears multiple times)
          while (card.classList.contains('bg-white')) {
            card.classList.remove('bg-white');
          }
          // Apply subtle background highlight
          card.classList.add('bg-purple-50');
          // Also update border if needed
          if (card.classList.contains('border-gray-200')) {
            card.classList.remove('border-gray-200');
            card.classList.add('border-purple-200');
          }
        }
      }
    }); // End cards.forEach
  }); // End sectionsWithBackground.forEach
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

/**
 * Automatically runs the highlighter after a short delay to ensure DOM is ready
 */
export function autoHighlightActiveItems(options = {}) {
  // Wait for DOM to be fully rendered
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => highlightActiveItems(options), 100);
    });
  } else {
    setTimeout(() => highlightActiveItems(options), 100);
  }
}


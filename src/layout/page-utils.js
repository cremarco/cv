// =============================================================================
// PAGE UTILITIES
// =============================================================================

import {
  SELECTORS,
  SECTION_CONFIG,
  PAGE_HEIGHT_PX,
  PAGE_NUMBER_RESERVED_HEIGHT_PX,
  SECTION_PADDING_BOTTOM_PX,
  MAX_EXPERIENCE_SECTION_HEIGHT_PX,
  PAGE_BREAK_SAFETY_MARGIN_PX,
} from '../config.js';

/**
 * Finalizes a page by adding bottom rounded corners to last card if needed
 */
export function finalizePage(container, isLastPageOfSection = false) {
  if (!container?.children.length) return;

  // Remove bottom rounded corners from cards that are NOT the last in section
  Array.from(container.children).forEach(card => {
    const isLastInSection = card.hasAttribute('data-is-last-in-section');
    if (!isLastInSection) {
      card.classList.remove('rounded-b-md');
    }
  });

  // Add bottom corners to the last card of the last page if it's the last in section
  if (isLastPageOfSection) {
    const lastCard = container.lastElementChild;
    const isLastInSection = lastCard.hasAttribute('data-is-last-in-section');
    if (isLastInSection) {
      lastCard.classList.add('rounded-b-md');
    }
  }
}

/**
 * Calculates available height in a page after previous sections
 * This is used to determine if a new section can fit on the same page
 * The safety margin is NOT included here - it's applied when checking if cards fit
 */
export function calculateAvailableHeightInPage(page, previousSectionSelector) {
  // Base available height: full page minus reserved space for page numbers and padding
  // Note: We don't subtract PAGE_BREAK_SAFETY_MARGIN_PX here because that's only for card-level checks
  const baseAvailableHeight = PAGE_HEIGHT_PX - PAGE_NUMBER_RESERVED_HEIGHT_PX - SECTION_PADDING_BOTTOM_PX;

  if (!previousSectionSelector) {
    return Math.max(baseAvailableHeight, 0);
  }

  const previousSection = page.querySelector(previousSectionSelector);
  if (!previousSection) {
    return Math.max(baseAvailableHeight, 0);
  }

  const pageRect = page.getBoundingClientRect();
  const sectionRect = previousSection.getBoundingClientRect();
  const lastBottom = sectionRect.bottom - pageRect.top;

  // Calculate available height ensuring we always reserve space for page numbers
  // The safety margin will be applied when checking individual cards
  const availableHeight = PAGE_HEIGHT_PX - lastBottom - PAGE_NUMBER_RESERVED_HEIGHT_PX - SECTION_PADDING_BOTTOM_PX;
  return Math.max(availableHeight, 0);
}

/**
 * Calculates available height in the first page for the first section
 * This is used to determine how many cards can fit in the first section
 * The safety margin is applied when checking individual cards, not here
 */
export function calculateFirstPageAvailableHeight(page, section) {
  const sectionRect = section.getBoundingClientRect();
  const pageRect = page.getBoundingClientRect();
  const sectionTop = sectionRect.top - pageRect.top;

  const sectionStyle = window.getComputedStyle(section);
  const paddingBottom = parseFloat(sectionStyle.paddingBottom) || SECTION_PADDING_BOTTOM_PX;

  // Calculate available height ensuring we always reserve space for page numbers
  // The safety margin will be applied when checking individual cards
  const availableHeight = PAGE_HEIGHT_PX - sectionTop - paddingBottom - PAGE_NUMBER_RESERVED_HEIGHT_PX;
  return Math.max(availableHeight * 0.95, MAX_EXPERIENCE_SECTION_HEIGHT_PX * 0.6);
}

/**
 * Generates section HTML for injection into pages
 * @param {Object} config - Section configuration
 * @param {boolean} addMarginTop - Add margin-top for sections on same page
 * @param {boolean} showTitle - Show section title
 * @param {boolean} isNewPage - Is this the first section on a new page (adds more top padding)
 */
export function createSectionHTML(config, addMarginTop = false, showTitle = true, isNewPage = false) {
  // For new pages: use pt-12 for proper spacing from top edge
  // For same page: use mt-3 for tighter spacing between sections
  const topSpacingClass = isNewPage ? 'pt-12' : (addMarginTop ? 'mt-3' : '');
  const gapClass = 'gap-4';

  const titleHTML = showTitle
    ? `<h2 class="text-xs-12 font-outfit font-medium text-slate-800 ${config.subtitle ? 'mb-0' : 'mb-0.5'}">${config.title}</h2>`
    : '';

  const subtitleHTML = (config.subtitle && showTitle)
    ? `<div class="text-xs-8 font-dm-sans text-slate-800 -mt-3 mb-2">${config.subtitle}</div>`
    : '';

  const circleHTML = showTitle
    ? `<div class="w-4 h-4 rounded-full bg-white shadow-lg flex items-center justify-center relative" data-pdf-no-shadow>
         <div class="w-2 h-2 rounded-full bg-slate-600"></div>
       </div>`
    : '';

  // For sections without title (like declaration), center the content vertically
  // Maintain same width as other cards (gap-4 + pl-2 pr-6) but without timeline
  if (!showTitle) {
    return `
      <div class="flex gap-4 pl-2 pr-6 pt-0 pb-0 ${topSpacingClass}" data-section="${config.sectionId}" style="padding-bottom: ${SECTION_PADDING_BOTTOM_PX}px;">
        <div class="w-4 shrink-0 ml-4"></div>
        <div class="flex-1 flex flex-col justify-center ${gapClass}">
          ${titleHTML}
          ${subtitleHTML}
          <div id="${config.sectionId}" class="flex flex-col gap-1 w-full"></div>
        </div>
      </div>
    `;
  }

  return `
    <div class="flex gap-4 pl-2 pr-6 pt-0 pb-0 ${topSpacingClass}" data-section="${config.sectionId}" style="padding-bottom: ${SECTION_PADDING_BOTTOM_PX}px;">
      <div class="flex flex-col items-center w-4 shrink-0 ml-4 relative z-10" data-timeline="${config.timelineId}">
        ${circleHTML}
      </div>
      <div class="flex-1 flex flex-col ${gapClass}">
        ${titleHTML}
        ${subtitleHTML}
        <div id="${config.sectionId}" class="flex flex-col gap-1"></div>
      </div>
    </div>
  `;
}

/**
 * Creates a new page from template
 */
export function createNewPage(pageNumber, templatePage, pagesContainer, sectionConfig, isFirstPageOfSection = false) {
  const newPage = templatePage.cloneNode(true);
  newPage.id = `page-${pageNumber}`;
  newPage.classList.add('pdf-page');

  // Remove sidebar on continuation pages
  const sidebar = newPage.querySelector('aside');
  if (sidebar) sidebar.remove();

  // Clear all section containers and remove research section
  const researchSection = newPage.querySelector('[data-section="research"]');
  if (researchSection) researchSection.remove();

  // Remove all existing sections except the one we're adding
  Object.values(SECTION_CONFIG).forEach(cfg => {
    const existingSection = newPage.querySelector(cfg.sectionSelector);
    if (existingSection) {
      if (cfg.sectionId === sectionConfig.sectionId) {
        // Configure this section for the new page
        existingSection.classList.remove('py-0');
        existingSection.classList.add('pt-12', 'pb-0'); // pt-12 for proper space from top edge
        existingSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;

        // Clear the container
        const container = existingSection.querySelector(cfg.containerSelector);
        if (container) container.innerHTML = '';

        // Remove title and circle if not first page of section
        if (!isFirstPageOfSection) {
          const title = existingSection.querySelector('h2');
          if (title) title.remove();

          const subtitle = existingSection.querySelector('.text-xs-8');
          if (subtitle) subtitle.remove();

          const contentDiv = existingSection.querySelector('.flex-1.flex.flex-col');
          if (contentDiv) {
            contentDiv.classList.add('gap-4');
            contentDiv.classList.remove('gap-0');
          }

          const timeline = existingSection.querySelector(cfg.timelineSelector);
          const circle = timeline?.querySelector('.w-4.h-4.rounded-full');
          if (circle) circle.remove();
        }
      } else {
        existingSection.remove();
      }
    }
  });

  // If section doesn't exist in template, create it
  const section = newPage.querySelector('section');
  if (section && !newPage.querySelector(sectionConfig.sectionSelector)) {
    // This is a new page, so use isNewPage = true for proper top padding
    const sectionHTML = createSectionHTML(sectionConfig, false, isFirstPageOfSection, true);
    section.insertAdjacentHTML('beforeend', sectionHTML);
  }

  // Ensure section has global timeline
  if (section) {
    section.classList.add('relative');
    if (!section.querySelector('[data-global-timeline]')) {
      const globalTimeline = document.createElement('div');
      globalTimeline.className = 'absolute left-[30px] top-0 bottom-0 w-px bg-gray-300';
      globalTimeline.setAttribute('data-global-timeline', '');
      section.insertBefore(globalTimeline, section.firstChild);
    }
  }

  // Clean up individual timeline lines
  newPage.querySelectorAll('[data-timeline]').forEach(timeline => {
    timeline.classList.add('relative', 'z-10');
    const line = timeline.querySelector('.w-px.bg-gray-300');
    if (line) line.remove();
  });

  pagesContainer.appendChild(newPage);
  return newPage;
}



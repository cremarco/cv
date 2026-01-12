// =============================================================================
// SECTION RENDERING
// =============================================================================

import {
  SELECTORS,
  SECTION_HEADER_HEIGHT_PX,
  MAX_EXPERIENCE_SECTION_HEIGHT_PX,
  FALLBACK_CARD_HEIGHT_PX,
  PAGE_BREAK_SAFETY_MARGIN_PX,
  PAGE_HEIGHT_PX,
  PAGE_NUMBER_RESERVED_HEIGHT_PX,
  SECTION_PADDING_BOTTOM_PX,
} from '../config.js';
import { getCardClasses } from '../utils/css-classes.js';
import { createMeasurementContainer, measureCardHeight } from '../utils/measurement.js';
import { createCard } from '../cards/factory.js';
import { createPublicationCard, createPublicationsHeader, createPublicationsSummaryCards, calculatePublicationCounts } from '../cards/publications.js';
import {
  finalizePage,
  calculateAvailableHeightInPage,
  calculateFirstPageAvailableHeight,
  createSectionHTML,
  createNewPage,
} from './page-utils.js';

function getMeasurementReference(templatePage, currentPage, config) {
  return currentPage?.querySelector(config.containerSelector)
    || templatePage.querySelector(config.containerSelector)
    || templatePage.querySelector('#academic-experiences')
    || templatePage.querySelector('[data-section] [id]')
    || currentPage?.querySelector('section')
    || templatePage.querySelector('section')
    || null;
}

/**
 * Renders a section with cards and handles page breaks
 */
export function renderSection(items, config, previousSectionSelector = null) {
  const pagesContainer = document.querySelector(SELECTORS.pagesContainer);
  const templatePage = document.querySelector(SELECTORS.pageTemplate);

  if (!pagesContainer || !templatePage) {
    console.error('Missing pagesContainer or templatePage');
    return;
  }

  // Handle first section (on template page)
  if (config.isFirstSection) {
    const firstContainer = templatePage.querySelector(config.containerSelector);
    const firstSection = templatePage.querySelector(config.sectionSelector);

    if (!firstContainer || !firstSection) {
      throw new Error(`Missing layout containers for ${config.title}`);
    }

    const measureContainer = createMeasurementContainer(firstContainer);
    const firstPageAvailableHeight = calculateFirstPageAvailableHeight(templatePage, firstSection);
    
    // Gap between cards (gap-1 = 4px in Tailwind)
    const CARD_GAP_PX = 4;
    
    let currentContainer = firstContainer;
    let currentPage = templatePage;
    let currentPageHeight = 0;
    let currentPageNumber = 1;
    let isFirstInPage = true;
    let currentPageMaxHeight = firstPageAvailableHeight;
    
    try {
      items.forEach((item, index) => {
        // isCurrent is now determined automatically by the active-highlighter script
        // We pass false here as the script will handle highlighting
        const isCurrent = false;
        const isFirstInSection = index === 0;
        const isLast = index === items.length - 1;
        const card = createCard(config.cardType, item, { isCurrent });
        const cardHeight = measureCardHeight(card, measureContainer);

        // Calculate total height needed (card + gap if not first in page)
        const gapHeight = isFirstInPage ? 0 : CARD_GAP_PX;
        const totalHeightNeeded = currentPageHeight + gapHeight + cardHeight;
        
        // Apply safety margin when checking if card fits (to prevent overlap with page numbers)
        const willCreateNewPage = totalHeightNeeded + PAGE_BREAK_SAFETY_MARGIN_PX > currentPageMaxHeight;

        if (willCreateNewPage) {
          finalizePage(currentContainer, false);
          currentPageNumber += 1;
          const newPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config, false);
          const newContainer = newPage.querySelector(config.containerSelector);
          if (!newContainer) throw new Error(`Missing ${config.title} container in new page`);
          
          // Recalculate available height for the new page
          const newPageAvailableHeight = calculateAvailableHeightInPage(newPage, null);
          
          currentPage = newPage;
          currentContainer = newContainer;
          currentPageHeight = 0;
          currentPageMaxHeight = newPageAvailableHeight;
          isFirstInPage = true;
        }

        card.className = getCardClasses({ isFirstInPage, isFirstInSection, isLast, isCurrent });
        
        // Mark last card in section
        if (isLast) {
          card.setAttribute('data-is-last-in-section', 'true');
        }
        
        currentContainer.appendChild(card);
        currentPageHeight += gapHeight + cardHeight;
        isFirstInPage = false;
      });

      finalizePage(currentContainer, true);
    } finally {
      measureContainer.remove();
    }
    return;
  }

  // Handle subsequent sections
  const allPages = document.querySelectorAll('.pdf-page');
  const lastPage = allPages[allPages.length - 1];
  const availableHeight = calculateAvailableHeightInPage(lastPage, previousSectionSelector);
  
  let currentPage = lastPage;
  let currentContainer;
  let currentPageNumber = allPages.length;
  let isFirstInPage = true;
  let currentPageMaxHeight;
  
  // Measure first card height
  const measureContainer = createMeasurementContainer(getMeasurementReference(templatePage, lastPage, config));
  let firstCardHeight = FALLBACK_CARD_HEIGHT_PX;
  if (items.length > 0) {
    // isCurrent is now determined automatically by the active-highlighter script
    const firstCard = createCard(config.cardType, items[0], { isCurrent: false });
    firstCardHeight = measureCardHeight(firstCard, measureContainer);
  }
  measureContainer.remove();
  
  const requiredHeight = SECTION_HEADER_HEIGHT_PX + firstCardHeight;
  
  // Determine if we can fit in current page or need new page
  if (availableHeight >= requiredHeight) {
    // Fits on same page - use margin-top, not new page padding
    const section = currentPage.querySelector('section');
    if (section) {
      section.insertAdjacentHTML('beforeend', createSectionHTML(config, true, true, false));
    }
    currentContainer = currentPage.querySelector(config.containerSelector);
    currentPageMaxHeight = availableHeight;
  } else {
    currentPage = createNewPage(currentPageNumber + 1, templatePage, pagesContainer, config, true);
    currentContainer = currentPage.querySelector(config.containerSelector);
    currentPageNumber = allPages.length + 1;
    // Recalculate available height for the new page
    currentPageMaxHeight = calculateAvailableHeightInPage(currentPage, null);
  }
  
  if (!currentContainer) {
    console.error(`Missing ${config.title} container`);
    return;
  }

  const finalMeasureContainer = createMeasurementContainer(currentContainer);
  // Gap between cards (gap-1 = 4px in Tailwind)
  const CARD_GAP_PX = 4;
  let currentPageHeight = 0;
  
  try {
    items.forEach((item, index) => {
      // isCurrent is now determined automatically by the active-highlighter script
      // We pass false here as the script will handle highlighting
      const isCurrent = false;
      const isFirstInSection = index === 0;
      const isLast = index === items.length - 1;
      const card = createCard(config.cardType, item, { isCurrent });
      const cardHeight = measureCardHeight(card, finalMeasureContainer);

      // Calculate total height needed (card + gap if not first in page)
      const gapHeight = isFirstInPage ? 0 : CARD_GAP_PX;
      const totalHeightNeeded = currentPageHeight + gapHeight + cardHeight;
      
      // Apply safety margin when checking if card fits (to prevent overlap with page numbers)
      const willCreateNewPage = totalHeightNeeded + PAGE_BREAK_SAFETY_MARGIN_PX > currentPageMaxHeight;

      if (willCreateNewPage) {
        finalizePage(currentContainer, false);
        currentPageNumber += 1;
        const nextPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config, false);
        currentPage = nextPage;
        const nextContainer = nextPage.querySelector(config.containerSelector);
        if (!nextContainer) throw new Error(`Missing ${config.title} container in new page`);
        
        // Recalculate available height for the new page
        const newPageAvailableHeight = calculateAvailableHeightInPage(nextPage, null);
        
        currentContainer = nextContainer;
        currentPageHeight = 0;
        currentPageMaxHeight = newPageAvailableHeight;
        isFirstInPage = true;
      }

      card.className = getCardClasses({ isFirstInPage, isFirstInSection, isLast, isCurrent });
      
      // Mark last card in section
      if (isLast) {
        card.setAttribute('data-is-last-in-section', 'true');
      }
      
      currentContainer.appendChild(card);
      currentPageHeight += gapHeight + cardHeight;
      isFirstInPage = false;
    });

    if (currentContainer?.children.length > 0) {
      finalizePage(currentContainer, true);
    }
  } finally {
    finalMeasureContainer.remove();
  }
}

/**
 * Renders a special section (thesis supervisor or awards)
 * For sections with arrays of items (like projects), use renderSpecialSectionWithPageBreaks
 */
export function renderSpecialSection(config, data, createCardFn, previousSectionSelector) {
  const pagesContainer = document.querySelector(SELECTORS.pagesContainer);
  const templatePage = document.querySelector(SELECTORS.pageTemplate);

  if (!pagesContainer || !templatePage) {
    console.error('Missing pagesContainer or templatePage');
    return;
  }

  const allPages = document.querySelectorAll('.pdf-page');
  const lastPage = allPages[allPages.length - 1];
  const availableHeight = calculateAvailableHeightInPage(lastPage, previousSectionSelector);
  
  // Measure card height
  const measureContainer = createMeasurementContainer(getMeasurementReference(templatePage, lastPage, config));
  const card = createCardFn(data);
  const cardHeight = measureCardHeight(card, measureContainer);
  measureContainer.remove();
  
  const hasTitle = config.title && config.title.trim() !== '';
  const headerHeight = config.subtitle ? 100 : (hasTitle ? SECTION_HEADER_HEIGHT_PX : 0);
  const requiredHeight = headerHeight + cardHeight;
  
  let currentPage = lastPage;
  let currentContainer;
  
  if (availableHeight >= requiredHeight) {
    // Fits on same page - use margin-top, not new page padding
    const section = currentPage.querySelector('section');
    if (section) {
      section.insertAdjacentHTML('beforeend', createSectionHTML(config, true, hasTitle, false));
    }
    currentContainer = currentPage.querySelector(config.containerSelector);
  } else {
    const currentPageNumber = allPages.length;
    currentPage = createNewPage(currentPageNumber + 1, templatePage, pagesContainer, config, true);
    currentContainer = currentPage.querySelector(config.containerSelector);
  }
  
  if (!currentContainer) {
    console.error(`Missing ${config.title} container`);
    return;
  }

  // For declaration section (no title), center vertically in available space
  if (!hasTitle && config.sectionId === 'declaration') {
    const sectionElement = currentPage.querySelector(`[data-section="${config.sectionId}"]`);
    if (sectionElement) {
      // Calculate remaining height after previous sections
      const sectionTop = sectionElement.getBoundingClientRect().top - currentPage.getBoundingClientRect().top;
      const remainingHeight = PAGE_HEIGHT_PX - sectionTop - PAGE_NUMBER_RESERVED_HEIGHT_PX - SECTION_PADDING_BOTTOM_PX;
      // Set min-height to fill remaining space and center content vertically
      const contentDiv = sectionElement.querySelector('.flex-1');
      if (contentDiv) {
        contentDiv.style.minHeight = `${remainingHeight}px`;
      }
    }
  }

  currentContainer.appendChild(createCardFn(data));
}

/**
 * Renders a special section with array of items and handles page breaks
 * Used for sections like projects that have multiple cards
 */
export function renderSpecialSectionWithPageBreaks(config, items, createCardFn, previousSectionSelector) {
  const pagesContainer = document.querySelector(SELECTORS.pagesContainer);
  const templatePage = document.querySelector(SELECTORS.pageTemplate);

  if (!pagesContainer || !templatePage) {
    console.error('Missing pagesContainer or templatePage');
    return;
  }

  if (!items || items.length === 0) return;

  const allPages = document.querySelectorAll('.pdf-page');
  const lastPage = allPages[allPages.length - 1];
  const availableHeight = calculateAvailableHeightInPage(lastPage, previousSectionSelector);
  
  // Measure first card height (only the first item, not all items)
  const measureContainer = createMeasurementContainer(getMeasurementReference(templatePage, lastPage, config));
  const firstCard = createCardFn([items[0]]); // Pass only first item, not all items
  const firstCardHeight = measureCardHeight(firstCard, measureContainer);
  measureContainer.remove();
  
  const headerHeight = config.subtitle ? 100 : SECTION_HEADER_HEIGHT_PX;
  const requiredHeight = headerHeight + firstCardHeight;
  
  let currentPage = lastPage;
  let currentContainer;
  let currentPageNumber = allPages.length;
  let currentPageMaxHeight;
  
  // Determine if we can fit header + first card in current page or need new page
  if (availableHeight >= requiredHeight) {
    // Fits on same page - use margin-top, not new page padding
    const section = currentPage.querySelector('section');
    if (section) {
      section.insertAdjacentHTML('beforeend', createSectionHTML(config, true, true, false));
    }
    currentContainer = currentPage.querySelector(config.containerSelector);
    if (!currentContainer) {
      console.error(`Missing ${config.title} container`);
      return;
    }
    currentPageMaxHeight = availableHeight;
  } else {
    // Need new page
    currentPage = createNewPage(currentPageNumber + 1, templatePage, pagesContainer, config, true);
    currentContainer = currentPage.querySelector(config.containerSelector);
    if (!currentContainer) {
      console.error(`Missing ${config.title} container`);
      return;
    }
    currentPageNumber = allPages.length + 1;
    const newPageAvailableHeight = calculateAvailableHeightInPage(currentPage, null);
    currentPageMaxHeight = newPageAvailableHeight;
  }
  
  // Now render items with page breaks
  const CARD_GAP_PX = 2; // gap-1 = 4px, but we use gap-0.5 = 2px for projects
  
  const finalMeasureContainer = createMeasurementContainer(currentContainer);
  let currentPageHeight = 0;
  let isFirstInPage = true;
  
  try {
    items.forEach((item, index) => {
      const isFirstInSection = index === 0;
      const isLast = index === items.length - 1;
      
      // Create card wrapper for this item (createProjectsCard returns a wrapper with the card)
      // Pass isFirstInPage, isFirstInSection and isLast for proper styling
      const cardWrapper = createCardFn([item], { isFirstInPage, isFirstInSection, isLast });
      const cardHeight = measureCardHeight(cardWrapper, finalMeasureContainer);
      
      // Calculate total height needed (card + gap if not first in page)
      const gapHeight = isFirstInPage ? 0 : CARD_GAP_PX;
      const totalHeightNeeded = currentPageHeight + gapHeight + cardHeight;
      
      // Apply safety margin when checking if card fits (to prevent overlap with page numbers)
      const willCreateNewPage = totalHeightNeeded + PAGE_BREAK_SAFETY_MARGIN_PX > currentPageMaxHeight;
      
      if (willCreateNewPage) {
        finalizePage(currentContainer, false);
        currentPageNumber += 1;
        const nextPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config, false);
        currentPage = nextPage;
        const nextContainer = nextPage.querySelector(config.containerSelector);
        if (!nextContainer) throw new Error(`Missing ${config.title} container in new page`);
        
        // Recalculate available height for the new page
        const newPageAvailableHeight = calculateAvailableHeightInPage(nextPage, null);
        
        // Update measurement container width for new page
        const { width } = nextContainer.getBoundingClientRect();
        if (width) finalMeasureContainer.style.width = `${width}px`;
        
        currentContainer = nextContainer;
        currentPageHeight = 0;
        currentPageMaxHeight = newPageAvailableHeight;
        isFirstInPage = true;
      }
      
      // Mark last card in section (rounded-b-md is handled by getCardClasses in card functions)
      if (isLast) {
        // Find the actual card element inside the wrapper (projects cards are wrapped)
        // The card is the first direct child of the wrapper
        const actualCard = cardWrapper.firstElementChild;
        if (actualCard) {
          actualCard.setAttribute('data-is-last-in-section', 'true');
        }
      }
      
      currentContainer.appendChild(cardWrapper);
      currentPageHeight += gapHeight + cardHeight;
      isFirstInPage = false;
    });
    
    if (currentContainer?.children.length > 0) {
      finalizePage(currentContainer, true);
    }
  } finally {
    finalMeasureContainer.remove();
  }
}

/**
 * Renders publications section with page break handling
 */
export function renderPublications(config, pubData, metrics, previousSectionSelector) {
  const pagesContainer = document.querySelector(SELECTORS.pagesContainer);
  const templatePage = document.querySelector(SELECTORS.pageTemplate);

  if (!pagesContainer || !templatePage) {
    console.error('Missing pagesContainer or templatePage');
    return;
  }
  if (!pubData?.papers?.length) return;

  const allPages = document.querySelectorAll('.pdf-page');
  const lastPage = allPages[allPages.length - 1];
  const availableHeight = calculateAvailableHeightInPage(lastPage, previousSectionSelector);
  
  // Create header and summary cards
  const headerContainer = document.createElement('div');
  headerContainer.className = 'flex flex-col gap-4 w-full';
  headerContainer.appendChild(createPublicationsHeader(pubData, metrics));
  
  const counts = calculatePublicationCounts(pubData.papers);
  headerContainer.appendChild(createPublicationsSummaryCards(counts));
  
  // Measure header height and first paper card height
  const measureContainer = createMeasurementContainer(getMeasurementReference(templatePage, lastPage, config));
  const headerHeight = measureCardHeight(headerContainer, measureContainer);
  
  // Measure first paper card height
  const firstPaperCard = createPublicationCard(pubData.papers[0], {
    isFirstInPage: true,
    isFirstInSection: true,
    isLast: false,
    index: 0
  });
  const firstCardHeight = measureCardHeight(firstPaperCard, measureContainer);
  measureContainer.remove();
  
  const requiredHeight = SECTION_HEADER_HEIGHT_PX + headerHeight + firstCardHeight;
  
  let currentPage = lastPage;
  let currentContainer;
  let currentPageNumber = allPages.length;
  let currentPageMaxHeight;
  
  // Determine if we can fit header + first card in current page or need new page
  if (availableHeight >= requiredHeight) {
    // Fits on same page - use margin-top, not new page padding
    const section = currentPage.querySelector('section');
    if (section) {
      section.insertAdjacentHTML('beforeend', createSectionHTML(config, true, true, false));
    }
    currentContainer = currentPage.querySelector(config.containerSelector);
    if (!currentContainer) {
      console.error(`Missing ${config.title} container`);
      return;
    }
    
    // Add header to container
    currentContainer.appendChild(headerContainer);
    // Recalculate available height after adding header (use clone to avoid removing from DOM)
    const measureAfterHeader = createMeasurementContainer(currentContainer);
    const headerClone = headerContainer.cloneNode(true);
    const actualHeaderHeight = measureCardHeight(headerClone, measureAfterHeader);
    measureAfterHeader.remove();
    currentPageMaxHeight = availableHeight - actualHeaderHeight;
  } else {
    // Need new page
    currentPage = createNewPage(currentPageNumber + 1, templatePage, pagesContainer, config, true);
    currentContainer = currentPage.querySelector(config.containerSelector);
    if (!currentContainer) {
      console.error(`Missing ${config.title} container`);
      return;
    }
    
    // Add header to new page
    currentContainer.appendChild(headerContainer);
    currentPageNumber = allPages.length + 1;
    
    // Recalculate available height in the new page after adding header (use clone to avoid removing from DOM)
    const newPageAvailableHeight = calculateAvailableHeightInPage(currentPage, null);
    const measureAfterHeader = createMeasurementContainer(currentContainer);
    const headerClone = headerContainer.cloneNode(true);
    const actualHeaderHeight = measureCardHeight(headerClone, measureAfterHeader);
    measureAfterHeader.remove();
    currentPageMaxHeight = newPageAvailableHeight - actualHeaderHeight;
  }
  
  // Now render papers with page breaks
  // Gap between publication cards (gap-0.5 = 2px in Tailwind)
  const CARD_GAP_PX = 2;
  
  const finalMeasureContainer = createMeasurementContainer(currentContainer);
  let currentPageHeight = 0;
  let isFirstInPage = true;
  
  try {
    pubData.papers.forEach((paper, index) => {
      const isFirstInSection = index === 0;
      const isLast = index === pubData.papers.length - 1;
      
      const card = createPublicationCard(paper, {
        isFirstInPage,
        isFirstInSection,
        isLast,
        index
      });
      const cardHeight = measureCardHeight(card, finalMeasureContainer);
      
      // Calculate total height needed (card + gap if not first in page)
      const gapHeight = isFirstInPage ? 0 : CARD_GAP_PX;
      const totalHeightNeeded = currentPageHeight + gapHeight + cardHeight;
      
      // Apply safety margin when checking if card fits (to prevent overlap with page numbers)
      const willCreateNewPage = totalHeightNeeded + PAGE_BREAK_SAFETY_MARGIN_PX > currentPageMaxHeight;
      
      if (willCreateNewPage) {
        finalizePage(currentContainer, false);
        currentPageNumber += 1;
        const nextPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config, false);
        currentPage = nextPage;
        const nextContainer = nextPage.querySelector(config.containerSelector);
        if (!nextContainer) throw new Error(`Missing ${config.title} container in new page`);
        
        // Recalculate available height for the new page
        const newPageAvailableHeight = calculateAvailableHeightInPage(nextPage, null);
        
        // Update measurement container width for new page
        const { width } = nextContainer.getBoundingClientRect();
        if (width) finalMeasureContainer.style.width = `${width}px`;
        
        currentContainer = nextContainer;
        currentPageHeight = 0;
        currentPageMaxHeight = newPageAvailableHeight;
        isFirstInPage = true;
        
        // Update card classes for new page
        card.className = getCardClasses({ isFirstInPage, isFirstInSection, isLast, isCurrent: false });
        if (isLast) {
          card.setAttribute('data-is-last-in-section', 'true');
        }
      } else {
        // Mark last card in section
        if (isLast) {
          card.setAttribute('data-is-last-in-section', 'true');
        }
      }
      
      currentContainer.appendChild(card);
      // Add gap height to current page height (will be 0 for first card)
      currentPageHeight += gapHeight + cardHeight;
      isFirstInPage = false;
    });
    
    if (currentContainer?.children.length > 0) {
      finalizePage(currentContainer, true);
    }
  } finally {
    finalMeasureContainer.remove();
  }
}

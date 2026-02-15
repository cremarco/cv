// =============================================================================
// SECTION RENDERING
// =============================================================================

import {
  SELECTORS,
  SECTION_HEADER_HEIGHT_PX,
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
 * Shared card loop used by all paginated sections.
 * It keeps measurement and page-break logic centralized to avoid drift.
 */
function renderCardsWithPageBreaks({
  items,
  createCardForItem,
  measureContainer,
  pagesContainer,
  templatePage,
  config,
  initialState,
  gapPx,
  decorateCard,
  markLastCard,
  recreateCardOnPageBreak = false,
  finalizeLastPage = true,
}) {
  let currentContainer = initialState.currentContainer;
  let currentPageNumber = initialState.currentPageNumber;
  let currentPageMaxHeight = initialState.currentPageMaxHeight;
  let currentPageHeight = initialState.currentPageHeight ?? 0;
  let isFirstInPage = initialState.isFirstInPage ?? true;

  items.forEach((item, index) => {
    const isFirstInSection = index === 0;
    const isLast = index === items.length - 1;
    const context = {
      item,
      index,
      isFirstInPage,
      isFirstInSection,
      isLast,
    };

    let card = createCardForItem(context);
    const cardHeight = measureCardHeight(card, measureContainer);
    const previousPageGap = isFirstInPage ? 0 : gapPx;
    const totalHeightNeeded = currentPageHeight + previousPageGap + cardHeight;
    const willCreateNewPage = totalHeightNeeded + PAGE_BREAK_SAFETY_MARGIN_PX > currentPageMaxHeight;

    let gapHeight = previousPageGap;
    if (willCreateNewPage) {
      finalizePage(currentContainer, false);

      currentPageNumber += 1;
      const nextPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config, false);
      const nextContainer = nextPage.querySelector(config.containerSelector);
      if (!nextContainer) {
        throw new Error(`Missing ${config.title} container in new page`);
      }

      const { width } = nextContainer.getBoundingClientRect();
      if (width) {
        measureContainer.style.width = `${width}px`;
      }

      currentContainer = nextContainer;
      currentPageHeight = 0;
      currentPageMaxHeight = calculateAvailableHeightInPage(nextPage, null);
      isFirstInPage = true;
      gapHeight = 0;

      if (recreateCardOnPageBreak) {
        card = createCardForItem({
          ...context,
          isFirstInPage: true,
        });
      }
    }

    const finalContext = {
      ...context,
      isFirstInPage,
    };

    if (decorateCard) {
      decorateCard(card, finalContext);
    }

    if (finalContext.isLast && markLastCard) {
      markLastCard(card, finalContext);
    }

    currentContainer.appendChild(card);
    currentPageHeight += gapHeight + cardHeight;
    isFirstInPage = false;
  });

  if (finalizeLastPage && currentContainer?.children.length > 0) {
    finalizePage(currentContainer, true);
  }
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
      renderCardsWithPageBreaks({
        items,
        pagesContainer,
        templatePage,
        config,
        measureContainer,
        gapPx: CARD_GAP_PX,
        initialState: {
          currentPage,
          currentContainer,
          currentPageNumber,
          currentPageMaxHeight,
          currentPageHeight,
          isFirstInPage,
        },
        createCardForItem: ({ item }) => createCard(config.cardType, item, { isCurrent: false }),
        decorateCard: (card, { isFirstInPage: finalFirstInPage, isFirstInSection, isLast }) => {
          card.className = getCardClasses({
            isFirstInPage: finalFirstInPage,
            isFirstInSection,
            isLast,
            isCurrent: false,
          });
        },
        markLastCard: (card) => {
          card.setAttribute('data-is-last-in-section', 'true');
        },
      });
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
    renderCardsWithPageBreaks({
      items,
      pagesContainer,
      templatePage,
      config,
      measureContainer: finalMeasureContainer,
      gapPx: CARD_GAP_PX,
      initialState: {
        currentPage,
        currentContainer,
        currentPageNumber,
        currentPageMaxHeight,
        currentPageHeight,
        isFirstInPage,
      },
      createCardForItem: ({ item }) => createCard(config.cardType, item, { isCurrent: false }),
      decorateCard: (card, { isFirstInPage: finalFirstInPage, isFirstInSection, isLast }) => {
        card.className = getCardClasses({
          isFirstInPage: finalFirstInPage,
          isFirstInSection,
          isLast,
          isCurrent: false,
        });
      },
      markLastCard: (card) => {
        card.setAttribute('data-is-last-in-section', 'true');
      },
    });
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
    renderCardsWithPageBreaks({
      items,
      pagesContainer,
      templatePage,
      config,
      measureContainer: finalMeasureContainer,
      gapPx: CARD_GAP_PX,
      recreateCardOnPageBreak: true,
      initialState: {
        currentPage,
        currentContainer,
        currentPageNumber,
        currentPageMaxHeight,
        currentPageHeight,
        isFirstInPage,
      },
      createCardForItem: ({ item: currentItem, isFirstInPage: firstInPage, isFirstInSection, isLast }) =>
        createCardFn([currentItem], { isFirstInPage: firstInPage, isFirstInSection, isLast }),
      markLastCard: (cardWrapper) => {
        const actualCard = cardWrapper.firstElementChild;
        if (actualCard) {
          actualCard.setAttribute('data-is-last-in-section', 'true');
        }
      },
    });
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
    renderCardsWithPageBreaks({
      items: pubData.papers,
      pagesContainer,
      templatePage,
      config,
      measureContainer: finalMeasureContainer,
      gapPx: CARD_GAP_PX,
      recreateCardOnPageBreak: true,
      initialState: {
        currentPage,
        currentContainer,
        currentPageNumber,
        currentPageMaxHeight,
        currentPageHeight,
        isFirstInPage,
      },
      createCardForItem: ({ item: paper, index, isFirstInPage: firstInPage, isFirstInSection, isLast }) =>
        createPublicationCard(paper, {
          isFirstInPage: firstInPage,
          isFirstInSection,
          isLast,
          index,
        }),
      markLastCard: (card) => {
        card.setAttribute('data-is-last-in-section', 'true');
      },
    });
  } finally {
    finalMeasureContainer.remove();
  }
}

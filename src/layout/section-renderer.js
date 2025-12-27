// =============================================================================
// SECTION RENDERING
// =============================================================================

import {
  SELECTORS,
  SECTION_HEADER_HEIGHT_PX,
  MAX_EXPERIENCE_SECTION_HEIGHT_PX,
  FALLBACK_CARD_HEIGHT_PX,
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
    
    let currentContainer = firstContainer;
    let currentPageHeight = 0;
    let currentPageNumber = 1;
    let isFirstInPage = true;
    let currentPageMaxHeight = firstPageAvailableHeight;
    
    try {
      items.forEach((item, index) => {
        const isCurrent = item.current === true;
        const isFirstInSection = index === 0;
        const card = createCard(config.cardType, item, { isCurrent });
        const cardHeight = measureCardHeight(card, measureContainer);

        const willCreateNewPage = currentPageHeight > 0 && 
                                  currentPageHeight + cardHeight > currentPageMaxHeight;

        if (willCreateNewPage) {
          finalizePage(currentContainer, false);
          currentPageNumber += 1;
          const newPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config, false);
          const newContainer = newPage.querySelector(config.containerSelector);
          if (!newContainer) throw new Error(`Missing ${config.title} container in new page`);
          currentContainer = newContainer;
          currentPageHeight = 0;
          currentPageMaxHeight = MAX_EXPERIENCE_SECTION_HEIGHT_PX;
          isFirstInPage = true;
        }

        card.className = getCardClasses({ isFirstInPage, isFirstInSection, isCurrent });
        currentContainer.appendChild(card);
        currentPageHeight += cardHeight;
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
  const measureContainer = createMeasurementContainer(null);
  let firstCardHeight = FALLBACK_CARD_HEIGHT_PX;
  if (items.length > 0) {
    const firstCard = createCard(config.cardType, items[0], { isCurrent: items[0].current === true });
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
    currentPageMaxHeight = MAX_EXPERIENCE_SECTION_HEIGHT_PX;
  }
  
  if (!currentContainer) {
    console.error(`Missing ${config.title} container`);
    return;
  }

  const finalMeasureContainer = createMeasurementContainer(currentContainer);
  let currentPageHeight = 0;
  
  try {
    items.forEach((item, index) => {
      const isCurrent = item.current === true;
      const isFirstInSection = index === 0;
      const card = createCard(config.cardType, item, { isCurrent });
      const cardHeight = measureCardHeight(card, finalMeasureContainer);

      const willCreateNewPage = currentPageHeight > 0 && 
                                currentPageHeight + cardHeight > currentPageMaxHeight;

      if (willCreateNewPage) {
        finalizePage(currentContainer, false);
        currentPageNumber += 1;
        const nextPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config, false);
        currentPage = nextPage;
        const nextContainer = nextPage.querySelector(config.containerSelector);
        if (!nextContainer) throw new Error(`Missing ${config.title} container in new page`);
        currentContainer = nextContainer;
        currentPageHeight = 0;
        currentPageMaxHeight = MAX_EXPERIENCE_SECTION_HEIGHT_PX;
        isFirstInPage = true;
      }

      card.className = getCardClasses({ isFirstInPage, isFirstInSection, isCurrent });
      currentContainer.appendChild(card);
      currentPageHeight += cardHeight;
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
  const measureContainer = createMeasurementContainer(null);
  const card = createCardFn(data);
  const cardHeight = measureCardHeight(card, measureContainer);
  measureContainer.remove();
  
  const headerHeight = config.subtitle ? 100 : SECTION_HEADER_HEIGHT_PX;
  const requiredHeight = headerHeight + cardHeight;
  
  let currentPage = lastPage;
  let currentContainer;
  
  if (availableHeight >= requiredHeight) {
    // Fits on same page - use margin-top, not new page padding
    const section = currentPage.querySelector('section');
    if (section) {
      section.insertAdjacentHTML('beforeend', createSectionHTML(config, true, true, false));
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

  currentContainer.appendChild(createCardFn(data));
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
  const measureContainer = createMeasurementContainer(null);
  const headerHeight = measureCardHeight(headerContainer, measureContainer);
  
  // Measure first paper card height
  const firstPaperCard = createPublicationCard(pubData.papers[0], {
    isFirstInPage: true,
    isFirstInSection: true,
    isLast: false
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
    currentPageMaxHeight = availableHeight - headerHeight;
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
    currentPageMaxHeight = MAX_EXPERIENCE_SECTION_HEIGHT_PX - headerHeight;
  }
  
  // Now render papers with page breaks
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
        isLast
      });
      const cardHeight = measureCardHeight(card, finalMeasureContainer);
      
      const willCreateNewPage = currentPageHeight > 0 && 
                                currentPageHeight + cardHeight > currentPageMaxHeight;
      
      if (willCreateNewPage) {
        finalizePage(currentContainer, false);
        currentPageNumber += 1;
        const nextPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config, false);
        currentPage = nextPage;
        const nextContainer = nextPage.querySelector(config.containerSelector);
        if (!nextContainer) throw new Error(`Missing ${config.title} container in new page`);
        currentContainer = nextContainer;
        currentPageHeight = 0;
        currentPageMaxHeight = MAX_EXPERIENCE_SECTION_HEIGHT_PX;
        isFirstInPage = true;
        
        // Update card classes for new page
        card.className = getCardClasses({ isFirstInPage, isFirstInSection, isCurrent: false });
        if (isLast) {
          card.classList.add('rounded-b-md');
        }
      }
      
      currentContainer.appendChild(card);
      currentPageHeight += cardHeight;
      isFirstInPage = false;
    });
    
    if (currentContainer?.children.length > 0) {
      finalizePage(currentContainer, true);
    }
  } finally {
    finalMeasureContainer.remove();
  }
}


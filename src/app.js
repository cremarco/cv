const SELECTORS = {
  pagesContainer: '#pages-container',
  pageTemplate: '[data-page-template]',
  experiencesContainer: '#academic-experiences',
  experiencesSection: '[data-section="academic-experiences"]',
  foreignContractsContainer: '#foreign-research-contracts',
  foreignContractsSection: '[data-section="foreign-research-contracts"]',
  researchSection: '[data-section="research"]',
  pageNumber: '[data-page-number]',
  academicTimeline: '[data-timeline="academic"]',
  foreignTimeline: '[data-timeline="foreign"]',
};

const DATA_URL = './data/cv.json';

const MM_TO_PX = 3.7795275591;
const MAX_EXPERIENCE_SECTION_HEIGHT_MM = 180;
const MAX_EXPERIENCE_SECTION_HEIGHT_PX = MAX_EXPERIENCE_SECTION_HEIGHT_MM * MM_TO_PX;
const FALLBACK_CARD_HEIGHT_PX = 150;
const MIN_HEIGHT_NEEDED = 200; // Altezza minima necessaria per almeno una card

const CARD_BASE_CLASSES = 'px-4 py-3 flex gap-3 shadow';
const CARD_FIRST_CURRENT_CLASSES =
  'bg-accent-lightest border border-accent-soft border-b-0 rounded-t-md';
const CARD_FIRST_DEFAULT_CLASSES = 'bg-white border border-gray-200 border-b-0 rounded-t-md';
const CARD_STACK_CLASSES = 'bg-white border border-gray-200 border-t-0';

// PDF flags are consumed by the Playwright renderer.
function setPdfState({ ready, pageCount, error } = {}) {
  if (typeof ready !== 'undefined') {
    window.__PDF_READY__ = ready;
  }
  if (typeof pageCount !== 'undefined') {
    window.__PDF_PAGE_COUNT__ = pageCount;
  }
  if (typeof error !== 'undefined') {
    window.__PDF_ERROR__ = error;
  }
}

function initPdfMode() {
  const isPrintPath = window.location.pathname === '/print' || window.location.pathname === '/print/';
  const urlParams = new URLSearchParams(window.location.search);
  const isPdfMode =
    isPrintPath || urlParams.get('pdf') === '1' || urlParams.get('pdf') === 'true';

  setPdfState({ ready: false, pageCount: 0, error: null });

  if (isPdfMode) {
    document.body.classList.add('pdf-mode');
  }
}

function formatSentence(text) {
  if (!text) {
    return '';
  }
  const trimmed = String(text).trim();
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
}

function buildTopicText(exp) {
  const parts = [];
  if (exp.topic) {
    parts.push(exp.topic);
  }
  if (exp.ssd) {
    parts.push(`SSD ${exp.ssd}`);
  }
  return parts.join(', ');
}

function getCardClasses({ isFirstInPage, isFirstInSection, isLastInSection, isCurrent }) {
  // Solo la prima card della sezione (prima pagina) ha gli angoli superiori arrotondati
  const hasTopRounded = isFirstInSection && isFirstInPage;
  
  // Solo l'ultima card della sezione (ultima pagina) avrà gli angoli inferiori arrotondati
  // (questo viene gestito separatamente in finalizePage)
  
  if (isFirstInPage && isCurrent) {
    // bg-accent-lightest border border-accent-soft border-b-0 rounded-t-md
    const baseClasses = `${CARD_BASE_CLASSES} bg-accent-lightest border border-accent-soft border-b-0`;
    return hasTopRounded ? `${baseClasses} rounded-t-md` : baseClasses;
  }
  if (isFirstInPage) {
    // bg-white border border-gray-200 border-b-0 rounded-t-md
    const baseClasses = `${CARD_BASE_CLASSES} bg-white border border-gray-200 border-b-0`;
    return hasTopRounded ? `${baseClasses} rounded-t-md` : baseClasses;
  }
  return `${CARD_BASE_CLASSES} ${CARD_STACK_CLASSES}`;
}

function getTimeBadgeClasses(isCurrent) {
  return isCurrent
    ? 'inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium bg-purple-100 text-purple-700 rounded-md'
    : 'inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium bg-gray-100 text-gray-700 rounded-md';
}

function createExperienceCard(exp, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const timeBadgeClasses = getTimeBadgeClasses(isCurrent);
  const topicText = formatSentence(buildTopicText(exp));
  const departmentText = formatSentence(exp.department);
  const logoAlt = exp.university ? `${exp.university} logo` : 'University logo';
  const topicMarkup = topicText ? `<p class="mb-0">${topicText}</p>` : '';
  const departmentMarkup = departmentText
    ? `<p class="text-xs-6 text-muted italic mt-1">${departmentText}</p>`
    : '';

  card.innerHTML = `
    <img src="img/mini-logo/${exp.logo}" alt="${logoAlt}" class="w-5 h-5 object-contain flex-shrink-0 rounded">
    <div class="flex-1">
      <div class="flex justify-between items-start mb-1">
        <div class="${isCurrent ? 'w-[100px]' : 'w-[178px]'}">
          <div class="text-xs-7 text-muted font-dm-sans mb-0.5 whitespace-nowrap">${exp.university}</div>
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${exp.position}</div>
        </div>
        <div class="flex flex-col gap-0.5 items-end">
          <div class="flex gap-2">
            ${exp.link ? `<a href="${exp.link}" class="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" aria-label="Link"><i class='bx bx-link-external text-[10px]'></i></a>` : ''}
            <span class="${timeBadgeClasses}">${exp.time_period}</span>
          </div>
          <div class="flex items-center gap-1">
            <i class='bx bx-map text-[8px] text-muted'></i>
            <div class="text-xs-5 text-muted font-dm-sans">${exp.place}</div>
          </div>
        </div>
      </div>
      <div class="pl-1.5 text-xs-7 text-ink font-dm-sans leading-normal">
        ${topicMarkup}
        ${departmentMarkup}
      </div>
    </div>
  `;

  return card;
}

function createForeignContractCard(exp, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const timeBadgeClasses = getTimeBadgeClasses(isCurrent);
  const topicText = formatSentence(exp.topic);
  const logoAlt = exp.university ? `${exp.university} logo` : 'University logo';
  const topicMarkup = topicText ? `<p class="mb-0">${topicText}</p>` : '';

  card.innerHTML = `
    <img src="img/mini-logo/${exp.logo}" alt="${logoAlt}" class="w-5 h-5 object-contain flex-shrink-0 rounded">
    <div class="flex-1">
      <div class="flex justify-between items-start mb-1">
        <div class="${isCurrent ? 'w-[100px]' : 'w-[178px]'}">
          <div class="text-xs-7 text-muted font-dm-sans mb-0.5 whitespace-nowrap">${exp.university}</div>
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${exp.position}</div>
        </div>
        <div class="flex flex-col gap-0.5 items-end">
          <div class="flex gap-2">
            ${exp.link ? `<a href="${exp.link}" class="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" aria-label="Link"><i class='bx bx-link-external text-[10px]'></i></a>` : ''}
            <span class="${timeBadgeClasses}">${exp.time_period}</span>
          </div>
          <div class="flex items-center gap-1">
            <i class='bx bx-map text-[8px] text-muted'></i>
            <div class="text-xs-5 text-muted font-dm-sans">${exp.place}</div>
          </div>
        </div>
      </div>
      <div class="pl-1.5 text-xs-7 text-ink font-dm-sans leading-normal">
        ${topicMarkup}
      </div>
    </div>
  `;

  return card;
}

// Configurazione delle sezioni (definita dopo le funzioni di creazione card)
const SECTION_CONFIG = {
  academic_experiences: {
    title: 'Academic experiences',
    sectionId: 'academic-experiences',
    sectionSelector: '[data-section="academic-experiences"]',
    containerSelector: '#academic-experiences',
    timelineSelector: '[data-timeline="academic"]',
    timelineId: 'academic',
    createCard: createExperienceCard,
    isFirstSection: true,
  },
  foreign_research_contracts: {
    title: 'Foreign Research Contracts',
    sectionId: 'foreign-research-contracts',
    sectionSelector: '[data-section="foreign-research-contracts"]',
    containerSelector: '#foreign-research-contracts',
    timelineSelector: '[data-timeline="foreign"]',
    timelineId: 'foreign',
    createCard: createForeignContractCard,
    isFirstSection: false,
  },
};

function createMeasurementContainer(referenceElement) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-1';
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.pointerEvents = 'none';
  container.style.left = '-9999px';
  container.style.top = '0';

  if (referenceElement) {
    const { width } = referenceElement.getBoundingClientRect();
    if (width) {
      container.style.width = `${width}px`;
    }
  }

  document.body.appendChild(container);
  return container;
}

// Measure card heights off-screen to decide page breaks deterministically.
function measureCardHeight(card, measureContainer) {
  measureContainer.appendChild(card);
  const height = card.offsetHeight || FALLBACK_CARD_HEIGHT_PX;
  measureContainer.removeChild(card);
  return height;
}

function finalizePage(container, isLastPageOfSection = false) {
  if (!container || container.children.length === 0) {
    return;
  }
  
  const lastCard = container.lastElementChild;
  
  // Rimuovi eventuali angoli arrotondati inferiori da tutte le card
  Array.from(container.children).forEach(card => {
    card.classList.remove('rounded-b-md');
  });
  
  // Aggiungi gli angoli arrotondati inferiori solo all'ultima card dell'ultima pagina della sezione
  if (isLastPageOfSection) {
    lastCard.classList.add('rounded-b-md');
  }
}

function resetSection(pagesContainer, templatePage, config) {
  // Rimuovi tutte le pagine che contengono solo questa sezione
  const pages = pagesContainer.querySelectorAll('.pdf-page');
  pages.forEach(page => {
    const sectionElement = page.querySelector(config.sectionSelector);
    const container = page.querySelector(config.containerSelector);
    if (container) {
      container.innerHTML = '';
    }
  });
}

function calculateAvailableHeightInPage(page, previousSectionSelector) {
  // Calcola l'altezza disponibile nella pagina dopo le sezioni precedenti
  const pageHeightPx = 297 * MM_TO_PX; // Altezza totale pagina A4 (297mm)
  
  // Trova l'ultima sezione nella pagina
  let lastSection = null;
  let lastBottom = 0;
  
  if (previousSectionSelector) {
    const previousSection = page.querySelector(previousSectionSelector);
    if (previousSection) {
      const rect = previousSection.getBoundingClientRect();
      const pageRect = page.getBoundingClientRect();
      lastBottom = rect.bottom - pageRect.top;
      lastSection = previousSection;
    }
  }
  
  // Se non c'è una sezione precedente, usa tutta l'altezza disponibile
  if (!lastSection) {
    return MAX_EXPERIENCE_SECTION_HEIGHT_PX;
  }
  
  // Calcola lo spazio disponibile: altezza pagina - bottom ultima sezione - padding
  const availableHeight = pageHeightPx - lastBottom - 30; // 30px per margini
  
  return Math.max(availableHeight, 0);
}

function createSectionHTML(config, addMarginTop = false) {
  const marginTopClass = addMarginTop ? 'mt-8' : '';
  return `
    <div class="flex gap-4 pl-2 pr-6 py-0 ${marginTopClass}" data-section="${config.sectionId}">
      <div class="flex flex-col items-center w-4 shrink-0 ml-4" data-timeline="${config.timelineId}">
        <div class="w-4 h-4 rounded-full bg-white shadow-lg flex items-center justify-center relative" data-pdf-no-shadow>
          <div class="w-2 h-2 rounded-full bg-gray-dark"></div>
        </div>
        <div class="w-px bg-gray-300 flex-1"></div>
      </div>
      <div class="flex-1 flex flex-col gap-4">
        <h2 class="text-xs-12 font-outfit font-medium text-ink">${config.title}</h2>
        <div id="${config.sectionId}" class="flex flex-col gap-1">
          <!-- Cards will be generated here dynamically -->
        </div>
      </div>
    </div>
  `;
}

// Clone the first page to keep typography and layout identical across pages.
function createNewPage(pageNumber, templatePage, pagesContainer, sectionType) {
  const newPage = templatePage.cloneNode(true);
  newPage.id = `page-${pageNumber}`;
  newPage.classList.add('pdf-page');

  const sidebar = newPage.querySelector('aside');
  if (sidebar) {
    sidebar.remove();
  }

  const experiencesContainer = newPage.querySelector(SELECTORS.experiencesContainer);
  if (experiencesContainer) {
    experiencesContainer.innerHTML = '';
  }

  const foreignContractsContainer = newPage.querySelector(SELECTORS.foreignContractsContainer);
  if (foreignContractsContainer) {
    foreignContractsContainer.innerHTML = '';
  }

  const researchSection = newPage.querySelector(SELECTORS.researchSection);
  if (researchSection) {
    researchSection.remove();
  }

  const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
  if (academicSection) {
    if (sectionType === 'academic') {
      academicSection.classList.remove('py-0');
      academicSection.classList.add('pt-8', 'pb-0');
    } else {
      academicSection.remove();
    }
  }

  const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
  if (foreignSection) {
    if (sectionType === 'foreign') {
      foreignSection.classList.remove('py-0');
      foreignSection.classList.add('pt-8', 'pb-0');
    } else {
      foreignSection.remove();
    }
  } else if (sectionType === 'foreign') {
    // Se la sezione foreign non esiste nel template, creala
    const section = newPage.querySelector('section');
    if (section) {
      // Cerca se c'è una sezione academic experiences nella pagina
      const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
      
      const config = SECTION_CONFIG.foreign_research_contracts;
      const foreignSectionHTML = createSectionHTML(config, true);
      
      // Se c'è una sezione academic, aggiungi la foreign dopo di essa, altrimenti aggiungila alla fine
      if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', foreignSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', foreignSectionHTML);
      }
    }
  }

  const timeline = newPage.querySelector(SELECTORS.academicTimeline);
  if (timeline) {
    const line = timeline.querySelector('.w-px.bg-gray-300');
    if (line) {
      line.classList.add('flex-1');
    }
  }

  const foreignTimeline = newPage.querySelector(SELECTORS.foreignTimeline);
  if (foreignTimeline) {
    const line = foreignTimeline.querySelector('.w-px.bg-gray-300');
    if (line) {
      line.classList.add('flex-1');
    }
  }

  pagesContainer.appendChild(newPage);
  return newPage;
}

function calculateAvailableHeight(firstPage, experiencesSection) {
  // Calcola l'altezza disponibile nella prima pagina
  // Misura direttamente lo spazio disponibile nella sezione experiences
  const pageHeightPx = 297 * MM_TO_PX; // Altezza totale pagina A4 (297mm)
  
  // Misura l'altezza della sezione Research
  const researchSection = firstPage.querySelector(SELECTORS.researchSection);
  let researchHeight = 0;
  if (researchSection) {
    const researchRect = researchSection.getBoundingClientRect();
    researchHeight = researchRect.height;
  }
  
  // Misura la posizione della sezione experiences rispetto alla pagina
  const experiencesRect = experiencesSection.getBoundingClientRect();
  const pageRect = firstPage.getBoundingClientRect();
  const experiencesTop = experiencesRect.top - pageRect.top;
  
  // Calcola lo spazio disponibile: altezza pagina - posizione top experiences - padding bottom - spazio per numero pagina
  const sectionStyle = window.getComputedStyle(experiencesSection);
  const paddingBottom = parseFloat(sectionStyle.paddingBottom) || 0;
  const availableHeight = pageHeightPx - experiencesTop - paddingBottom - 30; // 30px per il numero di pagina
  
  // Usa un valore più conservativo per evitare overflow
  return Math.max(availableHeight * 0.95, MAX_EXPERIENCE_SECTION_HEIGHT_PX * 0.6);
}

// Funzione generica per renderizzare una sezione
function renderSection(items, config, previousSectionSelector = null) {
  const pagesContainer = document.querySelector(SELECTORS.pagesContainer);
  const templatePage = document.querySelector(SELECTORS.pageTemplate);

  if (!pagesContainer || !templatePage) {
    console.error('Missing pagesContainer or templatePage');
    return;
  }

  resetSection(pagesContainer, templatePage, config);

  // Se è la prima sezione, usa la logica speciale per la prima pagina
  if (config.isFirstSection) {
    const firstContainer = templatePage.querySelector(config.containerSelector);
    const firstSection = templatePage.querySelector(config.sectionSelector);

    if (!firstContainer || !firstSection) {
      throw new Error(`Missing layout containers for ${config.title}`);
    }

    const measureContainer = createMeasurementContainer(firstContainer);
    const firstPageAvailableHeight = calculateAvailableHeight(templatePage, firstSection);
    
    let currentContainer = firstContainer;
    let currentPageHeight = 0;
    let currentPageNumber = 1;
    let isFirstInPage = true;
    let currentPageMaxHeight = firstPageAvailableHeight;
    
    try {
      items.forEach((item, index) => {
        const isCurrent = item.current === true;
        const isFirstInSection = index === 0;
        const isLastInSection = index === items.length - 1;
        const card = config.createCard(item, { isCurrent });
        const cardHeight = measureCardHeight(card, measureContainer);

        const willCreateNewPage = currentPageHeight > 0 && 
                                   currentPageHeight + cardHeight > currentPageMaxHeight;

        if (willCreateNewPage) {
          finalizePage(currentContainer, false);
          currentPageNumber += 1;
          const newPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config.timelineId);
          const newContainer = newPage.querySelector(config.containerSelector);
          if (!newContainer) {
            throw new Error(`Missing ${config.title} container in new page`);
          }
          currentContainer = newContainer;
          currentPageHeight = 0;
          currentPageMaxHeight = MAX_EXPERIENCE_SECTION_HEIGHT_PX;
          isFirstInPage = true;
        }

        card.className = getCardClasses({ 
          isFirstInPage, 
          isFirstInSection, 
          isLastInSection, 
          isCurrent 
        });
        currentContainer.appendChild(card);
        currentPageHeight += cardHeight;
        isFirstInPage = false;
      });

      finalizePage(currentContainer, true);
    } finally {
      measureContainer.remove();
    }
  } else {
    // Per le sezioni successive, cerca spazio nella pagina corrente
    const allPages = document.querySelectorAll('.pdf-page');
    const lastPage = allPages[allPages.length - 1];
    
    const availableHeight = calculateAvailableHeightInPage(lastPage, previousSectionSelector);
    
    let currentPage = lastPage;
    let currentContainer;
    let currentPageNumber = allPages.length;
    let isFirstInPage = true;
    let currentPageMaxHeight;
    
    // Se c'è spazio sufficiente nella pagina corrente, aggiungi la sezione lì
    if (availableHeight >= MIN_HEIGHT_NEEDED) {
      const section = currentPage.querySelector('section');
      if (section) {
        const sectionHTML = createSectionHTML(config, true);
        section.insertAdjacentHTML('beforeend', sectionHTML);
        
        // Estendi la timeline della sezione precedente fino alla nuova sezione
        // Usa setTimeout per dare tempo al browser di renderizzare
        setTimeout(() => {
          if (previousSectionSelector) {
            const previousSection = currentPage.querySelector(previousSectionSelector);
            if (previousSection) {
              // Trova la timeline della sezione precedente
              const previousTimeline = previousSection.querySelector('[data-timeline]');
              if (previousTimeline) {
                const previousLine = previousTimeline.querySelector('.w-px.bg-gray-300');
                const previousCircle = previousTimeline.querySelector('.w-4.h-4');
                if (previousLine && previousCircle) {
                  // Trova il punto del cerchio della nuova sezione
                  const newSection = currentPage.querySelector(config.sectionSelector);
                  if (newSection) {
                    const newTimeline = newSection.querySelector('[data-timeline]');
                    if (newTimeline) {
                      const newCircle = newTimeline.querySelector('.w-4.h-4');
                      if (newCircle) {
                        // Calcola la distanza tra il bottom della sezione precedente e il centro del cerchio della nuova sezione
                        const previousSectionRect = previousSection.getBoundingClientRect();
                        const newCircleRect = newCircle.getBoundingClientRect();
                        const pageRect = currentPage.getBoundingClientRect();
                        
                        // Calcola la posizione del bottom della sezione precedente (fine effettiva del contenuto)
                        const previousSectionBottom = previousSectionRect.bottom - pageRect.top;
                        
                        // Calcola la posizione del centro del cerchio nuovo (metà dell'altezza del cerchio)
                        const newCircleCenter = newCircleRect.top - pageRect.top + (newCircleRect.height / 2);
                        
                        // L'altezza della linea è la distanza tra la fine della sezione precedente e il centro del cerchio nuovo
                        // Questo include lo spazio del margine mt-8 e arriva fino al centro del cerchio
                        const lineHeight = newCircleCenter - previousSectionBottom;
                        
                        // Imposta l'altezza della linea
                        if (lineHeight > 0) {
                          previousLine.classList.remove('flex-1');
                          previousLine.style.height = `${lineHeight}px`;
                          previousLine.style.flex = '0 0 auto';
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }, 10);
      }
      
      currentContainer = currentPage.querySelector(config.containerSelector);
      currentPageMaxHeight = availableHeight;
    } else {
      // Crea una nuova pagina per la sezione
      currentPage = createNewPage(currentPageNumber + 1, templatePage, pagesContainer, config.timelineId);
      currentContainer = currentPage.querySelector(config.containerSelector);
      currentPageNumber = allPages.length + 1;
      currentPageMaxHeight = MAX_EXPERIENCE_SECTION_HEIGHT_PX;
    }
    
    if (!currentContainer) {
      console.error(`Missing ${config.title} container`);
      return;
    }

    const measureContainer = createMeasurementContainer(currentContainer);
    
    let currentPageHeight = 0;
    
    try {
      items.forEach((item, index) => {
        const isCurrent = item.current === true;
        const isFirstInSection = index === 0;
        const isLastInSection = index === items.length - 1;
        const card = config.createCard(item, { isCurrent });
        const cardHeight = measureCardHeight(card, measureContainer);

        const willCreateNewPage = currentPageHeight > 0 && 
                                   currentPageHeight + cardHeight > currentPageMaxHeight;

        if (willCreateNewPage) {
          finalizePage(currentContainer, false);
          currentPageNumber += 1;
          const nextPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config.timelineId);
          currentPage = nextPage;
          const nextContainer = nextPage.querySelector(config.containerSelector);
          if (!nextContainer) {
            throw new Error(`Missing ${config.title} container in new page`);
          }
          currentContainer = nextContainer;
          currentPageHeight = 0;
          currentPageMaxHeight = MAX_EXPERIENCE_SECTION_HEIGHT_PX;
          isFirstInPage = true;
        }

        card.className = getCardClasses({ 
          isFirstInPage, 
          isFirstInSection, 
          isLastInSection, 
          isCurrent 
        });
        currentContainer.appendChild(card);
        currentPageHeight += cardHeight;
        isFirstInPage = false;
      });

      if (currentContainer && currentContainer.children.length > 0) {
        finalizePage(currentContainer, true);
      }
    } finally {
      measureContainer.remove();
    }
  }
}

// Funzioni di rendering specifiche (mantenute per compatibilità)
function renderAcademicExperiences(experiences) {
  renderSection(experiences, SECTION_CONFIG.academic_experiences);
}

function renderForeignResearchContracts(contracts) {
  renderSection(contracts, SECTION_CONFIG.foreign_research_contracts, SELECTORS.experiencesSection);
}

async function loadSection(sectionKey, config, previousSectionSelector = null) {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load ${DATA_URL}`);
    }

    const data = await response.json();
    const items = data[sectionKey];
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }

    renderSection(items, config, previousSectionSelector);
  } catch (error) {
    console.error(`Error loading ${config.title}:`, error);
    setPdfState({ error: `Error loading ${config.title}` });
  }
}

async function loadAcademicExperiences() {
  await loadSection('academic_experiences', SECTION_CONFIG.academic_experiences);
}

async function loadForeignResearchContracts() {
  await loadSection('foreign_research_contracts', SECTION_CONFIG.foreign_research_contracts, SELECTORS.experiencesSection);
}

async function init() {
  initPdfMode();
  await loadAcademicExperiences();
  await loadForeignResearchContracts();
  setPdfState({
    pageCount: document.querySelectorAll('.pdf-page').length,
    ready: true,
  });
}

init();

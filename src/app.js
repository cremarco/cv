const SELECTORS = {
  pagesContainer: '#pages-container',
  pageTemplate: '[data-page-template]',
  experiencesContainer: '#academic-experiences',
  experiencesSection: '[data-section="academic-experiences"]',
  foreignContractsContainer: '#foreign-research-contracts',
  foreignContractsSection: '[data-section="foreign-research-contracts"]',
  researchTransferContainer: '#research-and-technology-transfer',
  researchTransferSection: '[data-section="research-and-technology-transfer"]',
  entrepreneurialInitiativesContainer: '#entrepreneurial-initiatives',
  entrepreneurialInitiativesSection: '[data-section="entrepreneurial-initiatives"]',
  researchSection: '[data-section="research"]',
  pageNumber: '[data-page-number]',
  academicTimeline: '[data-timeline="academic"]',
  foreignTimeline: '[data-timeline="foreign"]',
  researchTransferTimeline: '[data-timeline="research-transfer"]',
  entrepreneurialTimeline: '[data-timeline="entrepreneurial"]',
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

  // Crea l'elemento img direttamente per evitare problemi con i percorsi
  const img = document.createElement('img');
  img.src = `img/logo/${exp.logo}`;
  img.alt = logoAlt;
  img.className = 'w-5 h-5 object-contain flex-shrink-0 rounded';
  card.appendChild(img);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  contentDiv.innerHTML = `
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
    `;
  card.appendChild(contentDiv);

  return card;
}

function createForeignContractCard(exp, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const timeBadgeClasses = getTimeBadgeClasses(isCurrent);
  const topicText = formatSentence(exp.topic);
  const logoAlt = exp.university ? `${exp.university} logo` : 'University logo';
  const topicMarkup = topicText ? `<p class="mb-0">${topicText}</p>` : '';

  // Crea l'elemento img direttamente per evitare problemi con i percorsi
  const img = document.createElement('img');
  img.src = `img/logo/${exp.logo}`;
  img.alt = logoAlt;
  img.className = 'w-5 h-5 object-contain flex-shrink-0 rounded';
  card.appendChild(img);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  contentDiv.innerHTML = `
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
    `;
  card.appendChild(contentDiv);

  return card;
}

function createResearchTransferCard(exp, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const timeBadgeClasses = getTimeBadgeClasses(isCurrent);
  const topicText = formatSentence(exp.topic);
  const logoAlt = exp.company ? `${exp.company} logo` : 'Company logo';
  const topicMarkup = topicText ? `<p class="mb-0">${topicText}</p>` : '';
  const locationMarkup = exp.place ? `
    <div class="flex items-center gap-1">
      <i class='bx bx-map text-[8px] text-muted'></i>
      <div class="text-xs-5 text-muted font-dm-sans">${exp.place}</div>
    </div>
  ` : '';

  // Crea l'elemento img direttamente per evitare problemi con i percorsi
  const img = document.createElement('img');
  img.src = `img/logo/${exp.logo}`;
  img.alt = logoAlt;
  img.className = 'w-5 h-5 object-contain flex-shrink-0 rounded';
  card.appendChild(img);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  contentDiv.innerHTML = `
    <div class="flex-1">
      <div class="flex justify-between items-start mb-1">
        <div class="${isCurrent ? 'w-[100px]' : 'w-[178px]'}">
          <div class="text-xs-7 text-muted font-dm-sans mb-0.5 whitespace-nowrap">${exp.company}</div>
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${exp.position}</div>
        </div>
        <div class="flex flex-col gap-0.5 items-end">
          <div class="flex gap-2">
            ${exp.link ? `<a href="${exp.link}" class="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" aria-label="Link"><i class='bx bx-link-external text-[10px]'></i></a>` : ''}
            <span class="${timeBadgeClasses}">${exp.time_period}</span>
          </div>
          ${locationMarkup}
        </div>
      </div>
      <div class="pl-1.5 text-xs-7 text-ink font-dm-sans leading-normal">
        ${topicMarkup}
      </div>
    `;
  card.appendChild(contentDiv);

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
  research_and_technology_transfer: {
    title: 'Research and technology transfer',
    sectionId: 'research-and-technology-transfer',
    sectionSelector: '[data-section="research-and-technology-transfer"]',
    containerSelector: '#research-and-technology-transfer',
    timelineSelector: '[data-timeline="research-transfer"]',
    timelineId: 'research-transfer',
    createCard: createResearchTransferCard,
    isFirstSection: false,
  },
  entrepreneurial_initiatives: {
    title: 'Entrepreneurial initiatives',
    sectionId: 'entrepreneurial-initiatives',
    sectionSelector: '[data-section="entrepreneurial-initiatives"]',
    containerSelector: '#entrepreneurial-initiatives',
    timelineSelector: '[data-timeline="entrepreneurial"]',
    timelineId: 'entrepreneurial',
    createCard: createResearchTransferCard,
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

function createSectionHTML(config, addMarginTop = false, showTitle = true) {
  const marginTopClass = addMarginTop ? 'mt-8' : '';
  const titleHTML = showTitle ? `<h2 class="text-xs-12 font-outfit font-medium text-ink">${config.title}</h2>` : '';
  const gapClass = showTitle ? 'gap-4' : 'gap-0';
  const circleHTML = showTitle ? `
        <div class="w-4 h-4 rounded-full bg-white shadow-lg flex items-center justify-center relative" data-pdf-no-shadow>
          <div class="w-2 h-2 rounded-full bg-gray-dark"></div>
        </div>
      ` : '';
  // La timeline globale è gestita a livello di section, qui solo il pallino
  return `
    <div class="flex gap-4 pl-2 pr-6 py-0 ${marginTopClass}" data-section="${config.sectionId}">
      <div class="flex flex-col items-center w-4 shrink-0 ml-4 relative z-10" data-timeline="${config.timelineId}">
        ${circleHTML}
      </div>
      <div class="flex-1 flex flex-col ${gapClass}">
        ${titleHTML}
        <div id="${config.sectionId}" class="flex flex-col gap-1">
          <!-- Cards will be generated here dynamically -->
        </div>
      </div>
    </div>
  `;
}

// Clone the first page to keep typography and layout identical across pages.
function createNewPage(pageNumber, templatePage, pagesContainer, sectionType, isFirstPageOfSection = false) {
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

  const researchTransferContainer = newPage.querySelector(SELECTORS.researchTransferContainer);
  if (researchTransferContainer) {
    researchTransferContainer.innerHTML = '';
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
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = academicSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = academicSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = academicSection.querySelector('[data-timeline="academic"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
    } else {
      academicSection.remove();
    }
  }

  const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
  if (foreignSection) {
    if (sectionType === 'foreign') {
      foreignSection.classList.remove('py-0');
      foreignSection.classList.add('pt-8', 'pb-0');
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = foreignSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = foreignSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = foreignSection.querySelector('[data-timeline="foreign"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
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
      const foreignSectionHTML = createSectionHTML(config, true, isFirstPageOfSection);
      
      // Se c'è una sezione academic, aggiungi la foreign dopo di essa, altrimenti aggiungila alla fine
      if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', foreignSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', foreignSectionHTML);
      }
    }
  }

  const researchTransferSection = newPage.querySelector(SELECTORS.researchTransferSection);
  if (researchTransferSection) {
    if (sectionType === 'research-transfer') {
      researchTransferSection.classList.remove('py-0');
      researchTransferSection.classList.add('pt-8', 'pb-0');
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = researchTransferSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = researchTransferSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = researchTransferSection.querySelector('[data-timeline="research-transfer"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
    } else {
      researchTransferSection.remove();
    }
  } else if (sectionType === 'research-transfer') {
    // Se la sezione research-transfer non esiste nel template, creala
    const section = newPage.querySelector('section');
    if (section) {
      // Cerca se ci sono altre sezioni nella pagina
      const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
      const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
      
      const config = SECTION_CONFIG.research_and_technology_transfer;
      const researchTransferSectionHTML = createSectionHTML(config, true, isFirstPageOfSection);
      
      // Aggiungi la sezione dopo l'ultima sezione esistente
      if (foreignSection) {
        foreignSection.insertAdjacentHTML('afterend', researchTransferSectionHTML);
      } else if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', researchTransferSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', researchTransferSectionHTML);
      }
    }
  }

  const entrepreneurialInitiativesSection = newPage.querySelector(SELECTORS.entrepreneurialInitiativesSection);
  if (entrepreneurialInitiativesSection) {
    if (sectionType === 'entrepreneurial') {
      entrepreneurialInitiativesSection.classList.remove('py-0');
      entrepreneurialInitiativesSection.classList.add('pt-8', 'pb-0');
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = entrepreneurialInitiativesSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = entrepreneurialInitiativesSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = entrepreneurialInitiativesSection.querySelector('[data-timeline="entrepreneurial"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
    } else {
      entrepreneurialInitiativesSection.remove();
    }
  } else if (sectionType === 'entrepreneurial') {
    // Se la sezione entrepreneurial non esiste nel template, creala
    const section = newPage.querySelector('section');
    if (section) {
      // Cerca se ci sono altre sezioni nella pagina
      const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
      const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
      const researchTransferSection = newPage.querySelector(SELECTORS.researchTransferSection);
      
      const config = SECTION_CONFIG.entrepreneurial_initiatives;
      const entrepreneurialSectionHTML = createSectionHTML(config, true, isFirstPageOfSection);
      
      // Aggiungi la sezione dopo l'ultima sezione esistente
      if (researchTransferSection) {
        researchTransferSection.insertAdjacentHTML('afterend', entrepreneurialSectionHTML);
      } else if (foreignSection) {
        foreignSection.insertAdjacentHTML('afterend', entrepreneurialSectionHTML);
      } else if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', entrepreneurialSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', entrepreneurialSectionHTML);
      }
    }
  }

  // Assicurati che la section abbia la timeline globale
  const section = newPage.querySelector('section');
  if (section) {
    section.classList.add('relative');
    // Aggiungi la timeline globale se non esiste
    if (!section.querySelector('[data-global-timeline]')) {
      const globalTimeline = document.createElement('div');
      globalTimeline.className = 'absolute left-[30px] top-0 bottom-0 w-px bg-gray-300';
      globalTimeline.setAttribute('data-global-timeline', '');
      section.insertBefore(globalTimeline, section.firstChild);
    }
  }

  // Rimuovi le linee dalle timeline individuali (ora usiamo la timeline globale)
  const allTimelines = newPage.querySelectorAll('[data-timeline]');
  allTimelines.forEach(timeline => {
    timeline.classList.add('relative', 'z-10');
    const line = timeline.querySelector('.w-px.bg-gray-300');
    if (line) {
      line.remove();
    }
  });

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
          const newPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config.timelineId, false);
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
    
    // Misura l'altezza della prima card per verificare se c'è spazio sufficiente
    const measureContainer = createMeasurementContainer(null);
    let firstCardHeight = FALLBACK_CARD_HEIGHT_PX;
    if (items.length > 0) {
      const firstCard = config.createCard(items[0], { isCurrent: items[0].current === true });
      firstCardHeight = measureCardHeight(firstCard, measureContainer);
    }
    
    // Calcola l'altezza necessaria: titolo sezione + margine + prima card
    // Il titolo e il margine occupano circa 60-80px
    const sectionHeaderHeight = 80; // Titolo + margine mt-8 + gap
    const requiredHeight = sectionHeaderHeight + firstCardHeight;
    
    // Se c'è spazio sufficiente per almeno la prima card nella pagina corrente, aggiungi la sezione lì
    if (availableHeight >= requiredHeight) {
      const section = currentPage.querySelector('section');
      if (section) {
        const sectionHTML = createSectionHTML(config, true);
        section.insertAdjacentHTML('beforeend', sectionHTML);
      }
      
      currentContainer = currentPage.querySelector(config.containerSelector);
      currentPageMaxHeight = availableHeight;
    } else {
      // Crea una nuova pagina per la sezione se non c'è spazio sufficiente
      // Questa è la prima pagina della sezione
      currentPage = createNewPage(currentPageNumber + 1, templatePage, pagesContainer, config.timelineId, true);
      currentContainer = currentPage.querySelector(config.containerSelector);
      currentPageNumber = allPages.length + 1;
      currentPageMaxHeight = MAX_EXPERIENCE_SECTION_HEIGHT_PX;
    }
    
    // Rimuovi il measureContainer temporaneo usato per misurare la prima card
    measureContainer.remove();
    
    if (!currentContainer) {
      console.error(`Missing ${config.title} container`);
      return;
    }

    // Crea un nuovo measureContainer con la larghezza corretta del container
    const finalMeasureContainer = createMeasurementContainer(currentContainer);
    
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
          const nextPage = createNewPage(currentPageNumber, templatePage, pagesContainer, config.timelineId, false);
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
      finalMeasureContainer.remove();
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

function renderResearchAndTechnologyTransfer(items) {
  renderSection(items, SECTION_CONFIG.research_and_technology_transfer, SELECTORS.foreignContractsSection);
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

async function loadResearchAndTechnologyTransfer() {
  await loadSection('research_and_technology_transfer', SECTION_CONFIG.research_and_technology_transfer, SELECTORS.foreignContractsSection);
}

async function loadEntrepreneurialInitiatives() {
  await loadSection('entrepreneurial_initiatives', SECTION_CONFIG.entrepreneurial_initiatives, SELECTORS.researchTransferSection);
}

async function init() {
  initPdfMode();
  await loadAcademicExperiences();
  await loadForeignResearchContracts();
  await loadResearchAndTechnologyTransfer();
  await loadEntrepreneurialInitiatives();
  
  setPdfState({
    pageCount: document.querySelectorAll('.pdf-page').length,
    ready: true,
  });
}

init();

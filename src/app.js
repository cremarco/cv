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
  educationContainer: '#education',
  educationSection: '[data-section="education"]',
  teachingContainer: '#teaching-in-phd-courses',
  teachingSection: '[data-section="teaching-in-phd-courses"]',
  teachingGeneralContainer: '#teaching',
  teachingGeneralSection: '[data-section="teaching"]',
  teachingWebinarContainer: '#teaching-webinar',
  teachingWebinarSection: '[data-section="teaching-webinar"]',
  thesisSupervisorContainer: '#thesis-supervisor',
  thesisSupervisorSection: '[data-section="thesis-supervisor"]',
  awardsContainer: '#awards',
  awardsSection: '[data-section="awards"]',
  researchSection: '[data-section="research"]',
  pageNumber: '[data-page-number]',
  academicTimeline: '[data-timeline="academic"]',
  foreignTimeline: '[data-timeline="foreign"]',
  researchTransferTimeline: '[data-timeline="research-transfer"]',
  entrepreneurialTimeline: '[data-timeline="entrepreneurial"]',
  educationTimeline: '[data-timeline="education"]',
  teachingTimeline: '[data-timeline="teaching"]',
  teachingGeneralTimeline: '[data-timeline="teaching-general"]',
  teachingWebinarTimeline: '[data-timeline="teaching-webinar"]',
  thesisSupervisorTimeline: '[data-timeline="thesis-supervisor"]',
  awardsTimeline: '[data-timeline="awards"]',
};

const DATA_URL = './data/cv.json';

const MM_TO_PX = 3.7795275591;
const PAGE_NUMBER_RESERVED_HEIGHT_PX = 25 * MM_TO_PX; // 25mm riservati per il numero di pagina (8mm bottom + 17mm per sicurezza)
const MAX_EXPERIENCE_SECTION_HEIGHT_MM = 170; // Ridotto per lasciare spazio al numero di pagina
const MAX_EXPERIENCE_SECTION_HEIGHT_PX = MAX_EXPERIENCE_SECTION_HEIGHT_MM * MM_TO_PX;
const SECTION_PADDING_BOTTOM_MM = 20; // Padding bottom per le sezioni per evitare sovrapposizione con numero pagina
const SECTION_PADDING_BOTTOM_PX = SECTION_PADDING_BOTTOM_MM * MM_TO_PX;
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
  img.src = `img/mini-logo/${exp.logo}`;
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
  img.src = `img/mini-logo/${exp.logo}`;
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
  img.src = `img/mini-logo/${exp.logo}`;
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

function createEducationCard(edu, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const timeBadgeClasses = getTimeBadgeClasses(false); // Education items are never "current"
  const logoAlt = 'University logo';
  
  // Crea l'elemento img direttamente per evitare problemi con i percorsi
  const img = document.createElement('img');
  img.src = `img/mini-logo/${edu.logo}`;
  img.alt = logoAlt;
  img.className = 'w-5 h-5 object-contain flex-shrink-0 rounded';
  card.appendChild(img);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
  // Build degree text with optional honor
  let degreeText = edu.degree || '';
  if (edu.degree_honor) {
    degreeText += `, <span class="italic">${edu.degree_honor}</span>`;
  }
  
  // Build thesis title (link is now shown as badge, not in text)
  let thesisMarkup = '';
  if (edu.thesis_title) {
    thesisMarkup = `
      <div class="flex gap-2 items-start w-full">
        <div class="flex-shrink-0 w-[60px]">
          <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Thesis Title:</p>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs-7 text-ink font-dm-sans leading-tight">${edu.thesis_title}</p>
        </div>
      </div>
    `;
  }
  
  // Build international experience
  let internationalMarkup = '';
  if (edu.international_experience) {
    internationalMarkup = `
      <div class="flex gap-2 items-start w-full">
        <div class="flex-shrink-0 w-[60px]">
          <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">International Experience:</p>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs-7 text-ink font-dm-sans leading-tight">${edu.international_experience}</p>
        </div>
      </div>
    `;
  }
  
  // Build courses list
  let coursesMarkup = '';
  if (edu.courses && edu.courses.length > 0) {
    const coursesList = edu.courses.map(course => `<li class="mb-0 ml-2.5"><span class="text-xs-7 text-ink font-dm-sans leading-tight">${course}</span></li>`).join('');
    coursesMarkup = `
      <div class="flex gap-2 items-start w-full">
        <div class="flex-shrink-0 w-[60px]">
          <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Courses:</p>
        </div>
        <div class="flex-1 min-w-0">
          <ul class="list-disc">
            ${coursesList}
          </ul>
        </div>
      </div>
    `;
  }
  
  // Build summer schools
  let summerSchoolsMarkup = '';
  if (edu.summer_schools && edu.summer_schools.length > 0) {
    const schoolsList = edu.summer_schools.map((school, index) => 
      `<p class="text-xs-7 text-ink font-dm-sans leading-tight ${index === edu.summer_schools.length - 1 ? '' : 'mb-0'}">${school}</p>`
    ).join('');
    summerSchoolsMarkup = `
      <div class="flex gap-2 items-start w-full">
        <div class="flex-shrink-0 w-[60px]">
          <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Summer Schools:</p>
        </div>
        <div class="flex-1 min-w-0">
          ${schoolsList}
        </div>
      </div>
    `;
  }
  
  // Build link badge if thesis_link exists
  const linkBadge = edu.thesis_link ? `
    <a href="${edu.thesis_link}" class="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" aria-label="Link"><i class='bx bx-link-external text-[10px]'></i></a>
  ` : '';

  contentDiv.innerHTML = `
    <div class="flex-1">
      <div class="flex justify-between items-start mb-1">
        <div class="w-[178px]">
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${degreeText}</div>
        </div>
        <div class="flex flex-col gap-0.5 items-end">
          <div class="flex gap-2">
            ${linkBadge}
            <span class="${timeBadgeClasses}">${edu.time_period}</span>
          </div>
        </div>
      </div>
      <div class="pl-2 flex flex-col gap-0.5 items-start">
        ${thesisMarkup}
        ${internationalMarkup}
        ${coursesMarkup}
        ${summerSchoolsMarkup}
      </div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}

function createTeachingCard(teaching, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const logoAlt = teaching.university ? `${teaching.university} logo` : 'University logo';
  
  // Crea l'elemento img direttamente per evitare problemi con i percorsi
  const img = document.createElement('img');
  img.src = `img/mini-logo/${teaching.logo}`;
  img.alt = logoAlt;
  img.className = 'w-5 h-5 object-contain flex-shrink-0 rounded';
  card.appendChild(img);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
  // Build university name
  const universityMarkup = teaching.university ? `
    <div class="text-xs-7 text-muted font-dm-sans mb-1">${teaching.university}</div>
  ` : '';
  
  // Build programs and courses
  let programsMarkup = '';
  if (teaching.programs && teaching.programs.length > 0) {
    programsMarkup = teaching.programs.map(program => {
      const coursesMarkup = program.courses.map(course => {
        const roleBadge = course.role ? `
          <div class="inline-flex items-center justify-center px-0.5 py-0 h-2 bg-purple-100 text-purple-700 rounded text-[6px] font-dm-sans">
            ${course.role}
          </div>
        ` : '';
        
        return `
          <div class="flex items-center justify-between h-2.5 mb-0.5 last:mb-0">
            <div class="flex gap-2 items-end pl-2">
              <div class="text-xs-8 text-ink font-dm-sans font-medium whitespace-nowrap">${course.course_name}</div>
              <div class="text-xs-6 text-muted font-dm-sans italic whitespace-nowrap">${course.hours}</div>
            </div>
            <div class="flex items-center justify-between w-[120px]">
              ${roleBadge}
              <div class="text-xs-6 text-purple-600 font-dm-sans text-right whitespace-nowrap">${course.time_period}</div>
            </div>
          </div>
        `;
      }).join('');
      
      // Extract program name without "PHD in" prefix if it's already in the name
      let programDisplayName = program.program_name;
      if (programDisplayName.startsWith('PHD in ')) {
        programDisplayName = programDisplayName.substring(7);
      }
      
      return `
        <div class="mb-2 last:mb-0">
          <div class="text-xs-7 text-ink font-dm-sans mb-1">
            <span class="font-bold">PHD</span> in ${programDisplayName}
          </div>
          <div class="flex flex-col gap-0.5">
            ${coursesMarkup}
          </div>
        </div>
      `;
    }).join('');
  }
  
  contentDiv.innerHTML = `
    <div class="flex-1">
      ${universityMarkup}
      <div class="flex flex-col gap-2">
        ${programsMarkup}
      </div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}

function createTeachingGeneralCard(teaching, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const logoAlt = teaching.university ? `${teaching.university} logo` : 'University logo';
  
  // Crea l'elemento img direttamente per evitare problemi con i percorsi
  const img = document.createElement('img');
  img.src = `img/mini-logo/${teaching.logo}`;
  img.alt = logoAlt;
  img.className = 'w-5 h-5 object-contain flex-shrink-0 rounded';
  card.appendChild(img);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
  // Build university name
  const universityMarkup = teaching.university ? `
    <div class="text-xs-7 text-muted font-dm-sans mb-1">${teaching.university}</div>
  ` : '';
  
  // Build programs and courses
  let programsMarkup = '';
  if (teaching.programs && teaching.programs.length > 0) {
    programsMarkup = teaching.programs.map(program => {
      const coursesMarkup = program.courses.map(course => {
        const roleBadge = course.role ? `
          <div class="inline-flex items-center justify-center px-0.5 py-0 h-2 bg-purple-100 text-purple-700 rounded text-[6px] font-dm-sans">
            ${course.role}
          </div>
        ` : '';
        
        // Determine period color: purple if contains "current", gray otherwise
        const periodColor = course.time_period && course.time_period.includes('current') 
          ? 'text-purple-600' 
          : 'text-gray-dark';
        
        const hoursMarkup = course.hours ? `
          <div class="text-xs-6 text-muted font-dm-sans italic whitespace-nowrap">${course.hours}</div>
        ` : '';
        
        return `
          <div class="flex items-center justify-between h-2.5 mb-0.5 last:mb-0">
            <div class="flex gap-2 items-end pl-2">
              <div class="text-xs-8 text-ink font-dm-sans font-medium whitespace-nowrap">${course.course_name}</div>
              ${hoursMarkup}
            </div>
            <div class="flex items-center justify-between w-[120px]">
              ${roleBadge}
              <div class="text-xs-6 ${periodColor} font-dm-sans text-right whitespace-nowrap">${course.time_period || ''}</div>
            </div>
          </div>
        `;
      }).join('');
      
      // Extract program type (MD, BD, Postgraduate, etc.) and name
      let programType = '';
      let programDisplayName = program.program_name;
      
      if (programDisplayName.startsWith('MD ')) {
        programType = 'MD';
        programDisplayName = programDisplayName.substring(3);
      } else if (programDisplayName.startsWith('BD ')) {
        programType = 'BD';
        programDisplayName = programDisplayName.substring(3);
      } else if (programDisplayName.startsWith('Postgraduate ')) {
        programType = 'Postgraduate';
        programDisplayName = programDisplayName.substring(13);
      }
      
      return `
        <div class="mb-2 last:mb-0">
          <div class="text-xs-7 text-ink font-dm-sans mb-1">
            <span class="font-bold">${programType}</span> ${programDisplayName}
          </div>
          <div class="flex flex-col gap-0.5">
            ${coursesMarkup}
          </div>
        </div>
      `;
    }).join('');
  }
  
  contentDiv.innerHTML = `
    <div class="flex-1">
      ${universityMarkup}
      <div class="flex flex-col gap-2">
        ${programsMarkup}
      </div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}

function createTeachingWebinarCard(item, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const logoAlt = item.title ? `${item.title} logo` : 'Logo';
  
  // Crea l'elemento img direttamente per evitare problemi con i percorsi
  const img = document.createElement('img');
  img.src = `img/mini-logo/${item.logo}`;
  img.alt = logoAlt;
  img.className = 'w-6 h-6 object-contain flex-shrink-0 rounded';
  card.appendChild(img);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
  // Build link badge
  const linkBadge = item.link ? `
    <a href="${item.link}" class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded hover:bg-gray-300 underline" aria-label="Link">Link</a>
  ` : '';
  
  // Build date
  const dateMarkup = item.date ? `
    <div class="text-xs-6 text-gray-dark font-dm-sans text-right whitespace-nowrap">${item.date}</div>
  ` : '';
  
  contentDiv.innerHTML = `
    <div class="flex-1">
      <div class="flex justify-between items-start mb-1">
        <div class="flex-1">
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${item.title || ''}</div>
        </div>
        <div class="flex gap-2 items-center">
          ${linkBadge}
          ${dateMarkup}
        </div>
      </div>
      <div class="pl-2 flex flex-col gap-0.5">
        <div class="flex gap-2 items-start w-full">
          <div class="flex-shrink-0 w-[60px]">
            <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Activities:</p>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs-7 text-ink font-dm-sans leading-tight">${item.activities || ''}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}

function createThesisSupervisorCard(data) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex gap-1';
  
  // Bachelor's thesis section - single card
  if (data.bachelor_thesis && data.bachelor_thesis.length > 0) {
    const bachelorItem = data.bachelor_thesis[0];
    const bachelorCard = document.createElement('div');
    bachelorCard.className = 'bg-white px-3 py-2 rounded flex flex-col items-center justify-center';
    bachelorCard.innerHTML = `
      <div class="flex flex-col items-center justify-center">
        <p class="leading-[20px] text-ink text-[16px] tracking-[-0.32px] font-dm-sans font-normal mb-0">${bachelorItem.count}</p>
        <div class="flex flex-col justify-center text-muted text-[5px] text-center tracking-[0.05px] font-dm-sans font-normal">
          <p class="mb-0">${bachelorItem.program}</p>
          <p>@${bachelorItem.university}</p>
        </div>
      </div>
      <div class="flex flex-col justify-center text-muted text-[7px] text-center tracking-[0.07px] font-dm-sans font-normal leading-[9px] mt-1">
        <p>Bachelor's thesis</p>
      </div>
    `;
    wrapper.appendChild(bachelorCard);
  }
  
  // Master's thesis section - single larger card with multiple values
  if (data.master_thesis && data.master_thesis.length > 0) {
    const masterCards = data.master_thesis.map((item, index) => {
      const divider = index > 0 ? '<div class="border border-[rgba(0,0,0,0.05)] border-solid h-[25px] shrink-0 w-[0.5px]"></div>' : '';
      const programParts = item.program.split(' ');
      const needsLineBreak = programParts.length > 2;
      
      return `
        ${divider}
        <div class="flex flex-col items-center justify-center">
          <p class="leading-[20px] text-ink text-[16px] tracking-[-0.32px] font-dm-sans font-normal mb-0">${item.count}</p>
          <div class="flex flex-col justify-center text-muted text-[5px] text-center tracking-[0.05px] font-dm-sans font-normal">
            ${needsLineBreak ? `
              <p class="mb-0">${programParts.slice(0, 2).join(' ')}</p>
              <p>${programParts.slice(2).join(' ')}@${item.university}</p>
            ` : `
              <p class="mb-0">${item.program}</p>
              <p>@${item.university}</p>
            `}
          </div>
        </div>
      `;
    }).join('');
    
    const masterCard = document.createElement('div');
    masterCard.className = 'bg-white px-3 py-2 rounded flex-1';
    masterCard.innerHTML = `
      <div class="flex flex-col gap-1 items-center justify-center">
        <div class="flex gap-4 items-center justify-center">
          ${masterCards}
        </div>
        <div class="flex flex-col justify-center text-muted text-[7px] text-center tracking-[0.07px] font-dm-sans font-normal leading-[9px]">
          <p>Master's thesis</p>
        </div>
      </div>
    `;
    wrapper.appendChild(masterCard);
  }
  
  return wrapper;
}

function createAwardCard(award) {
  const card = document.createElement('div');
  card.className = 'flex flex-col gap-0.5 items-center relative shrink-0';
  
  // Immagine del certificato
  const imgContainer = document.createElement('div');
  imgContainer.className = 'h-[115px] relative shrink-0 w-[160px] flex items-center justify-center';
  const img = document.createElement('img');
  img.src = `img/awards/${award.image}`;
  img.alt = `${award.title} - ${award.event} ${award.year}`;
  img.className = 'max-w-full max-h-full object-contain pointer-events-none';
  img.style.width = '100%';
  img.style.height = '100%';
  imgContainer.appendChild(img);
  card.appendChild(imgContainer);
  
  // Titolo e badge link
  const titleContainer = document.createElement('div');
  titleContainer.className = 'flex gap-1 items-start relative shrink-0 w-full';
  const title = document.createElement('p');
  title.className = 'font-dm-sans font-medium leading-[9px] relative shrink-0 text-gray-dark text-[7px] whitespace-nowrap';
  title.textContent = award.title;
  titleContainer.appendChild(title);
  
  if (award.link) {
    const badge = document.createElement('div');
    badge.className = 'bg-accent-soft flex h-[10px] items-center justify-center px-0.5 py-0 relative rounded-[2px] shrink-0';
    const link = document.createElement('a');
    link.href = award.link;
    link.className = 'block cursor-pointer font-dm-sans font-normal leading-[8px] relative shrink-0 text-accent text-xs-6 text-center whitespace-nowrap underline';
    link.textContent = 'Link';
    badge.appendChild(link);
    titleContainer.appendChild(badge);
  }
  card.appendChild(titleContainer);
  
  // Evento e anno
  const eventText = document.createElement('p');
  eventText.className = 'font-dm-sans font-normal leading-[8px] min-w-full relative shrink-0 text-muted text-xs-6';
  const eventSpan = document.createElement('span');
  eventSpan.textContent = `${award.event} `;
  const yearSpan = document.createElement('span');
  yearSpan.className = 'font-dm-sans font-bold';
  yearSpan.textContent = award.year;
  eventText.appendChild(eventSpan);
  eventText.appendChild(yearSpan);
  card.appendChild(eventText);
  
  return card;
}

function createAwardsCard(awards) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col gap-4';
  
  if (!awards || awards.length === 0) {
    return wrapper;
  }
  
  // Tutti gli awards su un'unica riga
  const row = document.createElement('div');
  row.className = 'flex gap-3 h-[137px] items-center justify-center relative shrink-0 w-full';
  
  awards.forEach(award => {
    const card = createAwardCard(award);
    row.appendChild(card);
  });
  wrapper.appendChild(row);
  
  return wrapper;
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
  education: {
    title: 'Education',
    sectionId: 'education',
    sectionSelector: '[data-section="education"]',
    containerSelector: '#education',
    timelineSelector: '[data-timeline="education"]',
    timelineId: 'education',
    createCard: createEducationCard,
    isFirstSection: false,
  },
  teaching_in_phd_courses: {
    title: 'Teaching in PhD courses',
    sectionId: 'teaching-in-phd-courses',
    sectionSelector: '[data-section="teaching-in-phd-courses"]',
    containerSelector: '#teaching-in-phd-courses',
    timelineSelector: '[data-timeline="teaching"]',
    timelineId: 'teaching',
    createCard: createTeachingCard,
    isFirstSection: false,
  },
  teaching: {
    title: 'Teaching',
    sectionId: 'teaching',
    sectionSelector: '[data-section="teaching"]',
    containerSelector: '#teaching',
    timelineSelector: '[data-timeline="teaching-general"]',
    timelineId: 'teaching-general',
    createCard: createTeachingGeneralCard,
    isFirstSection: false,
  },
  teaching_webinar: {
    title: 'Teaching/Webinar',
    sectionId: 'teaching-webinar',
    sectionSelector: '[data-section="teaching-webinar"]',
    containerSelector: '#teaching-webinar',
    timelineSelector: '[data-timeline="teaching-webinar"]',
    timelineId: 'teaching-webinar',
    createCard: createTeachingWebinarCard,
    isFirstSection: false,
  },
  thesis_supervisor: {
    title: 'Thesis supervisor',
    sectionId: 'thesis-supervisor',
    sectionSelector: '[data-section="thesis-supervisor"]',
    containerSelector: '#thesis-supervisor',
    timelineSelector: '[data-timeline="thesis-supervisor"]',
    timelineId: 'thesis-supervisor',
    createCard: null, // Special rendering function
    isFirstSection: false,
  },
  awards: {
    title: 'Awards',
    subtitle: 'Awards and recognitions for scientific activity',
    sectionId: 'awards',
    sectionSelector: '[data-section="awards"]',
    containerSelector: '#awards',
    timelineSelector: '[data-timeline="awards"]',
    timelineId: 'awards',
    createCard: null, // Special rendering function
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
    return pageHeightPx - PAGE_NUMBER_RESERVED_HEIGHT_PX - SECTION_PADDING_BOTTOM_PX;
  }
  
  // Calcola lo spazio disponibile: altezza pagina - bottom ultima sezione - spazio per numero pagina - padding bottom sezione
  const availableHeight = pageHeightPx - lastBottom - PAGE_NUMBER_RESERVED_HEIGHT_PX - SECTION_PADDING_BOTTOM_PX;
  
  return Math.max(availableHeight, 0);
}

function createSectionHTML(config, addMarginTop = false, showTitle = true) {
  const marginTopClass = addMarginTop ? 'mt-8' : '';
  const subtitleHTML = config.subtitle && showTitle ? `<div class="text-xs-8 font-dm-sans text-ink -mt-1 mb-2">${config.subtitle}</div>` : '';
  const titleHTML = showTitle ? `<h2 class="text-xs-12 font-outfit font-medium text-ink ${config.subtitle ? 'mb-0' : 'mb-0.5'}">${config.title}</h2>` : '';
  const gapClass = showTitle ? 'gap-4' : 'gap-0';
  const circleHTML = showTitle ? `
        <div class="w-4 h-4 rounded-full bg-white shadow-lg flex items-center justify-center relative" data-pdf-no-shadow>
          <div class="w-2 h-2 rounded-full bg-gray-dark"></div>
        </div>
      ` : '';
  // La timeline globale è gestita a livello di section, qui solo il pallino
  // Aggiungiamo padding bottom per evitare sovrapposizione con il numero di pagina
  return `
    <div class="flex gap-4 pl-2 pr-6 pt-0 pb-0 ${marginTopClass}" data-section="${config.sectionId}" style="padding-bottom: ${SECTION_PADDING_BOTTOM_PX}px;">
      <div class="flex flex-col items-center w-4 shrink-0 ml-4 relative z-10" data-timeline="${config.timelineId}">
        ${circleHTML}
      </div>
      <div class="flex-1 flex flex-col ${gapClass}">
        ${titleHTML}
        ${subtitleHTML}
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

  const educationContainer = newPage.querySelector(SELECTORS.educationContainer);
  if (educationContainer) {
    educationContainer.innerHTML = '';
  }

  const teachingContainer = newPage.querySelector(SELECTORS.teachingContainer);
  if (teachingContainer) {
    teachingContainer.innerHTML = '';
  }

  const teachingGeneralContainer = newPage.querySelector(SELECTORS.teachingGeneralContainer);
  if (teachingGeneralContainer) {
    teachingGeneralContainer.innerHTML = '';
  }

  const teachingWebinarContainer = newPage.querySelector(SELECTORS.teachingWebinarContainer);
  if (teachingWebinarContainer) {
    teachingWebinarContainer.innerHTML = '';
  }

  const thesisSupervisorContainer = newPage.querySelector(SELECTORS.thesisSupervisorContainer);
  if (thesisSupervisorContainer) {
    thesisSupervisorContainer.innerHTML = '';
  }

  const awardsContainer = newPage.querySelector(SELECTORS.awardsContainer);
  if (awardsContainer) {
    awardsContainer.innerHTML = '';
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
      academicSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
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
      foreignSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
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
      researchTransferSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
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
      entrepreneurialInitiativesSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
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

  const educationSection = newPage.querySelector(SELECTORS.educationSection);
  if (educationSection) {
    if (sectionType === 'education') {
      educationSection.classList.remove('py-0');
      educationSection.classList.add('pt-8', 'pb-0');
      educationSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = educationSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = educationSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = educationSection.querySelector('[data-timeline="education"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
    } else {
      educationSection.remove();
    }
  } else if (sectionType === 'education') {
    // Se la sezione education non esiste nel template, creala
    const section = newPage.querySelector('section');
    if (section) {
      // Cerca se ci sono altre sezioni nella pagina
      const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
      const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
      const researchTransferSection = newPage.querySelector(SELECTORS.researchTransferSection);
      const entrepreneurialSection = newPage.querySelector(SELECTORS.entrepreneurialInitiativesSection);
      
      const config = SECTION_CONFIG.education;
      const educationSectionHTML = createSectionHTML(config, true, isFirstPageOfSection);
      
      // Aggiungi la sezione dopo l'ultima sezione esistente
      if (entrepreneurialSection) {
        entrepreneurialSection.insertAdjacentHTML('afterend', educationSectionHTML);
      } else if (researchTransferSection) {
        researchTransferSection.insertAdjacentHTML('afterend', educationSectionHTML);
      } else if (foreignSection) {
        foreignSection.insertAdjacentHTML('afterend', educationSectionHTML);
      } else if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', educationSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', educationSectionHTML);
      }
    }
  }

  const teachingSection = newPage.querySelector(SELECTORS.teachingSection);
  if (teachingSection) {
    if (sectionType === 'teaching') {
      teachingSection.classList.remove('py-0');
      teachingSection.classList.add('pt-8', 'pb-0');
      teachingSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = teachingSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = teachingSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = teachingSection.querySelector('[data-timeline="teaching"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
    } else {
      teachingSection.remove();
    }
  } else if (sectionType === 'teaching') {
    // Se la sezione teaching non esiste nel template, creala
    const section = newPage.querySelector('section');
    if (section) {
      // Cerca se ci sono altre sezioni nella pagina
      const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
      const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
      const researchTransferSection = newPage.querySelector(SELECTORS.researchTransferSection);
      const entrepreneurialSection = newPage.querySelector(SELECTORS.entrepreneurialInitiativesSection);
      const educationSection = newPage.querySelector(SELECTORS.educationSection);
      
      const config = SECTION_CONFIG.teaching_in_phd_courses;
      const teachingSectionHTML = createSectionHTML(config, true, isFirstPageOfSection);
      
      // Aggiungi la sezione dopo l'ultima sezione esistente
      if (educationSection) {
        educationSection.insertAdjacentHTML('afterend', teachingSectionHTML);
      } else if (entrepreneurialSection) {
        entrepreneurialSection.insertAdjacentHTML('afterend', teachingSectionHTML);
      } else if (researchTransferSection) {
        researchTransferSection.insertAdjacentHTML('afterend', teachingSectionHTML);
      } else if (foreignSection) {
        foreignSection.insertAdjacentHTML('afterend', teachingSectionHTML);
      } else if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', teachingSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', teachingSectionHTML);
      }
    }
  }

  const teachingGeneralSection = newPage.querySelector(SELECTORS.teachingGeneralSection);
  if (teachingGeneralSection) {
    if (sectionType === 'teaching-general') {
      teachingGeneralSection.classList.remove('py-0');
      teachingGeneralSection.classList.add('pt-8', 'pb-0');
      teachingGeneralSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = teachingGeneralSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = teachingGeneralSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = teachingGeneralSection.querySelector('[data-timeline="teaching-general"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
    } else {
      teachingGeneralSection.remove();
    }
  } else if (sectionType === 'teaching-general') {
    // Se la sezione teaching-general non esiste nel template, creala
    const section = newPage.querySelector('section');
    if (section) {
      // Cerca se ci sono altre sezioni nella pagina
      const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
      const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
      const researchTransferSection = newPage.querySelector(SELECTORS.researchTransferSection);
      const entrepreneurialSection = newPage.querySelector(SELECTORS.entrepreneurialInitiativesSection);
      const educationSection = newPage.querySelector(SELECTORS.educationSection);
      const teachingSection = newPage.querySelector(SELECTORS.teachingSection);
      
      const config = SECTION_CONFIG.teaching;
      const teachingGeneralSectionHTML = createSectionHTML(config, true, isFirstPageOfSection);
      
      // Aggiungi la sezione dopo l'ultima sezione esistente
      if (teachingSection) {
        teachingSection.insertAdjacentHTML('afterend', teachingGeneralSectionHTML);
      } else if (educationSection) {
        educationSection.insertAdjacentHTML('afterend', teachingGeneralSectionHTML);
      } else if (entrepreneurialSection) {
        entrepreneurialSection.insertAdjacentHTML('afterend', teachingGeneralSectionHTML);
      } else if (researchTransferSection) {
        researchTransferSection.insertAdjacentHTML('afterend', teachingGeneralSectionHTML);
      } else if (foreignSection) {
        foreignSection.insertAdjacentHTML('afterend', teachingGeneralSectionHTML);
      } else if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', teachingGeneralSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', teachingGeneralSectionHTML);
      }
    }
  }

  const teachingWebinarSection = newPage.querySelector(SELECTORS.teachingWebinarSection);
  if (teachingWebinarSection) {
    if (sectionType === 'teaching-webinar') {
      teachingWebinarSection.classList.remove('py-0');
      teachingWebinarSection.classList.add('pt-8', 'pb-0');
      teachingWebinarSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = teachingWebinarSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = teachingWebinarSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = teachingWebinarSection.querySelector('[data-timeline="teaching-webinar"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
    } else {
      teachingWebinarSection.remove();
    }
  } else if (sectionType === 'teaching-webinar') {
    // Se la sezione teaching-webinar non esiste nel template, creala
    const section = newPage.querySelector('section');
    if (section) {
      // Cerca se ci sono altre sezioni nella pagina
      const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
      const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
      const researchTransferSection = newPage.querySelector(SELECTORS.researchTransferSection);
      const entrepreneurialSection = newPage.querySelector(SELECTORS.entrepreneurialInitiativesSection);
      const educationSection = newPage.querySelector(SELECTORS.educationSection);
      const teachingSection = newPage.querySelector(SELECTORS.teachingSection);
      const teachingGeneralSection = newPage.querySelector(SELECTORS.teachingGeneralSection);
      
      const config = SECTION_CONFIG.teaching_webinar;
      const teachingWebinarSectionHTML = createSectionHTML(config, true, isFirstPageOfSection);
      
      // Aggiungi la sezione dopo l'ultima sezione esistente
      if (teachingGeneralSection) {
        teachingGeneralSection.insertAdjacentHTML('afterend', teachingWebinarSectionHTML);
      } else if (teachingSection) {
        teachingSection.insertAdjacentHTML('afterend', teachingWebinarSectionHTML);
      } else if (educationSection) {
        educationSection.insertAdjacentHTML('afterend', teachingWebinarSectionHTML);
      } else if (entrepreneurialSection) {
        entrepreneurialSection.insertAdjacentHTML('afterend', teachingWebinarSectionHTML);
      } else if (researchTransferSection) {
        researchTransferSection.insertAdjacentHTML('afterend', teachingWebinarSectionHTML);
      } else if (foreignSection) {
        foreignSection.insertAdjacentHTML('afterend', teachingWebinarSectionHTML);
      } else if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', teachingWebinarSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', teachingWebinarSectionHTML);
      }
    }
  }

  const thesisSupervisorSection = newPage.querySelector(SELECTORS.thesisSupervisorSection);
  if (thesisSupervisorSection) {
    if (sectionType === 'thesis-supervisor') {
      thesisSupervisorSection.classList.remove('py-0');
      thesisSupervisorSection.classList.add('pt-8', 'pb-0');
      thesisSupervisorSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = thesisSupervisorSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = thesisSupervisorSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = thesisSupervisorSection.querySelector('[data-timeline="thesis-supervisor"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
    } else {
      thesisSupervisorSection.remove();
    }
  } else if (sectionType === 'thesis-supervisor') {
    // Se la sezione thesis-supervisor non esiste nel template, creala
    const section = newPage.querySelector('section');
    if (section) {
      // Cerca se ci sono altre sezioni nella pagina
      const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
      const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
      const researchTransferSection = newPage.querySelector(SELECTORS.researchTransferSection);
      const entrepreneurialSection = newPage.querySelector(SELECTORS.entrepreneurialInitiativesSection);
      const educationSection = newPage.querySelector(SELECTORS.educationSection);
      const teachingSection = newPage.querySelector(SELECTORS.teachingSection);
      const teachingGeneralSection = newPage.querySelector(SELECTORS.teachingGeneralSection);
      const teachingWebinarSection = newPage.querySelector(SELECTORS.teachingWebinarSection);
      
      const config = SECTION_CONFIG.thesis_supervisor;
      const thesisSupervisorSectionHTML = createSectionHTML(config, true, isFirstPageOfSection);
      
      // Aggiungi la sezione dopo l'ultima sezione esistente
      if (teachingWebinarSection) {
        teachingWebinarSection.insertAdjacentHTML('afterend', thesisSupervisorSectionHTML);
      } else if (teachingGeneralSection) {
        teachingGeneralSection.insertAdjacentHTML('afterend', thesisSupervisorSectionHTML);
      } else if (teachingSection) {
        teachingSection.insertAdjacentHTML('afterend', thesisSupervisorSectionHTML);
      } else if (educationSection) {
        educationSection.insertAdjacentHTML('afterend', thesisSupervisorSectionHTML);
      } else if (entrepreneurialSection) {
        entrepreneurialSection.insertAdjacentHTML('afterend', thesisSupervisorSectionHTML);
      } else if (researchTransferSection) {
        researchTransferSection.insertAdjacentHTML('afterend', thesisSupervisorSectionHTML);
      } else if (foreignSection) {
        foreignSection.insertAdjacentHTML('afterend', thesisSupervisorSectionHTML);
      } else if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', thesisSupervisorSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', thesisSupervisorSectionHTML);
      }
    }
  }

  const awardsSection = newPage.querySelector(SELECTORS.awardsSection);
  if (awardsSection) {
    if (sectionType === 'awards') {
      awardsSection.classList.remove('py-0');
      awardsSection.classList.add('pt-8', 'pb-0');
      awardsSection.style.paddingBottom = `${SECTION_PADDING_BOTTOM_PX}px`;
      // Rimuovi il titolo e il pallino se non è la prima pagina della sezione
      if (!isFirstPageOfSection) {
        const title = awardsSection.querySelector('h2');
        if (title) {
          title.remove();
        }
        const subtitle = awardsSection.querySelector('.text-xs-8');
        if (subtitle) {
          subtitle.remove();
        }
        // Rimuovi anche il gap-4 dal flex container se non c'è più il titolo
        const contentDiv = awardsSection.querySelector('.flex-1.flex.flex-col');
        if (contentDiv) {
          contentDiv.classList.remove('gap-4');
          contentDiv.classList.add('gap-0');
        }
        // Rimuovi il pallino della timeline (la linea è gestita globalmente)
        const timeline = awardsSection.querySelector('[data-timeline="awards"]');
        if (timeline) {
          const circle = timeline.querySelector('.w-4.h-4.rounded-full');
          if (circle) {
            circle.remove();
          }
        }
      }
    } else {
      awardsSection.remove();
    }
  } else if (sectionType === 'awards') {
    // Se la sezione awards non esiste nel template, creala
    const section = newPage.querySelector('section');
    if (section) {
      // Cerca se ci sono altre sezioni nella pagina
      const academicSection = newPage.querySelector(SELECTORS.experiencesSection);
      const foreignSection = newPage.querySelector(SELECTORS.foreignContractsSection);
      const researchTransferSection = newPage.querySelector(SELECTORS.researchTransferSection);
      const entrepreneurialSection = newPage.querySelector(SELECTORS.entrepreneurialInitiativesSection);
      const educationSection = newPage.querySelector(SELECTORS.educationSection);
      const teachingSection = newPage.querySelector(SELECTORS.teachingSection);
      const teachingGeneralSection = newPage.querySelector(SELECTORS.teachingGeneralSection);
      const teachingWebinarSection = newPage.querySelector(SELECTORS.teachingWebinarSection);
      const thesisSupervisorSection = newPage.querySelector(SELECTORS.thesisSupervisorSection);
      
      const config = SECTION_CONFIG.awards;
      const awardsSectionHTML = createSectionHTML(config, true, isFirstPageOfSection);
      
      // Aggiungi la sezione dopo l'ultima sezione esistente
      if (thesisSupervisorSection) {
        thesisSupervisorSection.insertAdjacentHTML('afterend', awardsSectionHTML);
      } else if (teachingWebinarSection) {
        teachingWebinarSection.insertAdjacentHTML('afterend', awardsSectionHTML);
      } else if (teachingGeneralSection) {
        teachingGeneralSection.insertAdjacentHTML('afterend', awardsSectionHTML);
      } else if (teachingSection) {
        teachingSection.insertAdjacentHTML('afterend', awardsSectionHTML);
      } else if (educationSection) {
        educationSection.insertAdjacentHTML('afterend', awardsSectionHTML);
      } else if (entrepreneurialSection) {
        entrepreneurialSection.insertAdjacentHTML('afterend', awardsSectionHTML);
      } else if (researchTransferSection) {
        researchTransferSection.insertAdjacentHTML('afterend', awardsSectionHTML);
      } else if (foreignSection) {
        foreignSection.insertAdjacentHTML('afterend', awardsSectionHTML);
      } else if (academicSection) {
        academicSection.insertAdjacentHTML('afterend', awardsSectionHTML);
      } else {
        section.insertAdjacentHTML('beforeend', awardsSectionHTML);
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
  const paddingBottom = parseFloat(sectionStyle.paddingBottom) || SECTION_PADDING_BOTTOM_PX;
  const availableHeight = pageHeightPx - experiencesTop - paddingBottom - PAGE_NUMBER_RESERVED_HEIGHT_PX;
  
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
        const cardHeight = measureCardHeight(card, finalMeasureContainer);

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

async function loadEducation() {
  await loadSection('education', SECTION_CONFIG.education, SELECTORS.entrepreneurialInitiativesSection);
}

async function loadTeaching() {
  await loadSection('teaching_in_phd_courses', SECTION_CONFIG.teaching_in_phd_courses, SELECTORS.educationSection);
}

async function loadTeachingGeneral() {
  await loadSection('teaching', SECTION_CONFIG.teaching, SELECTORS.teachingSection);
}

async function loadTeachingWebinar() {
  await loadSection('teaching_webinar', SECTION_CONFIG.teaching_webinar, SELECTORS.teachingGeneralSection);
}

async function loadThesisSupervisor() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load ${DATA_URL}`);
    }

    const data = await response.json();
    const thesisData = data.thesis_supervisor;
    if (!thesisData) {
      return;
    }

    const pagesContainer = document.querySelector(SELECTORS.pagesContainer);
    const templatePage = document.querySelector(SELECTORS.pageTemplate);

    if (!pagesContainer || !templatePage) {
      console.error('Missing pagesContainer or templatePage');
      return;
    }

    const config = SECTION_CONFIG.thesis_supervisor;
    
    // Trova l'ultima pagina o crea una nuova sezione nella pagina corrente
    const allPages = document.querySelectorAll('.pdf-page');
    const lastPage = allPages[allPages.length - 1];
    
    const availableHeight = calculateAvailableHeightInPage(lastPage, SELECTORS.teachingWebinarSection);
    
    let currentPage = lastPage;
    let currentContainer;
    let isFirstInPage = true;
    
    // Calcola l'altezza necessaria per la card
    const measureContainer = createMeasurementContainer(null);
    const card = createThesisSupervisorCard(thesisData);
    const cardHeight = measureCardHeight(card, measureContainer);
    measureContainer.remove();
    
    // Calcola l'altezza necessaria: titolo sezione + margine + card
    const sectionHeaderHeight = 80;
    const requiredHeight = sectionHeaderHeight + cardHeight;
    
    // Se c'è spazio sufficiente nella pagina corrente, aggiungi la sezione lì
    if (availableHeight >= requiredHeight) {
      const section = currentPage.querySelector('section');
      if (section) {
        const sectionHTML = createSectionHTML(config, true);
        section.insertAdjacentHTML('beforeend', sectionHTML);
      }
      
      currentContainer = currentPage.querySelector(config.containerSelector);
    } else {
      // Crea una nuova pagina per la sezione
      const currentPageNumber = allPages.length;
      currentPage = createNewPage(currentPageNumber + 1, templatePage, pagesContainer, config.timelineId, true);
      currentContainer = currentPage.querySelector(config.containerSelector);
    }
    
    if (!currentContainer) {
      console.error(`Missing ${config.title} container`);
      return;
    }

    // Aggiungi la card al container
    const finalCard = createThesisSupervisorCard(thesisData);
    currentContainer.appendChild(finalCard);
  } catch (error) {
    console.error(`Error loading ${SECTION_CONFIG.thesis_supervisor.title}:`, error);
    setPdfState({ error: `Error loading ${SECTION_CONFIG.thesis_supervisor.title}` });
  }
}

async function loadAwards() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load ${DATA_URL}`);
    }

    const data = await response.json();
    const awardsData = data.awards;
    if (!awardsData || !Array.isArray(awardsData) || awardsData.length === 0) {
      return;
    }

    const pagesContainer = document.querySelector(SELECTORS.pagesContainer);
    const templatePage = document.querySelector(SELECTORS.pageTemplate);

    if (!pagesContainer || !templatePage) {
      console.error('Missing pagesContainer or templatePage');
      return;
    }

    const config = SECTION_CONFIG.awards;
    
    // Trova l'ultima pagina o crea una nuova sezione nella pagina corrente
    const allPages = document.querySelectorAll('.pdf-page');
    const lastPage = allPages[allPages.length - 1];
    
    const availableHeight = calculateAvailableHeightInPage(lastPage, SELECTORS.thesisSupervisorSection);
    
    let currentPage = lastPage;
    let currentContainer;
    
    // Calcola l'altezza necessaria per la card
    const measureContainer = createMeasurementContainer(null);
    const card = createAwardsCard(awardsData);
    const cardHeight = measureCardHeight(card, measureContainer);
    measureContainer.remove();
    
    // Calcola l'altezza necessaria: titolo sezione + sottotitolo + margine + card
    const sectionHeaderHeight = 100; // Titolo + sottotitolo + margine
    const requiredHeight = sectionHeaderHeight + cardHeight;
    
    // Se c'è spazio sufficiente nella pagina corrente, aggiungi la sezione lì
    if (availableHeight >= requiredHeight) {
      const section = currentPage.querySelector('section');
      if (section) {
        const sectionHTML = createSectionHTML(config, true);
        section.insertAdjacentHTML('beforeend', sectionHTML);
      }
      
      currentContainer = currentPage.querySelector(config.containerSelector);
    } else {
      // Crea una nuova pagina per la sezione
      const currentPageNumber = allPages.length;
      currentPage = createNewPage(currentPageNumber + 1, templatePage, pagesContainer, config.timelineId, true);
      currentContainer = currentPage.querySelector(config.containerSelector);
    }
    
    if (!currentContainer) {
      console.error(`Missing ${config.title} container`);
      return;
    }

    // Aggiungi la card al container
    const finalCard = createAwardsCard(awardsData);
    currentContainer.appendChild(finalCard);
  } catch (error) {
    console.error(`Error loading ${SECTION_CONFIG.awards.title}:`, error);
    setPdfState({ error: `Error loading ${SECTION_CONFIG.awards.title}` });
  }
}

function updatePageNumbers() {
  // Assicura che ogni pagina abbia un elemento per il numero di pagina con il numero corretto
  const pages = document.querySelectorAll('.pdf-page');
  const totalPages = pages.length;
  
  pages.forEach((page, index) => {
    let pageNumberElement = page.querySelector('[data-page-number]');
    if (!pageNumberElement) {
      pageNumberElement = document.createElement('div');
      pageNumberElement.className = 'page-number';
      pageNumberElement.setAttribute('data-page-number', '');
      page.appendChild(pageNumberElement);
    }
    // Imposta il numero di pagina direttamente come testo
    pageNumberElement.textContent = `${index + 1} / ${totalPages}`;
  });
}

async function loadResearchMetrics() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load ${DATA_URL}`);
    }

    const data = await response.json();
    const metrics = data.research_metrics;
    
    if (!metrics) {
      return;
    }

    // Update Google Scholar metrics
    if (metrics.google_scholar) {
      const gsContainer = document.getElementById('google-scholar-metrics');
      if (gsContainer) {
        const citationsEl = gsContainer.querySelector('[data-metric="citations"]');
        const hIndexEl = gsContainer.querySelector('[data-metric="h-index"]');
        const i10IndexEl = gsContainer.querySelector('[data-metric="i10-index"]');
        
        if (citationsEl) citationsEl.textContent = metrics.google_scholar.citations || '-';
        if (hIndexEl) hIndexEl.textContent = metrics.google_scholar.h_index || '-';
        if (i10IndexEl) i10IndexEl.textContent = metrics.google_scholar.i10_index || '-';
      }
    }

    // Update Scopus metrics
    if (metrics.scopus) {
      const scopusContainer = document.getElementById('scopus-metrics');
      if (scopusContainer) {
        const citationsEl = scopusContainer.querySelector('[data-metric="citations"]');
        if (citationsEl) citationsEl.textContent = metrics.scopus.citations || '-';
      }
    }
  } catch (error) {
    console.error('Error loading research metrics:', error);
  }
}

async function init() {
  initPdfMode();
  await loadResearchMetrics();
  await loadAcademicExperiences();
  await loadForeignResearchContracts();
  await loadResearchAndTechnologyTransfer();
  await loadEntrepreneurialInitiatives();
  await loadEducation();
  await loadTeaching();
  await loadTeachingGeneral();
  await loadTeachingWebinar();
  await loadThesisSupervisor();
  await loadAwards();
  
  // Aggiorna i numeri di pagina
  updatePageNumbers();
  
  setPdfState({
    pageCount: document.querySelectorAll('.pdf-page').length,
    ready: true,
  });
}

init();

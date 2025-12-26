// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

const SELECTORS = {
  pagesContainer: '#pages-container',
  pageTemplate: '[data-page-template]',
  pageNumber: '[data-page-number]',
};

const DATA_URL = './data/cv.json';

// Page layout constants
const MM_TO_PX = 3.7795275591;
const PAGE_HEIGHT_MM = 297;
const PAGE_NUMBER_RESERVED_HEIGHT_MM = 25; // Reserved for page number (8mm bottom + 17mm safety margin)
const SECTION_PADDING_BOTTOM_MM = 4; // Reduced from 20mm to minimize spacing between sections
const MAX_EXPERIENCE_SECTION_HEIGHT_MM = 170;

const PAGE_NUMBER_RESERVED_HEIGHT_PX = PAGE_NUMBER_RESERVED_HEIGHT_MM * MM_TO_PX;
const SECTION_PADDING_BOTTOM_PX = SECTION_PADDING_BOTTOM_MM * MM_TO_PX;
const MAX_EXPERIENCE_SECTION_HEIGHT_PX = MAX_EXPERIENCE_SECTION_HEIGHT_MM * MM_TO_PX;
const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX;
const FALLBACK_CARD_HEIGHT_PX = 150;

// Section header height for layout calculations (pt-12 + title)
const SECTION_HEADER_HEIGHT_PX = 70;

// Shared Tailwind class constants
const CARD_BASE_CLASSES = 'px-4 py-3 flex gap-3 shadow';

// =============================================================================
// SECTION CONFIGURATION
// Maps section keys to their display properties and card creation functions
// =============================================================================

const SECTION_CONFIG = {
  academic_experiences: {
    title: 'Academic experiences',
    sectionId: 'academic-experiences',
    timelineId: 'academic',
    cardType: 'experience',
    isFirstSection: true,
  },
  foreign_research_contracts: {
    title: 'Foreign Research Contracts',
    sectionId: 'foreign-research-contracts',
    timelineId: 'foreign',
    cardType: 'experience',
    previousSectionId: 'academic-experiences',
  },
  research_and_technology_transfer: {
    title: 'Research and technology transfer',
    sectionId: 'research-and-technology-transfer',
    timelineId: 'research-transfer',
    cardType: 'transfer',
    previousSectionId: 'foreign-research-contracts',
  },
  entrepreneurial_initiatives: {
    title: 'Entrepreneurial initiatives',
    sectionId: 'entrepreneurial-initiatives',
    timelineId: 'entrepreneurial',
    cardType: 'transfer',
    previousSectionId: 'research-and-technology-transfer',
  },
  education: {
    title: 'Education',
    sectionId: 'education',
    timelineId: 'education',
    cardType: 'education',
    previousSectionId: 'entrepreneurial-initiatives',
  },
  teaching_in_phd_courses: {
    title: 'Teaching in PhD courses',
    sectionId: 'teaching-in-phd-courses',
    timelineId: 'teaching',
    cardType: 'teaching-phd',
    previousSectionId: 'education',
  },
  teaching: {
    title: 'Teaching',
    sectionId: 'teaching',
    timelineId: 'teaching-general',
    cardType: 'teaching-general',
    previousSectionId: 'teaching-in-phd-courses',
  },
  teaching_webinar: {
    title: 'Teaching/Webinar',
    sectionId: 'teaching-webinar',
    timelineId: 'teaching-webinar',
    cardType: 'webinar',
    previousSectionId: 'teaching',
  },
  thesis_supervisor: {
    title: 'Thesis supervisor',
    sectionId: 'thesis-supervisor',
    timelineId: 'thesis-supervisor',
    cardType: 'thesis',
    previousSectionId: 'teaching-webinar',
  },
  awards: {
    title: 'Awards',
    subtitle: 'Awards and recognitions for scientific activity',
    sectionId: 'awards',
    timelineId: 'awards',
    cardType: 'awards',
    previousSectionId: 'thesis-supervisor',
  },
};

// Build derived selectors from config
Object.values(SECTION_CONFIG).forEach(config => {
  config.sectionSelector = `[data-section="${config.sectionId}"]`;
  config.containerSelector = `#${config.sectionId}`;
  config.timelineSelector = `[data-timeline="${config.timelineId}"]`;
});

// =============================================================================
// PDF STATE MANAGEMENT
// Flags consumed by the Playwright PDF renderer
// =============================================================================

function setPdfState({ ready, pageCount, error } = {}) {
  if (typeof ready !== 'undefined') window.__PDF_READY__ = ready;
  if (typeof pageCount !== 'undefined') window.__PDF_PAGE_COUNT__ = pageCount;
  if (typeof error !== 'undefined') window.__PDF_ERROR__ = error;
}

function initPdfMode() {
  const isPrintPath = window.location.pathname === '/print' || window.location.pathname === '/print/';
  const urlParams = new URLSearchParams(window.location.search);
  const isPdfMode = isPrintPath || urlParams.get('pdf') === '1' || urlParams.get('pdf') === 'true';

  setPdfState({ ready: false, pageCount: 0, error: null });

  if (isPdfMode) {
    document.body.classList.add('pdf-mode');
  }
}

// =============================================================================
// TEXT FORMATTING UTILITIES
// =============================================================================

/**
 * Ensures text ends with a period
 */
function formatSentence(text) {
  if (!text) return '';
  const trimmed = String(text).trim();
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
}

/**
 * Builds topic text with optional SSD suffix
 */
function buildTopicText(exp) {
  const parts = [];
  if (exp.topic) parts.push(exp.topic);
  if (exp.ssd) parts.push(`SSD ${exp.ssd}`);
  return parts.join(', ');
}

// =============================================================================
// CSS CLASS UTILITIES
// =============================================================================

/**
 * Determines card CSS classes based on position in section/page
 */
function getCardClasses({ isFirstInPage, isFirstInSection, isCurrent }) {
  const hasTopRounded = isFirstInSection && isFirstInPage;
  
  if (isFirstInPage && isCurrent) {
    const baseClasses = `${CARD_BASE_CLASSES} bg-accent-lightest border border-accent-soft border-b-0`;
    return hasTopRounded ? `${baseClasses} rounded-t-md` : baseClasses;
  }
  
  if (isFirstInPage) {
    const baseClasses = `${CARD_BASE_CLASSES} bg-white border border-gray-200 border-b-0`;
    return hasTopRounded ? `${baseClasses} rounded-t-md` : baseClasses;
  }
  
  return `${CARD_BASE_CLASSES} bg-white border border-gray-200 border-t-0`;
}

/**
 * Returns time badge classes based on current status
 */
function getTimeBadgeClasses(isCurrent) {
  const base = 'inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded-md';
  return isCurrent 
    ? `${base} bg-purple-100 text-purple-700`
    : `${base} bg-gray-100 text-gray-700`;
}

// =============================================================================
// CARD CREATION - SHARED HELPERS
// =============================================================================

/**
 * Creates a logo image element with standard styling
 */
function createLogoImage(logoPath, alt, sizeClass = 'w-5 h-5') {
  const img = document.createElement('img');
  img.src = `img/mini-logo/${logoPath}`;
  img.alt = alt;
  img.className = `${sizeClass} object-contain flex-shrink-0 rounded`;
  return img;
}

/**
 * Creates a link badge if URL is provided
 */
function createLinkBadge(url, small = false) {
  if (!url) return '';
  
  if (small) {
    return `<a href="${url}" class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded hover:bg-gray-300 underline" aria-label="Link">Link</a>`;
  }
  
  return `<a href="${url}" class="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" aria-label="Link"><i class='bx bx-link-external text-[10px]'></i></a>`;
}

/**
 * Creates a location markup with icon
 */
function createLocationMarkup(place) {
  if (!place) return '';
  return `
    <div class="flex items-center gap-1">
      <i class='bx bx-map text-[8px] text-muted'></i>
      <div class="text-xs-5 text-muted font-dm-sans">${place}</div>
    </div>
  `;
}

// =============================================================================
// CARD CREATION - EXPERIENCE CARDS (Academic & Foreign)
// =============================================================================

/**
 * Creates an experience card (used for academic experiences and foreign contracts)
 */
function createExperienceCard(exp, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const topicText = formatSentence(buildTopicText(exp));
  const departmentText = exp.department ? formatSentence(exp.department) : '';
  const logoAlt = exp.university ? `${exp.university} logo` : 'University logo';
  const nameField = exp.university || exp.company || '';
  const titleWidth = isCurrent ? 'w-[100px]' : 'w-[178px]';

  card.appendChild(createLogoImage(exp.logo, logoAlt));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  contentDiv.innerHTML = `
    <div class="flex justify-between items-start mb-1">
      <div class="${titleWidth}">
        <div class="text-xs-7 text-muted font-dm-sans mb-0.5 whitespace-nowrap">${nameField}</div>
        <div class="text-xs-8 text-ink font-dm-sans font-medium">${exp.position}</div>
      </div>
      <div class="flex flex-col gap-0.5 items-end">
        <div class="flex gap-2">
          ${createLinkBadge(exp.link)}
          <span class="${getTimeBadgeClasses(isCurrent)}">${exp.time_period}</span>
        </div>
        ${createLocationMarkup(exp.place)}
      </div>
    </div>
    <div class="pl-1.5 text-xs-7 text-ink font-dm-sans leading-normal">
      ${topicText ? `<p class="mb-0">${topicText}</p>` : ''}
      ${departmentText ? `<p class="text-xs-6 text-muted italic mt-1">${departmentText}</p>` : ''}
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}

// =============================================================================
// CARD CREATION - TRANSFER CARDS (Research/Technology Transfer & Entrepreneurial)
// =============================================================================

/**
 * Creates a transfer card (for research/tech transfer and entrepreneurial initiatives)
 */
function createTransferCard(exp, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const topicText = formatSentence(exp.topic);
  const logoAlt = exp.company ? `${exp.company} logo` : 'Company logo';
  const titleWidth = isCurrent ? 'w-[100px]' : 'w-[178px]';

  card.appendChild(createLogoImage(exp.logo, logoAlt));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  contentDiv.innerHTML = `
    <div class="flex-1">
      <div class="flex justify-between items-start mb-1">
        <div class="${titleWidth}">
          <div class="text-xs-7 text-muted font-dm-sans mb-0.5 whitespace-nowrap">${exp.company}</div>
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${exp.position}</div>
        </div>
        <div class="flex flex-col gap-0.5 items-end">
          <div class="flex gap-2">
            ${createLinkBadge(exp.link)}
            <span class="${getTimeBadgeClasses(isCurrent)}">${exp.time_period}</span>
          </div>
          ${createLocationMarkup(exp.place)}
        </div>
      </div>
      <div class="pl-1.5 text-xs-7 text-ink font-dm-sans leading-normal">
        ${topicText ? `<p class="mb-0">${topicText}</p>` : ''}
      </div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}

// =============================================================================
// CARD CREATION - EDUCATION CARD
// =============================================================================

/**
 * Creates an education card with degree details
 */
function createEducationCard(edu) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const timeBadgeClasses = getTimeBadgeClasses(false);
  
  card.appendChild(createLogoImage(edu.logo, 'University logo'));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
  // Build degree text with optional honor
  let degreeText = edu.degree || '';
  if (edu.degree_honor) {
    degreeText += `, <span class="italic">${edu.degree_honor}</span>`;
  }
  
  // Build thesis markup
  const thesisMarkup = edu.thesis_title ? `
    <div class="flex gap-2 items-start w-full">
      <div class="flex-shrink-0 w-[60px]">
        <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Thesis Title:</p>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs-7 text-ink font-dm-sans leading-tight">${edu.thesis_title}</p>
      </div>
    </div>
  ` : '';
  
  // Build international experience markup
  const internationalMarkup = edu.international_experience ? `
    <div class="flex gap-2 items-start w-full">
      <div class="flex-shrink-0 w-[60px]">
        <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">International Experience:</p>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs-7 text-ink font-dm-sans leading-tight">${edu.international_experience}</p>
      </div>
    </div>
  ` : '';
  
  // Build courses list
  const coursesMarkup = (edu.courses?.length > 0) ? `
    <div class="flex gap-2 items-start w-full">
      <div class="flex-shrink-0 w-[60px]">
        <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Courses:</p>
      </div>
      <div class="flex-1 min-w-0">
        <ul class="list-disc">
          ${edu.courses.map(c => `<li class="mb-0 ml-2.5"><span class="text-xs-7 text-ink font-dm-sans leading-tight">${c}</span></li>`).join('')}
        </ul>
      </div>
    </div>
  ` : '';
  
  // Build summer schools list
  const summerSchoolsMarkup = (edu.summer_schools?.length > 0) ? `
    <div class="flex gap-2 items-start w-full">
      <div class="flex-shrink-0 w-[60px]">
        <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Summer Schools:</p>
      </div>
      <div class="flex-1 min-w-0">
        ${edu.summer_schools.map((s, i) => 
          `<p class="text-xs-7 text-ink font-dm-sans leading-tight ${i === edu.summer_schools.length - 1 ? '' : 'mb-0'}">${s}</p>`
        ).join('')}
      </div>
    </div>
  ` : '';

  contentDiv.innerHTML = `
    <div class="flex-1">
      <div class="flex justify-between items-start mb-1">
        <div class="w-[178px]">
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${degreeText}</div>
        </div>
        <div class="flex flex-col gap-0.5 items-end">
          <div class="flex gap-2">
            ${createLinkBadge(edu.thesis_link)}
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

// =============================================================================
// CARD CREATION - TEACHING CARDS (PhD & General)
// =============================================================================

/**
 * Renders a single course row for teaching cards
 */
function renderCourseRow(course, isPhd = true) {
  const roleBadge = course.role ? `
    <div class="inline-flex items-center justify-center px-0.5 py-0 h-2 bg-purple-100 text-purple-700 rounded text-[6px] font-dm-sans">
      ${course.role}
    </div>
  ` : '';
  
  const periodColor = (!isPhd && course.time_period?.includes('current'))
    ? 'text-purple-600'
    : isPhd ? 'text-purple-600' : 'text-gray-dark';
  
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
}

/**
 * Extracts program type prefix and display name
 */
function parseProgramName(programName, isPhd = true) {
  const prefixes = isPhd 
    ? [{ match: 'PHD in ', type: 'PHD' }]
    : [
        { match: 'MD ', type: 'MD' },
        { match: 'BD ', type: 'BD' },
        { match: 'Postgraduate ', type: 'Postgraduate' },
      ];
  
  for (const prefix of prefixes) {
    if (programName.startsWith(prefix.match)) {
      return { type: prefix.type, name: programName.substring(prefix.match.length) };
    }
  }
  
  return isPhd ? { type: 'PHD', name: programName } : { type: '', name: programName };
}

/**
 * Creates a teaching card (for both PhD and general teaching)
 */
function createTeachingCard(teaching, { isPhd = true }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const logoAlt = teaching.university ? `${teaching.university} logo` : 'University logo';
  
  card.appendChild(createLogoImage(teaching.logo, logoAlt));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
  const universityMarkup = teaching.university ? `
    <div class="text-xs-7 text-muted font-dm-sans mb-1">${teaching.university}</div>
  ` : '';
  
  const programsMarkup = (teaching.programs?.length > 0) 
    ? teaching.programs.map(program => {
        const { type, name } = parseProgramName(program.program_name, isPhd);
        const coursesHtml = program.courses.map(c => renderCourseRow(c, isPhd)).join('');
        
        return `
          <div class="mb-2 last:mb-0">
            <div class="text-xs-7 text-ink font-dm-sans mb-1">
              <span class="font-bold">${type}</span> ${isPhd ? 'in ' : ''}${name}
            </div>
            <div class="flex flex-col gap-0.5">${coursesHtml}</div>
          </div>
        `;
      }).join('')
    : '';
  
  contentDiv.innerHTML = `
    <div class="flex-1">
      ${universityMarkup}
      <div class="flex flex-col gap-2">${programsMarkup}</div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}

// =============================================================================
// CARD CREATION - WEBINAR CARD
// =============================================================================

/**
 * Creates a webinar/teaching card
 */
function createWebinarCard(item) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const logoAlt = item.title ? `${item.title} logo` : 'Logo';
  
  card.appendChild(createLogoImage(item.logo, logoAlt, 'w-6 h-6'));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
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
          ${createLinkBadge(item.link, true)}
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

// =============================================================================
// CARD CREATION - THESIS SUPERVISOR CARD
// =============================================================================

/**
 * Creates a thesis supervisor statistics card
 */
function createThesisSupervisorCard(data) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex gap-1';
  
  // Bachelor's thesis section
  if (data.bachelor_thesis?.length > 0) {
    const item = data.bachelor_thesis[0];
    const bachelorCard = document.createElement('div');
    bachelorCard.className = 'bg-white px-3 py-2 rounded flex flex-col items-center justify-center';
    bachelorCard.innerHTML = `
      <div class="flex flex-col items-center justify-center">
        <p class="leading-[20px] text-ink text-[16px] tracking-[-0.32px] font-dm-sans font-normal mb-0">${item.count}</p>
        <div class="flex flex-col justify-center text-muted text-[5px] text-center tracking-[0.05px] font-dm-sans font-normal">
          <p class="mb-0">${item.program}</p>
          <p>@${item.university}</p>
        </div>
      </div>
      <div class="flex flex-col justify-center text-muted text-[7px] text-center tracking-[0.07px] font-dm-sans font-normal leading-[9px] mt-1">
        <p>Bachelor's thesis</p>
      </div>
    `;
    wrapper.appendChild(bachelorCard);
  }
  
  // Master's thesis section
  if (data.master_thesis?.length > 0) {
    const masterCards = data.master_thesis.map((item, index) => {
      const divider = index > 0 ? '<div class="border border-[rgba(0,0,0,0.05)] border-solid h-[25px] shrink-0 w-[0.5px]"></div>' : '';
      const programParts = item.program.split(' ');
      const needsLineBreak = programParts.length > 2;
      
      const programHtml = needsLineBreak
        ? `<p class="mb-0">${programParts.slice(0, 2).join(' ')}</p>
           <p>${programParts.slice(2).join(' ')}@${item.university}</p>`
        : `<p class="mb-0">${item.program}</p>
           <p>@${item.university}</p>`;
      
      return `
        ${divider}
        <div class="flex flex-col items-center justify-center">
          <p class="leading-[20px] text-ink text-[16px] tracking-[-0.32px] font-dm-sans font-normal mb-0">${item.count}</p>
          <div class="flex flex-col justify-center text-muted text-[5px] text-center tracking-[0.05px] font-dm-sans font-normal">
            ${programHtml}
          </div>
        </div>
      `;
    }).join('');
    
    const masterCard = document.createElement('div');
    masterCard.className = 'bg-white px-3 py-2 rounded flex-1';
    masterCard.innerHTML = `
      <div class="flex flex-col gap-1 items-center justify-center">
        <div class="flex gap-4 items-center justify-center">${masterCards}</div>
        <div class="flex flex-col justify-center text-muted text-[7px] text-center tracking-[0.07px] font-dm-sans font-normal leading-[9px]">
          <p>Master's thesis</p>
        </div>
      </div>
    `;
    wrapper.appendChild(masterCard);
  }
  
  return wrapper;
}

// =============================================================================
// CARD CREATION - AWARDS CARD
// =============================================================================

/**
 * Creates a single award card
 */
function createAwardCard(award) {
  const card = document.createElement('div');
  card.className = 'flex flex-col gap-0.5 items-center relative shrink-0';
  
  // Award image
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
  
  // Title and link badge
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
  
  // Event and year
  const eventText = document.createElement('p');
  eventText.className = 'font-dm-sans font-normal leading-[8px] min-w-full relative shrink-0 text-muted text-xs-6';
  eventText.innerHTML = `${award.event} <span class="font-dm-sans font-bold">${award.year}</span>`;
  card.appendChild(eventText);
  
  return card;
}

/**
 * Creates a container with all award cards
 */
function createAwardsCard(awards) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col gap-4';
  
  if (!awards?.length) return wrapper;
  
  const row = document.createElement('div');
  row.className = 'flex gap-3 h-[137px] items-center justify-center relative shrink-0 w-full';
  
  awards.forEach(award => row.appendChild(createAwardCard(award)));
  wrapper.appendChild(row);
  
  return wrapper;
}

// =============================================================================
// CARD FACTORY
// Maps card types to their creation functions
// =============================================================================

function createCard(type, data, options = {}) {
  switch (type) {
    case 'experience':
      return createExperienceCard(data, options);
    case 'transfer':
      return createTransferCard(data, options);
    case 'education':
      return createEducationCard(data);
    case 'teaching-phd':
      return createTeachingCard(data, { ...options, isPhd: true });
    case 'teaching-general':
      return createTeachingCard(data, { ...options, isPhd: false });
    case 'webinar':
      return createWebinarCard(data);
    default:
      console.warn(`Unknown card type: ${type}`);
      return document.createElement('div');
  }
}

// =============================================================================
// MEASUREMENT UTILITIES
// =============================================================================

/**
 * Creates an off-screen container for measuring element heights
 */
function createMeasurementContainer(referenceElement) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-1';
  container.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:-9999px;top:0';

  if (referenceElement) {
    const { width } = referenceElement.getBoundingClientRect();
    if (width) container.style.width = `${width}px`;
  }

  document.body.appendChild(container);
  return container;
}

/**
 * Measures card height in an off-screen container
 */
function measureCardHeight(card, measureContainer) {
  measureContainer.appendChild(card);
  const height = card.offsetHeight || FALLBACK_CARD_HEIGHT_PX;
  measureContainer.removeChild(card);
  return height;
}

// =============================================================================
// PAGE UTILITIES
// =============================================================================

/**
 * Finalizes a page by adding bottom rounded corners to last card if needed
 */
function finalizePage(container, isLastPageOfSection = false) {
  if (!container?.children.length) return;
  
  // Remove any existing bottom rounded corners
  Array.from(container.children).forEach(card => {
    card.classList.remove('rounded-b-md');
  });
  
  // Add bottom corners only to the last card of the last page
  if (isLastPageOfSection) {
    container.lastElementChild.classList.add('rounded-b-md');
  }
}

/**
 * Calculates available height in a page after previous sections
 */
function calculateAvailableHeightInPage(page, previousSectionSelector) {
  if (!previousSectionSelector) {
    return PAGE_HEIGHT_PX - PAGE_NUMBER_RESERVED_HEIGHT_PX - SECTION_PADDING_BOTTOM_PX;
  }
  
  const previousSection = page.querySelector(previousSectionSelector);
  if (!previousSection) {
    return PAGE_HEIGHT_PX - PAGE_NUMBER_RESERVED_HEIGHT_PX - SECTION_PADDING_BOTTOM_PX;
  }
  
  const pageRect = page.getBoundingClientRect();
  const sectionRect = previousSection.getBoundingClientRect();
  const lastBottom = sectionRect.bottom - pageRect.top;
  
  return Math.max(PAGE_HEIGHT_PX - lastBottom - PAGE_NUMBER_RESERVED_HEIGHT_PX - SECTION_PADDING_BOTTOM_PX, 0);
}

/**
 * Calculates available height in the first page for the first section
 */
function calculateFirstPageAvailableHeight(page, section) {
  const sectionRect = section.getBoundingClientRect();
  const pageRect = page.getBoundingClientRect();
  const sectionTop = sectionRect.top - pageRect.top;
  
  const sectionStyle = window.getComputedStyle(section);
  const paddingBottom = parseFloat(sectionStyle.paddingBottom) || SECTION_PADDING_BOTTOM_PX;
  
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
function createSectionHTML(config, addMarginTop = false, showTitle = true, isNewPage = false) {
  // For new pages: use pt-12 for proper spacing from top edge
  // For same page: use mt-3 for tighter spacing between sections
  const topSpacingClass = isNewPage ? 'pt-12' : (addMarginTop ? 'mt-3' : '');
  const gapClass = showTitle ? 'gap-4' : 'gap-0';
  
  const titleHTML = showTitle 
    ? `<h2 class="text-xs-12 font-outfit font-medium text-ink ${config.subtitle ? 'mb-0' : 'mb-0.5'}">${config.title}</h2>` 
    : '';
  
  const subtitleHTML = (config.subtitle && showTitle) 
    ? `<div class="text-xs-8 font-dm-sans text-ink -mt-1 mb-2">${config.subtitle}</div>` 
    : '';
  
  const circleHTML = showTitle 
    ? `<div class="w-4 h-4 rounded-full bg-white shadow-lg flex items-center justify-center relative" data-pdf-no-shadow>
         <div class="w-2 h-2 rounded-full bg-gray-dark"></div>
       </div>` 
    : '';
  
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
function createNewPage(pageNumber, templatePage, pagesContainer, sectionConfig, isFirstPageOfSection = false) {
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
            contentDiv.classList.remove('gap-4');
            contentDiv.classList.add('gap-0');
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

// =============================================================================
// SECTION RENDERING
// =============================================================================

/**
 * Renders a section with cards and handles page breaks
 */
function renderSection(items, config, previousSectionSelector = null) {
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
        const isLastInSection = index === items.length - 1;
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
function renderSpecialSection(config, data, createCardFn, previousSectionSelector) {
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

// =============================================================================
// DATA LOADING
// =============================================================================

/**
 * Loads CV data from JSON file
 */
async function loadCVData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
  return response.json();
}

/**
 * Loads and renders a section from CV data
 */
async function loadSection(sectionKey, config, previousSectionSelector = null) {
  try {
    const data = await loadCVData();
    const items = data[sectionKey];
    if (!Array.isArray(items) || items.length === 0) return;
    renderSection(items, config, previousSectionSelector);
  } catch (error) {
    console.error(`Error loading ${config.title}:`, error);
    setPdfState({ error: `Error loading ${config.title}` });
  }
}

/**
 * Loads and renders thesis supervisor section
 */
async function loadThesisSupervisor() {
  try {
    const data = await loadCVData();
    if (!data.thesis_supervisor) return;
    
    const config = SECTION_CONFIG.thesis_supervisor;
    renderSpecialSection(
      config, 
      data.thesis_supervisor, 
      createThesisSupervisorCard, 
      SECTION_CONFIG.teaching_webinar.sectionSelector
    );
  } catch (error) {
    console.error('Error loading Thesis supervisor:', error);
    setPdfState({ error: 'Error loading Thesis supervisor' });
  }
}

/**
 * Loads and renders awards section
 */
async function loadAwards() {
  try {
    const data = await loadCVData();
    if (!data.awards?.length) return;
    
    const config = SECTION_CONFIG.awards;
    renderSpecialSection(
      config, 
      data.awards, 
      createAwardsCard, 
      SECTION_CONFIG.thesis_supervisor.sectionSelector
    );
  } catch (error) {
    console.error('Error loading Awards:', error);
    setPdfState({ error: 'Error loading Awards' });
  }
}

/**
 * Loads and updates research metrics in the DOM
 */
async function loadResearchMetrics() {
  try {
    const data = await loadCVData();
    const metrics = data.research_metrics;
    if (!metrics) return;

    // Update Google Scholar metrics
    if (metrics.google_scholar) {
      const gsContainer = document.getElementById('google-scholar-metrics');
      if (gsContainer) {
        const metricsMap = {
          'citations': metrics.google_scholar.citations,
          'h-index': metrics.google_scholar.h_index,
          'i10-index': metrics.google_scholar.i10_index,
        };
        
        Object.entries(metricsMap).forEach(([key, value]) => {
          const el = gsContainer.querySelector(`[data-metric="${key}"]`);
          if (el) el.textContent = value || '-';
        });
      }
    }

    // Update Scopus metrics
    if (metrics.scopus) {
      const scopusContainer = document.getElementById('scopus-metrics');
      const citationsEl = scopusContainer?.querySelector('[data-metric="citations"]');
      if (citationsEl) citationsEl.textContent = metrics.scopus.citations || '-';
    }
  } catch (error) {
    console.error('Error loading research metrics:', error);
  }
}

/**
 * Updates page numbers on all pages
 */
function updatePageNumbers() {
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
    pageNumberElement.textContent = `${index + 1} / ${totalPages}`;
  });
}

// =============================================================================
// INITIALIZATION
// =============================================================================

async function init() {
  initPdfMode();
  
  await loadResearchMetrics();
  
  // Load sections in order with their dependencies
  await loadSection('academic_experiences', SECTION_CONFIG.academic_experiences);
  await loadSection('foreign_research_contracts', SECTION_CONFIG.foreign_research_contracts, 
    SECTION_CONFIG.academic_experiences.sectionSelector);
  await loadSection('research_and_technology_transfer', SECTION_CONFIG.research_and_technology_transfer,
    SECTION_CONFIG.foreign_research_contracts.sectionSelector);
  await loadSection('entrepreneurial_initiatives', SECTION_CONFIG.entrepreneurial_initiatives,
    SECTION_CONFIG.research_and_technology_transfer.sectionSelector);
  await loadSection('education', SECTION_CONFIG.education,
    SECTION_CONFIG.entrepreneurial_initiatives.sectionSelector);
  await loadSection('teaching_in_phd_courses', SECTION_CONFIG.teaching_in_phd_courses,
    SECTION_CONFIG.education.sectionSelector);
  await loadSection('teaching', SECTION_CONFIG.teaching,
    SECTION_CONFIG.teaching_in_phd_courses.sectionSelector);
  await loadSection('teaching_webinar', SECTION_CONFIG.teaching_webinar,
    SECTION_CONFIG.teaching.sectionSelector);
  
  await loadThesisSupervisor();
  await loadAwards();
  
  updatePageNumbers();
  
  setPdfState({
    pageCount: document.querySelectorAll('.pdf-page').length,
    ready: true,
  });
}

init();

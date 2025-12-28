// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

export const SELECTORS = {
  pagesContainer: '#pages-container',
  pageTemplate: '[data-page-template]',
  pageNumber: '[data-page-number]',
};

export const DATA_URL = './data/cv.json';

// Page layout constants
export const MM_TO_PX = 3.7795275591;
export const PAGE_HEIGHT_MM = 297;
export const PAGE_NUMBER_RESERVED_HEIGHT_MM = 25;
export const SECTION_PADDING_BOTTOM_MM = 4;
export const MAX_EXPERIENCE_SECTION_HEIGHT_MM = 170;

export const PAGE_NUMBER_RESERVED_HEIGHT_PX = PAGE_NUMBER_RESERVED_HEIGHT_MM * MM_TO_PX;
export const SECTION_PADDING_BOTTOM_PX = SECTION_PADDING_BOTTOM_MM * MM_TO_PX;
export const MAX_EXPERIENCE_SECTION_HEIGHT_PX = MAX_EXPERIENCE_SECTION_HEIGHT_MM * MM_TO_PX;
export const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX;
export const FALLBACK_CARD_HEIGHT_PX = 150;
// Safety margin to prevent cards from overlapping with page numbers
export const PAGE_BREAK_SAFETY_MARGIN_PX = 10;

// Section header height for layout calculations (pt-12 + title)
export const SECTION_HEADER_HEIGHT_PX = 70;

// Shared Tailwind class constants
export const CARD_PADDING_CLASSES = 'px-4 py-3';
export const CARD_BASE_CLASSES = `${CARD_PADDING_CLASSES} flex gap-3 shadow break-inside-avoid-page`;
export const CARD_SURFACE_CLASSES = 'bg-white border border-gray-200 shadow';

// Current/Active card color classes (configurable via Tailwind config)
export const CURRENT_CARD_BG = 'bg-current-50';
export const CURRENT_BADGE_BG = 'bg-current-100';
export const CURRENT_BADGE_TEXT = 'text-current-700';
export const CURRENT_TEXT = 'text-current-600';
export const CURRENT_TEXT_LIGHT = 'text-current-500';

// Card spacing constants
export const CARD_CONTENT_PADDING = 'pl-1.5'; // Standard padding for card content text
export const CARD_SECTION_PADDING = 'pl-2'; // Padding for structured sections within cards
export const CARD_CONTAINER_GAP = 'gap-1'; // Gap between cards in containers
export const CARD_INTERNAL_GAP = 'gap-1'; // Gap between major card blocks
export const CARD_TEXT_GAP = 'gap-1'; // Gap for compact card text rows (increased from gap-0.5 to prevent overlapping)
export const CARD_ELEMENT_GAP = 'gap-2'; // Gap between card elements (badges, etc.)

// =============================================================================
// SECTION CONFIGURATION
// Maps section keys to their display properties and card creation functions
// =============================================================================

export const SECTION_CONFIG = {
  academic_experiences: {
    title: 'Academic experiences',
    sectionId: 'academic-experiences',
    timelineId: 'academic',
    cardType: 'experience',
    isFirstSection: true,
    highlightActiveBackground: true,
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
    highlightActiveBackground: true,
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
  publications: {
    title: 'Publications',
    sectionId: 'publications',
    timelineId: 'publications',
    cardType: 'publications',
    previousSectionId: 'awards',
  },
  community_service: {
    title: 'Community service',
    subtitle: 'Scientific responsibility in international conferences or workshops',
    sectionId: 'community-service',
    timelineId: 'community-service',
    cardType: 'community-service',
    previousSectionId: 'publications',
  },
  community_service_editorial: {
    title: 'Community service',
    subtitle: 'Direction or participation in editorial boards of journals, publishing series, encyclopedias, and treatises of recognised prestige',
    sectionId: 'community-service-editorial',
    timelineId: 'community-service-editorial',
    cardType: 'community-service-editorial',
    previousSectionId: 'community-service',
  },
  international_research_projects: {
    title: 'International research projects/groups',
    subtitle: 'Active participation and collaboration in international research groups, with a temporal continuity of at least four years',
    sectionId: 'international-research-projects',
    timelineId: 'international-research-projects',
    cardType: 'international-research-projects',
    previousSectionId: 'community-service-editorial',
    highlightActiveBackground: true,
  },
  italian_research_projects: {
    title: 'Italian research projects/groups',
    subtitle: 'Active participation and collaboration in italian research groups',
    sectionId: 'italian-research-projects',
    timelineId: 'italian-research-projects',
    cardType: 'italian-research-projects',
    previousSectionId: 'international-research-projects',
    highlightActiveBackground: true,
  },
  projects: {
    title: 'Projects',
    sectionId: 'projects',
    timelineId: 'projects',
    cardType: 'projects',
    previousSectionId: 'italian-research-projects',
  },
  tender_commissions: {
    title: 'Tender commissions',
    subtitle: 'Member of evaluation commissions for research grants',
    sectionId: 'tender-commissions',
    timelineId: 'tender-commissions',
    cardType: 'tender-commissions',
    previousSectionId: 'projects',
  },
  declaration: {
    title: '',
    sectionId: 'declaration',
    timelineId: 'declaration',
    cardType: 'declaration',
    previousSectionId: 'tender-commissions',
  },
};

// Build derived selectors from config
Object.values(SECTION_CONFIG).forEach(config => {
  config.sectionSelector = `[data-section="${config.sectionId}"]`;
  config.containerSelector = `#${config.sectionId}`;
  config.timelineSelector = `[data-timeline="${config.timelineId}"]`;
});

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

// Section header height for layout calculations (pt-12 + title)
export const SECTION_HEADER_HEIGHT_PX = 70;

// Shared Tailwind class constants
export const CARD_BASE_CLASSES = 'px-4 py-3 flex gap-3 shadow';

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
};

// Build derived selectors from config
Object.values(SECTION_CONFIG).forEach(config => {
  config.sectionSelector = `[data-section="${config.sectionId}"]`;
  config.containerSelector = `#${config.sectionId}`;
  config.timelineSelector = `[data-timeline="${config.timelineId}"]`;
});



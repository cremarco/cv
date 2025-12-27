// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

import { SECTION_CONFIG } from './config.js';
import { initPdfMode, setPdfState } from './utils/pdf-state.js';
import {
  loadResearchMetrics,
  loadSection,
  loadThesisSupervisor,
  loadAwards,
  loadPublications,
  updatePageNumbers,
} from './data/loader.js';

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
  await loadPublications();
  
  updatePageNumbers();
  
  setPdfState({
    pageCount: document.querySelectorAll('.pdf-page').length,
    ready: true,
  });
}

init();


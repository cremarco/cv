// =============================================================================
// DATA LOADING
// =============================================================================

import { DATA_URL, SECTION_CONFIG } from '../config.js';
import { isPdfMode, setPdfState } from '../utils/pdf-state.js';
import { getRenderOptions } from '../utils/render-options.js';
import { compareDatesDesc } from '../utils/date.js';
import { renderSection, renderSpecialSection, renderSpecialSectionWithPageBreaks, renderPublications } from '../layout/section-renderer.js';
import { createThesisSupervisorCard } from '../cards/thesis.js';
import { createAwardsCard } from '../cards/awards.js';
import { createCommunityServiceCard } from '../cards/community-service.js';
import { createEditorialCommunityServiceCard } from '../cards/community-service-editorial.js';
import { createInternationalResearchProjectsCard } from '../cards/international-research-projects.js';
import { createItalianResearchProjectsCard } from '../cards/italian-research-projects.js';
import { createProjectsCard } from '../cards/projects.js';
import { createTenderCommissionsCard } from '../cards/tender-commissions.js';
import { createDeclarationCard } from '../cards/declaration.js';

let cvDataPromise = null;
let cachedResearchMetrics = null;

/**
 * Loads CV data from JSON file with caching to ensure consistent values across sections
 */
export async function loadCVData() {
  if (!cvDataPromise) {
    cvDataPromise = (async () => {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error(`Failed to load ${DATA_URL}: ${response.status} ${response.statusText}`);
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text (first 500 chars):', text.substring(0, 500));
        throw new Error(`Failed to parse JSON from ${DATA_URL}: ${parseError.message}`);
      }
    })();
  }

  try {
    return await cvDataPromise;
  } catch (error) {
    cvDataPromise = null;
    console.error('Error loading CV data:', error);
    throw error;
  }
}

/**
 * Normalises research metrics and keeps a shared reference
 */
function buildResearchMetrics(rawMetrics) {
  if (!rawMetrics) return null;

  const safeMetric = (value) => value ?? null;

  const metrics = {
    google_scholar: rawMetrics.google_scholar
      ? {
          citations: safeMetric(rawMetrics.google_scholar.citations),
          h_index: safeMetric(rawMetrics.google_scholar.h_index),
          i10_index: safeMetric(rawMetrics.google_scholar.i10_index),
          url: rawMetrics.google_scholar.url || null,
        }
      : null,
    scopus: rawMetrics.scopus
      ? {
          citations: safeMetric(rawMetrics.scopus.citations),
          h_index: safeMetric(rawMetrics.scopus.h_index),
          url: rawMetrics.scopus.url || null,
        }
      : null,
    orcid: rawMetrics.orcid
      ? {
          id: rawMetrics.orcid.id || null,
          url: rawMetrics.orcid.url || null,
        }
      : null,
  };

  cachedResearchMetrics = metrics;
  return metrics;
}

/**
 * Shared getter used by other loaders to avoid diverging metrics objects
 */
function getResearchMetrics(rawMetrics) {
  if (cachedResearchMetrics) return cachedResearchMetrics;
  return buildResearchMetrics(rawMetrics);
}

function updateMetricValues(container, metricsMap) {
  if (!container) return false;

  Object.entries(metricsMap).forEach(([key, value]) => {
    const el = container.querySelector(`[data-metric="${key}"]`);
    if (el) {
      el.textContent = value ?? '—';
    }
  });

  return true;
}

/**
 * Loads and renders a section from CV data
 */
export async function loadSection(sectionKey, config, previousSectionSelector = null) {
  try {
    const data = await loadCVData();
    let items = data[sectionKey];
    if (!Array.isArray(items) || items.length === 0) return;
    
    // Sort teaching_webinar items by date (most recent first)
    if (sectionKey === 'teaching_webinar') {
      items = [...items].sort((a, b) => compareDatesDesc(a.date, b.date));
    }
    
    renderSection(items, config, previousSectionSelector);
  } catch (error) {
    console.error(`Error loading ${config.title}:`, error);
    setPdfState({ error: `Error loading ${config.title}` });
  }
}

/**
 * Loads and renders thesis supervisor section
 */
export async function loadThesisSupervisor() {
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
export async function loadAwards() {
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
 * Loads and renders publications section
 */
export async function loadPublications() {
  try {
    const data = await loadCVData();
    if (!data.publications?.papers?.length) return;
    
    const config = SECTION_CONFIG.publications;
    const metrics = getResearchMetrics(data.research_metrics);
    
    renderPublications(
      config,
      data.publications,
      metrics,
      SECTION_CONFIG.awards.sectionSelector
    );
  } catch (error) {
    console.error('Error loading Publications:', error);
    setPdfState({ error: 'Error loading Publications' });
  }
}

/**
 * Loads and renders community service section
 */
export async function loadCommunityService() {
  try {
    const data = await loadCVData();
    if (!data.community_service) return;
    
    const config = SECTION_CONFIG.community_service;
    renderSpecialSection(
      config, 
      data.community_service, 
      createCommunityServiceCard, 
      SECTION_CONFIG.publications.sectionSelector
    );
  } catch (error) {
    console.error('Error loading Community service:', error);
    setPdfState({ error: 'Error loading Community service' });
  }
}

/**
 * Loads and renders editorial community service section
 */
export async function loadEditorialCommunityService() {
  try {
    const data = await loadCVData();
    if (!data.community_service_editorial) return;
    
    const config = SECTION_CONFIG.community_service_editorial;
    renderSpecialSection(
      config, 
      data.community_service_editorial, 
      createEditorialCommunityServiceCard, 
      SECTION_CONFIG.community_service.sectionSelector
    );
  } catch (error) {
    console.error('Error loading Editorial Community service:', error);
    setPdfState({ error: 'Error loading Editorial Community service' });
  }
}

/**
 * Loads and renders international research projects section
 */
export async function loadInternationalResearchProjects() {
  try {
    const data = await loadCVData();
    if (!data.international_research_projects?.length) return;
    
    const config = SECTION_CONFIG.international_research_projects;
    renderSpecialSectionWithPageBreaks(
      config, 
      data.international_research_projects, 
      createInternationalResearchProjectsCard, 
      SECTION_CONFIG.community_service_editorial.sectionSelector
    );
  } catch (error) {
    console.error('Error loading International research projects:', error);
    setPdfState({ error: 'Error loading International research projects' });
  }
}

/**
 * Loads and renders Italian research projects section
 */
export async function loadItalianResearchProjects() {
  try {
    const data = await loadCVData();
    if (!data.italian_research_projects?.length) return;
    
    const config = SECTION_CONFIG.italian_research_projects;
    renderSpecialSectionWithPageBreaks(
      config, 
      data.italian_research_projects, 
      createItalianResearchProjectsCard, 
      SECTION_CONFIG.international_research_projects.sectionSelector
    );
  } catch (error) {
    console.error('Error loading Italian research projects:', error);
    setPdfState({ error: 'Error loading Italian research projects' });
  }
}

/**
 * Loads and renders projects section
 */
export async function loadProjects() {
  try {
    const data = await loadCVData();
    if (!data.projects?.length) return;
    
    const config = SECTION_CONFIG.projects;
    renderSpecialSectionWithPageBreaks(
      config, 
      data.projects, 
      createProjectsCard, 
      SECTION_CONFIG.italian_research_projects.sectionSelector
    );
  } catch (error) {
    console.error('Error loading Projects:', error);
    setPdfState({ error: 'Error loading Projects' });
  }
}

/**
 * Loads and renders tender commissions section
 */
export async function loadTenderCommissions() {
  try {
    const data = await loadCVData();
    if (!data.tender_commissions) return;
    
    const config = SECTION_CONFIG.tender_commissions;
    renderSpecialSection(
      config, 
      data.tender_commissions, 
      createTenderCommissionsCard, 
      SECTION_CONFIG.projects.sectionSelector
    );
  } catch (error) {
    console.error('Error loading Tender commissions:', error);
    setPdfState({ error: 'Error loading Tender commissions' });
  }
}

/**
 * Loads and renders declaration section
 */
export async function loadDeclaration() {
  try {
    const { noPersonalData } = getRenderOptions();
    if (noPersonalData) return;
    const config = SECTION_CONFIG.declaration;
    renderSpecialSection(
      config, 
      {}, // No data needed for declaration
      createDeclarationCard, 
      SECTION_CONFIG.tender_commissions.sectionSelector
    );
  } catch (error) {
    console.error('Error loading Declaration:', error);
    setPdfState({ error: 'Error loading Declaration' });
  }
}

/**
 * Loads and updates research metrics in the DOM
 */
export async function loadResearchMetrics() {
  try {
    const data = await loadCVData();
    const metrics = getResearchMetrics(data.research_metrics);
    if (!metrics) {
      console.error('Missing research metrics in CV data');
      return;
    }

    // Update Google Scholar metrics
    const gsContainer = document.getElementById('google-scholar-metrics');
    if (!metrics.google_scholar) {
      console.error('Google Scholar metrics are missing from CV data');
    } else if (!updateMetricValues(gsContainer, {
      'citations': metrics.google_scholar.citations,
      'h-index': metrics.google_scholar.h_index,
      'i10-index': metrics.google_scholar.i10_index,
    })) {
      console.error('Google Scholar metrics container not found in DOM');
    }

    // Update Scopus metrics
    const scopusContainer = document.getElementById('scopus-metrics');
    if (!metrics.scopus) {
      console.error('Scopus metrics are missing from CV data');
    } else if (!updateMetricValues(scopusContainer, {
      'citations': metrics.scopus.citations,
      'h-index': metrics.scopus.h_index,
    })) {
      console.error('Scopus metrics container not found in DOM');
    }

    // Update ORCID in sidebar
    const orcidSidebar = document.getElementById('orcid-sidebar');
    const orcidLink = document.getElementById('orcid-link');
    if (metrics.orcid && orcidLink) {
      const orcidUrl = metrics.orcid.url || '#';
      const orcidId = metrics.orcid.id || '-';
      orcidLink.href = orcidUrl;
      orcidLink.textContent = orcidId;
    } else if (orcidSidebar) {
      // Hide ORCID section if not available
      orcidSidebar.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading research metrics:', error);
  }
}

/**
 * Updates page numbers on all pages
 */
export function updatePageNumbers() {
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

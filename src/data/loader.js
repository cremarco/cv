// =============================================================================
// DATA LOADING
// =============================================================================

import { DATA_URL, SECTION_CONFIG, SECTION_CONFIG_BY_ID } from '../config.js';
import { setPdfState } from '../utils/pdf-state.js';
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

function withSectionError(label, loaderFn) {
  return loaderFn().catch((error) => {
    console.error(`Error loading ${label}:`, error);
    setPdfState({ error: `Error loading ${label}` });
  });
}

function hasRenderableData(sectionData) {
  if (Array.isArray(sectionData)) return sectionData.length > 0;
  return Boolean(sectionData);
}

function sortSectionItems(sectionKey, items) {
  if (sectionKey === 'teaching_webinar') {
    return [...items].sort((a, b) => compareDatesDesc(a.date, b.date));
  }
  return items;
}

function resolvePreviousSectionSelector(config, explicitPreviousSectionSelector = null) {
  if (explicitPreviousSectionSelector) return explicitPreviousSectionSelector;
  if (!config?.previousSectionId) return null;
  return SECTION_CONFIG_BY_ID[config.previousSectionId]?.config?.sectionSelector || null;
}

function getConfigByKey(configKey) {
  const config = SECTION_CONFIG[configKey];
  if (!config) {
    throw new Error(`Unknown SECTION_CONFIG key: ${configKey}`);
  }
  return config;
}

function loadSpecialSection({
  data,
  configKey,
  dataKey,
  createCardFn,
  withPageBreaks = false,
}) {
  const sectionData = data[dataKey];
  if (!hasRenderableData(sectionData)) return;

  const config = getConfigByKey(configKey);
  const previousSectionSelector = resolvePreviousSectionSelector(config);
  const renderer = withPageBreaks ? renderSpecialSectionWithPageBreaks : renderSpecialSection;
  renderer(config, sectionData, createCardFn, previousSectionSelector);
}

/**
 * Loads and renders a section from CV data
 */
export async function loadSection(sectionKey, config, previousSectionSelector = null) {
  const label = config?.title || sectionKey;
  return withSectionError(label, async () => {
    const data = await loadCVData();
    const items = data[sectionKey];
    if (!Array.isArray(items) || items.length === 0) return;

    const sortedItems = sortSectionItems(sectionKey, items);
    const resolvedPreviousSelector = resolvePreviousSectionSelector(config, previousSectionSelector);
    renderSection(sortedItems, config, resolvedPreviousSelector);
  });
}

/**
 * Loads and renders thesis supervisor section
 */
export async function loadThesisSupervisor() {
  return withSectionError('Thesis supervisor', async () => {
    const data = await loadCVData();
    loadSpecialSection({
      data,
      configKey: 'thesis_supervisor',
      dataKey: 'thesis_supervisor',
      createCardFn: createThesisSupervisorCard,
    });
  });
}

/**
 * Loads and renders awards section
 */
export async function loadAwards() {
  return withSectionError('Awards', async () => {
    const data = await loadCVData();
    loadSpecialSection({
      data,
      configKey: 'awards',
      dataKey: 'awards',
      createCardFn: createAwardsCard,
    });
  });
}

/**
 * Loads and renders publications section
 */
export async function loadPublications() {
  return withSectionError('Publications', async () => {
    const data = await loadCVData();
    if (!data.publications?.papers?.length) return;

    const config = getConfigByKey('publications');
    const metrics = getResearchMetrics(data.research_metrics);
    const previousSectionSelector = resolvePreviousSectionSelector(config);

    renderPublications(
      config,
      data.publications,
      metrics,
      previousSectionSelector
    );
  });
}

/**
 * Loads and renders community service section
 */
export async function loadCommunityService() {
  return withSectionError('Community service', async () => {
    const data = await loadCVData();
    loadSpecialSection({
      data,
      configKey: 'community_service',
      dataKey: 'community_service',
      createCardFn: createCommunityServiceCard,
    });
  });
}

/**
 * Loads and renders editorial community service section
 */
export async function loadEditorialCommunityService() {
  return withSectionError('Editorial Community service', async () => {
    const data = await loadCVData();
    loadSpecialSection({
      data,
      configKey: 'community_service_editorial',
      dataKey: 'community_service_editorial',
      createCardFn: createEditorialCommunityServiceCard,
    });
  });
}

/**
 * Loads and renders international research projects section
 */
export async function loadInternationalResearchProjects() {
  return withSectionError('International research projects', async () => {
    const data = await loadCVData();
    loadSpecialSection({
      data,
      configKey: 'international_research_projects',
      dataKey: 'international_research_projects',
      createCardFn: createInternationalResearchProjectsCard,
      withPageBreaks: true,
    });
  });
}

/**
 * Loads and renders Italian research projects section
 */
export async function loadItalianResearchProjects() {
  return withSectionError('Italian research projects', async () => {
    const data = await loadCVData();
    loadSpecialSection({
      data,
      configKey: 'italian_research_projects',
      dataKey: 'italian_research_projects',
      createCardFn: createItalianResearchProjectsCard,
      withPageBreaks: true,
    });
  });
}

/**
 * Loads and renders projects section
 */
export async function loadProjects() {
  return withSectionError('Projects', async () => {
    const data = await loadCVData();
    loadSpecialSection({
      data,
      configKey: 'projects',
      dataKey: 'projects',
      createCardFn: createProjectsCard,
      withPageBreaks: true,
    });
  });
}

/**
 * Loads and renders tender commissions section
 */
export async function loadTenderCommissions() {
  return withSectionError('Tender commissions', async () => {
    const data = await loadCVData();
    loadSpecialSection({
      data,
      configKey: 'tender_commissions',
      dataKey: 'tender_commissions',
      createCardFn: createTenderCommissionsCard,
    });
  });
}

/**
 * Loads and renders declaration section
 */
export async function loadDeclaration() {
  return withSectionError('Declaration', async () => {
    const { noPersonalData } = getRenderOptions();
    if (noPersonalData) return;
    const config = getConfigByKey('declaration');
    const previousSectionSelector = resolvePreviousSectionSelector(config);

    renderSpecialSection(
      config,
      {}, // No data needed for declaration
      createDeclarationCard,
      previousSectionSelector
    );
  });
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

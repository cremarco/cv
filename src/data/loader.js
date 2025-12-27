// =============================================================================
// DATA LOADING
// =============================================================================

import { DATA_URL, SECTION_CONFIG } from '../config.js';
import { setPdfState } from '../utils/pdf-state.js';
import { renderSection, renderSpecialSection, renderPublications } from '../layout/section-renderer.js';
import { createThesisSupervisorCard } from '../cards/thesis.js';
import { createAwardsCard } from '../cards/awards.js';

/**
 * Loads CV data from JSON file
 */
export async function loadCVData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
  return response.json();
}

/**
 * Loads and renders a section from CV data
 */
export async function loadSection(sectionKey, config, previousSectionSelector = null) {
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
    if (!data.publications) return;
    
    const config = SECTION_CONFIG.publications;
    const metrics = data.research_metrics;
    
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
 * Loads and updates research metrics in the DOM
 */
export async function loadResearchMetrics() {
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


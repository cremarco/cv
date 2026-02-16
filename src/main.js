// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

import { SECTION_CONFIG, SECTION_RENDER_PIPELINE } from './config.js';
import { initPdfMode, setPdfState } from './utils/pdf-state.js';
import { applyRenderOptions } from './utils/render-options.js';
import {
  loadResearchMetrics,
  loadSection,
  loadThesisSupervisor,
  loadAwards,
  loadPublications,
  loadCommunityService,
  loadEditorialCommunityService,
  loadInternationalResearchProjects,
  loadItalianResearchProjects,
  loadProjects,
  loadTenderCommissions,
  loadDeclaration,
  updatePageNumbers,
} from './data/loader.js';
import { highlightActiveItems } from './utils/active-highlighter.js';

const CUSTOM_SECTION_LOADERS = {
  loadThesisSupervisor,
  loadAwards,
  loadPublications,
  loadCommunityService,
  loadEditorialCommunityService,
  loadInternationalResearchProjects,
  loadItalianResearchProjects,
  loadProjects,
  loadTenderCommissions,
  loadDeclaration,
};

async function waitForFonts(timeoutMs = 1500) {
  if (!document.fonts?.ready) return;
  await Promise.race([
    document.fonts.ready,
    new Promise(resolve => setTimeout(resolve, timeoutMs))
  ]);
}

async function runSectionPipeline() {
  for (const step of SECTION_RENDER_PIPELINE) {
    if (step.type === 'section') {
      const config = SECTION_CONFIG[step.sectionKey];
      if (!config) {
        console.error(`Unknown section config: ${step.sectionKey}`);
        continue;
      }

      await loadSection(step.sectionKey, config);
      continue;
    }

    const loader = CUSTOM_SECTION_LOADERS[step.loader];
    if (!loader) {
      console.error(`Unknown pipeline loader: ${step.loader}`);
      continue;
    }

    await loader();
  }
}

async function init() {
  initPdfMode();
  
  await waitForFonts();
  
  await loadResearchMetrics();

  await runSectionPipeline();
  
  await applyRenderOptions();

  updatePageNumbers();
  
  // Highlight active items based on date analysis
  // Use a small delay to ensure DOM is fully rendered
  setTimeout(() => {
    highlightActiveItems({
      highlightBackground: true,
      highlightDates: true
    });
  }, 200);
  
  setPdfState({
    pageCount: document.querySelectorAll('.pdf-page').length,
    ready: true,
  });
}

init();

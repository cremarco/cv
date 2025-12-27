// =============================================================================
// PDF STATE MANAGEMENT
// Flags consumed by the Playwright PDF renderer
// =============================================================================

export function setPdfState({ ready, pageCount, error } = {}) {
  if (typeof ready !== 'undefined') window.__PDF_READY__ = ready;
  if (typeof pageCount !== 'undefined') window.__PDF_PAGE_COUNT__ = pageCount;
  if (typeof error !== 'undefined') window.__PDF_ERROR__ = error;
}

export function initPdfMode() {
  const isPrintPath = window.location.pathname === '/print' || window.location.pathname === '/print/';
  const urlParams = new URLSearchParams(window.location.search);
  const isPdfMode = isPrintPath || urlParams.get('pdf') === '1' || urlParams.get('pdf') === 'true';

  setPdfState({ ready: false, pageCount: 0, error: null });

  if (isPdfMode) {
    document.body.classList.add('pdf-mode');
  }
}



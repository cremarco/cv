// =============================================================================
// RENDER OPTIONS
// =============================================================================

const INTERNAL_FILE_PREFIXES = ['/files/', '/img/', '/data/', '/dist/', '/src/'];
const INTERNAL_FILE_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg'];

let cachedOptions = null;

function parseFlag(params, name) {
  if (!params.has(name)) return false;
  const rawValue = params.get(name);
  const value = (rawValue || '').trim().toLowerCase();

  if (value === '' || value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  return true;
}

export function getRenderOptions() {
  if (cachedOptions) return cachedOptions;
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  cachedOptions = {
    noPersonalData: parseFlag(params, 'no-personal-data') || parseFlag(hashParams, 'no-personal-data'),
    noLink: parseFlag(params, 'no-link') || parseFlag(hashParams, 'no-link'),
  };
  return cachedOptions;
}

export function isInternalFileLink(href) {
  if (!href) return false;
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#')) return false;
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return false;

  const isAbsolute = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
  if (isAbsolute && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }

  let url;
  try {
    url = new URL(trimmed, window.location.href);
  } catch (error) {
    return false;
  }

  const isRelative = !isAbsolute && !trimmed.startsWith('//');
  const isSameOrigin = url.origin === window.location.origin;
  if (!isRelative && !isSameOrigin) return false;

  const path = (url.pathname || '').toLowerCase();
  const matchesPrefix = INTERNAL_FILE_PREFIXES.some(prefix => path.startsWith(prefix));
  const matchesExtension = INTERNAL_FILE_EXTENSIONS.some(ext => path.endsWith(ext));
  return matchesPrefix || matchesExtension;
}

export function shouldHideInternalLinks() {
  const options = getRenderOptions();
  return options.noLink;
}

function hidePersonalData() {
  const personalBlock = document.querySelector('[data-personal-data]');
  if (!personalBlock) return;

  const divider = document.querySelector('[data-personal-divider]');
  if (divider) divider.remove();
  personalBlock.remove();
}

function hideInternalLinks() {
  const anchors = document.querySelectorAll('a[href]');
  anchors.forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (!isInternalFileLink(href)) return;

    const parent = anchor.parentElement;
    anchor.remove();

    if (parent && parent.children.length === 0 && parent.textContent.trim() === '') {
      parent.remove();
    }
  });
}

export function applyRenderOptions() {
  const options = getRenderOptions();
  if (options.noPersonalData) {
    hidePersonalData();
  }
  if (options.noLink) {
    hideInternalLinks();
  }
}

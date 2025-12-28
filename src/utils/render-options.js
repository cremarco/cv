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

function getCompactImageSettings() {
  return {
    maxWidth: 480,
    maxHeight: 480,
    layoutScale: 2,
    jpegQuality: 1,
    minDimension: 96,
    forceJpeg: true,
  };
}

function isSameOriginImage(src) {
  if (!src) return false;
  if (src.startsWith('data:') || src.startsWith('blob:')) return false;
  let url;
  try {
    url = new URL(src, window.location.href);
  } catch (error) {
    return false;
  }
  return url.origin === window.location.origin;
}

function getImageExtension(src) {
  if (!src) return '';
  let url;
  try {
    url = new URL(src, window.location.href);
  } catch (error) {
    return '';
  }
  const pathname = url.pathname || '';
  const lastDot = pathname.lastIndexOf('.');
  if (lastDot === -1) return '';
  return pathname.slice(lastDot + 1).toLowerCase();
}

async function compressImage(img, settings) {
  if (!img || img.dataset.pdfCompactSkip === 'true') return;
  if (!isSameOriginImage(img.currentSrc || img.src)) return;

  const src = img.currentSrc || img.src;
  const extension = getImageExtension(src);
  if (!['png', 'jpg', 'jpeg'].includes(extension)) return;

  try {
    if (!img.complete || img.naturalWidth === 0) {
      await img.decode();
    }
  } catch (error) {
    return;
  }

  const naturalWidth = img.naturalWidth || 0;
  const naturalHeight = img.naturalHeight || 0;
  if (!naturalWidth || !naturalHeight) return;
  if (Math.max(naturalWidth, naturalHeight) <= settings.minDimension) return;

  const layoutWidth = img.clientWidth || img.width || naturalWidth;
  const layoutHeight = img.clientHeight || img.height || naturalHeight;
  const targetMaxWidth = Math.min(settings.maxWidth, Math.round(layoutWidth * settings.layoutScale));
  const targetMaxHeight = Math.min(settings.maxHeight, Math.round(layoutHeight * settings.layoutScale));
  const ratio = Math.min(1, targetMaxWidth / naturalWidth, targetMaxHeight / naturalHeight);

  const targetWidth = Math.max(1, Math.round(naturalWidth * ratio));
  const targetHeight = Math.max(1, Math.round(naturalHeight * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isPng = extension === 'png';
  const outputType = settings.forceJpeg ? 'image/jpeg' : (isPng ? 'image/png' : 'image/jpeg');
  if (outputType === 'image/jpeg') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const quality = outputType === 'image/jpeg' ? settings.jpegQuality : undefined;
  const dataUrl = canvas.toDataURL(outputType, quality);
  if (!dataUrl) return;

  img.src = dataUrl;
  img.removeAttribute('srcset');
}

async function compressImagesForCompactPdf() {
  const settings = getCompactImageSettings();
  const images = Array.from(document.querySelectorAll('img'));
  const tasks = images.map(img => compressImage(img, settings));
  await Promise.all(tasks);
}

function flattenGradientTextForCompact() {
  const nodes = document.querySelectorAll('.bg-clip-text, .text-transparent');
  nodes.forEach(node => {
    node.style.backgroundImage = 'none';
    node.style.backgroundClip = 'border-box';
    node.style.webkitBackgroundClip = 'border-box';
    node.style.color = '#2563eb';
    node.style.webkitTextFillColor = '#2563eb';
  });
}

export function getRenderOptions() {
  if (cachedOptions) return cachedOptions;
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  cachedOptions = {
    noPersonalData: parseFlag(params, 'no-personal-data') || parseFlag(hashParams, 'no-personal-data'),
    noLink: parseFlag(params, 'no-link') || parseFlag(hashParams, 'no-link'),
    pdfCompact: parseFlag(params, 'pdf-compact')
      || parseFlag(params, 'compact')
      || parseFlag(hashParams, 'pdf-compact')
      || parseFlag(hashParams, 'compact'),
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
  if (options.pdfCompact) {
    document.body.classList.add('pdf-compact');
    flattenGradientTextForCompact();
    return compressImagesForCompactPdf();
  }
  return Promise.resolve();
}

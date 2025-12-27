// =============================================================================
// CARD CREATION - SHARED HELPERS
// =============================================================================

/**
 * Creates a logo image element with standard styling
 */
export function createLogoImage(logoPath, alt, sizeClass = 'w-5 h-5') {
  const img = document.createElement('img');
  img.src = `img/mini-logo/${logoPath}`;
  img.alt = alt;
  img.className = `${sizeClass} object-contain flex-shrink-0 rounded`;
  return img;
}

/**
 * Creates a link badge if URL is provided
 */
export function createLinkBadge(url, small = false) {
  if (!url) return '';
  
  if (small) {
    return `<a href="${url}" target="_blank" class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded hover:bg-gray-300" aria-label="Link"><i class='bx bx-link-external text-[8px]'></i></a>`;
  }
  
  return `<a href="${url}" target="_blank" class="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" aria-label="Link"><i class='bx bx-link-external text-[10px]'></i></a>`;
}

/**
 * Creates a location markup with icon
 */
export function createLocationMarkup(place) {
  if (!place) return '';
  return `
    <div class="flex items-center gap-1">
      <i class='bx bx-map text-[8px] text-muted'></i>
      <div class="text-xs-5 text-muted font-dm-sans">${place}</div>
    </div>
  `;
}



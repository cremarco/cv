// =============================================================================
// MEASUREMENT UTILITIES
// =============================================================================

import { FALLBACK_CARD_HEIGHT_PX } from '../config.js';

/**
 * Creates an off-screen container for measuring element heights
 */
export function createMeasurementContainer(referenceElement) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-1';
  container.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:-9999px;top:0';

  if (referenceElement) {
    const { width } = referenceElement.getBoundingClientRect();
    if (width) container.style.width = `${width}px`;
  }

  document.body.appendChild(container);
  return container;
}

/**
 * Measures card height in an off-screen container
 */
export function measureCardHeight(card, measureContainer) {
  measureContainer.appendChild(card);
  const height = card.offsetHeight || FALLBACK_CARD_HEIGHT_PX;
  measureContainer.removeChild(card);
  return height;
}



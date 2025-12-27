// =============================================================================
// CARD CREATION - WEBINAR CARD
// =============================================================================

import { CARD_BASE_CLASSES } from '../config.js';
import { createLogoImage, createLinkBadge } from './shared.js';

/**
 * Creates a webinar/teaching card
 */
export function createWebinarCard(item) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const logoAlt = item.title ? `${item.title} logo` : 'Logo';
  
  card.appendChild(createLogoImage(item.logo, logoAlt, 'w-6 h-6'));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
  const dateMarkup = item.date ? `
    <div class="text-xs-6 text-gray-dark font-dm-sans text-right whitespace-nowrap">${item.date}</div>
  ` : '';
  
  contentDiv.innerHTML = `
    <div class="flex-1">
      <div class="flex justify-between items-start mb-1">
        <div class="flex-1">
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${item.title || ''}</div>
        </div>
        <div class="flex gap-2 items-center">
          ${createLinkBadge(item.link, true)}
          ${dateMarkup}
        </div>
      </div>
      <div class="pl-2 flex flex-col gap-0.5">
        <div class="flex gap-2 items-start w-full">
          <div class="flex-shrink-0 w-[60px]">
            <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Activities:</p>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs-7 text-ink font-dm-sans leading-tight">${item.activities || ''}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}



// =============================================================================
// CARD CREATION - WEBINAR CARD
// =============================================================================

import { CARD_BASE_CLASSES, CARD_INTERNAL_GAP, CARD_TEXT_GAP } from '../config.js';
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
    <span class="inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md bg-gray-100 text-gray-700">${item.date}</span>
  ` : '';
  
  contentDiv.innerHTML = `
    <div class="flex flex-col ${CARD_INTERNAL_GAP}">
      <div class="flex justify-between items-center">
        <div class="flex-1">
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${item.title || ''}</div>
        </div>
        <div class="flex gap-2 items-center">
          ${createLinkBadge(item.link)}
          ${dateMarkup}
        </div>
      </div>
      <div class="pl-1.5 flex flex-col ${CARD_TEXT_GAP}">
        <div class="flex gap-2 items-start w-full">
          <div class="flex-shrink-0 w-[60px]">
            <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Activities:</p>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs-7 text-ink font-dm-sans leading-normal">${item.activities || ''}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}


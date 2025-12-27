// =============================================================================
// CARD CREATION - TRANSFER CARDS (Research/Technology Transfer & Entrepreneurial)
// =============================================================================

import { CARD_BASE_CLASSES, CARD_INTERNAL_GAP, CARD_TEXT_GAP } from '../config.js';
import { formatSentence } from '../utils/text.js';
import { getTimeBadgeClasses } from '../utils/css-classes.js';
import { createLogoImage, createLinkBadge, createLocationMarkup } from './shared.js';

/**
 * Creates a transfer card (for research/tech transfer and entrepreneurial initiatives)
 */
export function createTransferCard(exp, { isCurrent }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const topicText = formatSentence(exp.topic);
  const logoAlt = exp.company ? `${exp.company} logo` : 'Company logo';
  const titleWidth = isCurrent ? 'w-[100px]' : 'w-[178px]';

  card.appendChild(createLogoImage(exp.logo, logoAlt));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  contentDiv.innerHTML = `
    <div class="flex flex-col ${CARD_INTERNAL_GAP}">
      <div class="flex justify-between items-start">
        <div class="${titleWidth}">
          <div class="text-xs-7 text-muted font-dm-sans mb-0.5 whitespace-nowrap">${exp.company}</div>
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${exp.position}</div>
        </div>
        <div class="flex flex-col gap-0.5 items-end">
          <div class="flex gap-2">
            ${createLinkBadge(exp.link)}
            <span class="${getTimeBadgeClasses(isCurrent)}">${exp.time_period}</span>
          </div>
          ${createLocationMarkup(exp.place)}
        </div>
      </div>
      <div class="pl-1.5 text-xs-7 text-ink font-dm-sans leading-normal flex flex-col ${CARD_TEXT_GAP}">
        ${topicText ? `<p class="mb-0">${topicText}</p>` : ''}
      </div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}


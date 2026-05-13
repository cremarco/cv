// =============================================================================
// CARD CREATION - SPEAKER ENGAGEMENT CARD
// =============================================================================

import { CARD_BASE_CLASSES, CARD_INTERNAL_GAP, CARD_TEXT_GAP } from '../config.js';
import { createLinkBadge, createLocationMarkup, createLogoImage } from './shared.js';

function createSpeakerVisual(item) {
  if (item.logo) {
    const alt = item.organizer ? `${item.organizer} logo` : 'Event logo';
    return createLogoImage(item.logo, alt, 'w-6 h-6');
  }

  const icon = document.createElement('div');
  icon.className = 'w-6 h-6 rounded bg-slate-200 flex items-center justify-center flex-shrink-0';
  icon.innerHTML = "<i class='bx bx-microphone text-[14px] text-slate-700'></i>";
  return icon;
}

function createDetailRow(label, value) {
  if (!value) return '';

  return `
    <div class="flex gap-2 items-start w-full">
      <div class="flex-shrink-0 w-[60px]">
        <p class="text-xs-7 text-slate-800 font-dm-sans font-bold leading-tight">${label}:</p>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs-7 text-slate-800 font-dm-sans leading-normal">${value}</p>
      </div>
    </div>
  `;
}

/**
 * Creates a speaker engagement card.
 */
export function createSpeakerCard(item) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;
  card.dataset.card = 'speaker';

  card.appendChild(createSpeakerVisual(item));

  const contentDiv = document.createElement('div');
  contentDiv.className = `flex-1 flex flex-col ${CARD_INTERNAL_GAP}`;

  const dateMarkup = item.date ? `
    <span class="inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md bg-gray-100 text-gray-700" data-time-period="${item.date}" data-time-kind="badge">${item.date}</span>
  ` : '';

  const organizerMarkup = item.organizer ? `
    <div class="text-xs-7 text-slate-500 font-dm-sans mb-0.5">${item.organizer}</div>
  ` : '';

  contentDiv.innerHTML = `
    <div class="flex justify-between items-start gap-3">
      <div class="flex-1 min-w-0">
        ${organizerMarkup}
        <div class="text-xs-8 text-slate-800 font-dm-sans font-medium leading-tight">${item.event || ''}</div>
      </div>
      <div class="flex flex-col gap-0.5 items-end shrink-0">
        <div class="flex gap-2 items-center">
          ${createLinkBadge(item.link)}
          ${dateMarkup}
        </div>
        ${createLocationMarkup(item.place)}
      </div>
    </div>
    <div class="pl-1.5 flex flex-col ${CARD_TEXT_GAP}">
      ${createDetailRow('Talk', item.talk_title)}
      ${createDetailRow('Session', item.session)}
      ${createDetailRow('Role', item.role)}
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}

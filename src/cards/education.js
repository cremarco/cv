// =============================================================================
// CARD CREATION - EDUCATION CARD
// =============================================================================

import { CARD_BASE_CLASSES } from '../config.js';
import { getTimeBadgeClasses } from '../utils/css-classes.js';
import { createLogoImage, createLinkBadge } from './shared.js';

/**
 * Creates an education card with degree details
 */
export function createEducationCard(edu) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const timeBadgeClasses = getTimeBadgeClasses(false);
  
  card.appendChild(createLogoImage(edu.logo, 'University logo'));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
  // Build degree text with optional honor
  let degreeText = edu.degree || '';
  if (edu.degree_honor) {
    degreeText += `, <span class="italic">${edu.degree_honor}</span>`;
  }
  
  // Build thesis markup
  const thesisMarkup = edu.thesis_title ? `
    <div class="flex gap-2 items-start w-full">
      <div class="flex-shrink-0 w-[60px]">
        <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Thesis Title:</p>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs-7 text-ink font-dm-sans leading-normal">${edu.thesis_title}</p>
      </div>
    </div>
  ` : '';
  
  // Build international experience markup
  const internationalMarkup = edu.international_experience ? `
    <div class="flex gap-2 items-start w-full">
      <div class="flex-shrink-0 w-[60px]">
        <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">International Experience:</p>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs-7 text-ink font-dm-sans leading-normal">${edu.international_experience}</p>
      </div>
    </div>
  ` : '';
  
  // Build courses list
  const coursesMarkup = (edu.courses?.length > 0) ? `
    <div class="flex gap-2 items-start w-full">
      <div class="flex-shrink-0 w-[60px]">
        <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Courses:</p>
      </div>
      <div class="flex-1 min-w-0">
        <ul class="list-disc">
          ${edu.courses.map(c => `<li class="mb-0 ml-2.5"><span class="text-xs-7 text-ink font-dm-sans leading-normal">${c}</span></li>`).join('')}
        </ul>
      </div>
    </div>
  ` : '';
  
  // Build summer schools list
  const summerSchoolsMarkup = (edu.summer_schools?.length > 0) ? `
    <div class="flex gap-2 items-start w-full">
      <div class="flex-shrink-0 w-[60px]">
        <p class="text-xs-7 text-ink font-dm-sans font-bold leading-tight">Summer Schools:</p>
      </div>
      <div class="flex-1 min-w-0">
        ${edu.summer_schools.map((s, i) => 
          `<p class="text-xs-7 text-ink font-dm-sans leading-normal ${i === edu.summer_schools.length - 1 ? '' : 'mb-0'}">${s}</p>`
        ).join('')}
      </div>
    </div>
  ` : '';

  contentDiv.innerHTML = `
    <div class="flex-1">
      <div class="flex justify-between items-start mb-1">
        <div class="w-[178px]">
          <div class="text-xs-8 text-ink font-dm-sans font-medium">${degreeText}</div>
        </div>
        <div class="flex flex-col gap-0.5 items-end">
          <div class="flex gap-2">
            ${createLinkBadge(edu.thesis_link)}
            <span class="${timeBadgeClasses}">${edu.time_period}</span>
          </div>
        </div>
      </div>
      <div class="pl-1.5 flex flex-col gap-0.5 items-start">
        ${thesisMarkup}
        ${internationalMarkup}
        ${coursesMarkup}
        ${summerSchoolsMarkup}
      </div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}



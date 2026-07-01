// =============================================================================
// CARD CREATION - EXPERIENCE CARDS (Academic & Foreign)
// =============================================================================

import { CARD_BASE_CLASSES, CARD_INTERNAL_GAP, CARD_TEXT_GAP } from '../config.js';
import { formatSentence, buildTopicText } from '../utils/text.js';
import { getTimeBadgeClasses } from '../utils/css-classes.js';
import { createLogoImage, createLinkBadge, createLocationMarkup } from './shared.js';

function isTimelineMarker(exp) {
  return exp?.type === 'timeline_marker';
}

function createTimelineMarker(label) {
  const marker = document.createElement('div');
  marker.className = 'flex items-center gap-2 px-4 py-1.5 break-inside-avoid-page';
  marker.dataset.card = 'timeline-marker';
  marker.dataset.preserveClasses = 'true';

  const leftLine = document.createElement('div');
  leftLine.className = 'h-px flex-1 bg-slate-200';

  const labelEl = document.createElement('div');
  labelEl.className = 'text-xs-7 text-slate-500 font-dm-sans font-medium';
  labelEl.textContent = label;

  const rightLine = document.createElement('div');
  rightLine.className = 'h-px flex-1 bg-slate-200';

  marker.append(leftLine, labelEl, rightLine);
  return marker;
}

/**
 * Creates an experience card (used for academic experiences and foreign contracts)
 */
export function createExperienceCard(exp, { isCurrent }) {
  if (isTimelineMarker(exp)) {
    return createTimelineMarker(exp.label || '');
  }

  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;
  card.dataset.card = 'experience';

  const topicText = formatSentence(buildTopicText(exp));
  const topicItText = exp.topic_it ? formatSentence(exp.topic_it) : '';
  const departmentText = exp.department ? formatSentence(exp.department) : '';
  const logoAlt = exp.university ? `${exp.university} logo` : 'University logo';
  const nameField = exp.university || exp.company || '';
  const titleWidth = isCurrent ? 'w-[100px]' : 'w-[178px]';

  card.appendChild(createLogoImage(exp.logo, logoAlt));

  const contentDiv = document.createElement('div');
  contentDiv.className = `flex-1 flex flex-col ${CARD_INTERNAL_GAP}`;
  contentDiv.innerHTML = `
    <div class="flex justify-between items-center">
      <div class="${titleWidth}">
        <div class="text-xs-7 text-slate-500 font-dm-sans mb-0.5 whitespace-nowrap">${nameField}</div>
        <div class="text-xs-8 text-slate-800 font-dm-sans font-medium whitespace-nowrap">${exp.position}</div>
      </div>
      <div class="flex flex-col gap-0.5 items-end">
        <div class="flex gap-2 items-center">
          ${createLinkBadge(exp.link)}
          <span class="${getTimeBadgeClasses(isCurrent)}" data-time-period="${exp.time_period}" data-time-kind="badge">${exp.time_period}</span>
        </div>
        ${createLocationMarkup(exp.place)}
      </div>
    </div>
    <div class="pl-1.5 text-xs-7 text-slate-800 font-dm-sans leading-normal flex flex-col ${CARD_TEXT_GAP}">
      ${topicText ? `<p class="mb-0">${topicText}</p>` : ''}
      ${topicItText ? `<p class="mb-0">${topicItText}</p>` : ''}
      ${departmentText ? `<p class="text-xs-6 text-slate-500 italic">${departmentText}</p>` : ''}
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}

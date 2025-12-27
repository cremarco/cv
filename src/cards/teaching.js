// =============================================================================
// CARD CREATION - TEACHING CARDS (PhD & General)
// =============================================================================

import { CARD_BASE_CLASSES, CARD_INTERNAL_GAP, CARD_TEXT_GAP } from '../config.js';
import { createLogoImage } from './shared.js';

/**
 * Renders a single course row for teaching cards
 */
function renderCourseRow(course, isPhd = true) {
  const roleBadge = course.role ? `
    <div class="inline-flex items-center justify-center px-0.5 py-0 h-2 bg-purple-100 text-purple-700 rounded text-[6px] font-dm-sans">
      ${course.role}
    </div>
  ` : '';
  
  const hasPresent = course.time_period?.toLowerCase().includes('present');
  const isActive = (!isPhd && course.time_period?.includes('current')) || hasPresent;
  const periodBadgeClasses = isActive
    ? 'inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md bg-purple-100 text-purple-700'
    : 'inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md bg-gray-100 text-gray-700';
  
  const hoursMarkup = course.hours ? `
    <div class="text-xs-6 text-muted font-dm-sans italic whitespace-nowrap">${course.hours}</div>
  ` : '';
  
  const periodBadge = course.time_period ? `<span class="${periodBadgeClasses}">${course.time_period}</span>` : '';
  
  return `
    <div class="flex items-center justify-between h-2.5 mb-0.5 last:mb-0">
      <div class="flex gap-2 items-end pl-2">
        <div class="text-xs-8 text-ink font-dm-sans font-medium whitespace-nowrap">${course.course_name}</div>
        ${hoursMarkup}
      </div>
      <div class="flex items-center justify-between w-[120px]">
        ${roleBadge}
        ${periodBadge}
      </div>
    </div>
  `;
}

/**
 * Extracts program type prefix and display name
 */
function parseProgramName(programName, isPhd = true) {
  const prefixes = isPhd 
    ? [{ match: 'PHD in ', type: 'PHD' }]
    : [
        { match: 'MD ', type: 'MD' },
        { match: 'BD ', type: 'BD' },
        { match: 'Postgraduate ', type: 'Postgraduate' },
      ];
  
  for (const prefix of prefixes) {
    if (programName.startsWith(prefix.match)) {
      return { type: prefix.type, name: programName.substring(prefix.match.length) };
    }
  }
  
  return isPhd ? { type: 'PHD', name: programName } : { type: '', name: programName };
}

/**
 * Creates a teaching card (for both PhD and general teaching)
 */
export function createTeachingCard(teaching, { isPhd = true }) {
  const card = document.createElement('div');
  card.className = CARD_BASE_CLASSES;

  const logoAlt = teaching.university ? `${teaching.university} logo` : 'University logo';
  
  card.appendChild(createLogoImage(teaching.logo, logoAlt));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  
  const universityMarkup = teaching.university ? `
    <div class="text-xs-7 text-muted font-dm-sans">${teaching.university}</div>
  ` : '';
  
  const programsMarkup = (teaching.programs?.length > 0) 
    ? teaching.programs.map(program => {
        const { type, name } = parseProgramName(program.program_name, isPhd);
        const coursesHtml = program.courses.map(c => renderCourseRow(c, isPhd)).join('');
        
        return `
          <div class="flex flex-col ${CARD_TEXT_GAP}">
            <div class="text-xs-7 text-ink font-dm-sans">
              <span class="font-bold">${type}</span> ${isPhd ? 'in ' : ''}${name}
            </div>
            <div class="flex flex-col ${CARD_TEXT_GAP}">${coursesHtml}</div>
          </div>
        `;
      }).join('')
    : '';
  
  contentDiv.innerHTML = `
    <div class="flex flex-col ${CARD_INTERNAL_GAP}">
      ${universityMarkup}
      <div class="flex flex-col ${CARD_INTERNAL_GAP}">${programsMarkup}</div>
    </div>
  `;
  card.appendChild(contentDiv);

  return card;
}


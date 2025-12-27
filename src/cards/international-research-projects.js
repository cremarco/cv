// =============================================================================
// CARD CREATION - INTERNATIONAL RESEARCH PROJECTS CARD
// =============================================================================

import { createLogoImage } from './shared.js';
import { createLinkBadge } from './shared.js';
import { CARD_BASE_CLASSES, CARD_INTERNAL_GAP, CARD_TEXT_GAP } from '../config.js';

/**
 * Creates a single international research project card
 */
function createInternationalResearchProjectCard(project, { isFirstInPage, isFirstInSection, isLast }) {
  // Override background color for first card
  const bgClass = isFirstInSection ? 'bg-accent-lightest' : 'bg-white';
  const borderClass = isLast
    ? (isFirstInSection ? 'border border-accent-soft' : 'border border-gray-200')
    : (isFirstInSection ? 'border border-accent-soft border-b-0' : 'border border-gray-200 border-t-0');
  const roundedClass = isFirstInSection ? 'rounded-t-md' : (isLast ? 'rounded-b-md' : '');
  
  const card = document.createElement('div');
  card.className = `${CARD_BASE_CLASSES} ${bgClass} ${borderClass} ${roundedClass} w-full`;
  card.dataset.card = 'international-research-projects';
  
  // Add COST icon
  card.appendChild(createLogoImage('cost.png', 'COST Action', 'w-5 h-5'));
  
  const contentDiv = document.createElement('div');
  contentDiv.className = `basis-0 flex flex-col ${CARD_INTERNAL_GAP} grow items-start min-h-px min-w-px relative shrink-0`;
  
  // Header row with name, title, link and period
  const headerRow = document.createElement('div');
  headerRow.className = 'flex items-center justify-between relative shrink-0 w-full';
  
  // Left side: name and title
  const leftDiv = document.createElement('div');
  leftDiv.className = 'basis-0 flex flex-col gap-0.5 grow items-start min-h-px min-w-[100px] relative shrink-0';
  
  const nameDiv = document.createElement('div');
  nameDiv.className = 'flex flex-col font-dm-sans font-normal justify-center min-w-full relative shrink-0 text-muted text-xs-7';
  const nameP = document.createElement('p');
  nameP.className = 'leading-tight mb-0';
  nameP.textContent = project.name;
  nameDiv.appendChild(nameP);
  leftDiv.appendChild(nameDiv);
  
  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex flex-col font-dm-sans font-medium justify-center relative shrink-0 text-ink text-xs-8';
  const titleP = document.createElement('p');
  titleP.className = 'leading-normal mb-0';
  titleP.textContent = project.title;
  titleDiv.appendChild(titleP);
  leftDiv.appendChild(titleDiv);
  
  headerRow.appendChild(leftDiv);
  
  // Right side: link and period badges
  const rightDiv = document.createElement('div');
  rightDiv.className = 'flex flex-col gap-0.5 items-end min-w-[186px] pl-10 pr-0 py-0 relative shrink-0';
  
  const badgesRow = document.createElement('div');
  badgesRow.className = 'flex gap-2 items-center justify-end relative shrink-0';
  
  // Link badge
  if (project.link) {
    const linkBadgeDiv = document.createElement('div');
    linkBadgeDiv.className = 'h-2.5 relative shrink-0 w-4';
    linkBadgeDiv.insertAdjacentHTML('beforeend', createLinkBadge(project.link));
    badgesRow.appendChild(linkBadgeDiv.firstElementChild);
  }
  
  // Period badge
  if (project.period) {
    const periodBadge = document.createElement('span');
    if (isFirstInSection) {
      periodBadge.className = 'inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md bg-purple-100 text-purple-700';
    } else {
      periodBadge.className = 'inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md bg-gray-100 text-gray-700';
    }
    periodBadge.textContent = project.period;
    periodBadge.dataset.timePeriod = project.period;
    periodBadge.dataset.timeKind = 'badge';
    badgesRow.appendChild(periodBadge);
  }
  
  rightDiv.appendChild(badgesRow);
  headerRow.appendChild(rightDiv);
  
  contentDiv.appendChild(headerRow);
  
  // Description and role text box
  const textBox = document.createElement('div');
  textBox.className = `flex flex-col font-dm-sans font-normal ${CARD_TEXT_GAP} items-start pl-1.5 pr-0 py-0 relative shrink-0 text-ink w-full`;
  
  // Description
  if (project.description) {
    const descDiv = document.createElement('div');
    descDiv.className = 'flex flex-col justify-center relative shrink-0 text-xs-7 w-full';
    const descP = document.createElement('p');
    descP.className = 'leading-normal mb-0';
    
    // Split description to handle bold "COST Action"
    const parts = project.description.split('COST Action');
    if (parts.length > 1) {
      descP.appendChild(document.createTextNode(parts[0]));
      const boldSpan = document.createElement('span');
      boldSpan.className = 'font-dm-sans font-bold';
      boldSpan.textContent = 'COST Action';
      descP.appendChild(boldSpan);
      descP.appendChild(document.createTextNode(parts[1]));
    } else {
      descP.textContent = project.description;
    }
    
    descDiv.appendChild(descP);
    textBox.appendChild(descDiv);
  }
  
  // Role (in bold)
  if (project.role) {
    const roleDiv = document.createElement('div');
    roleDiv.className = 'flex flex-col justify-center relative shrink-0 w-full';
    const roleP = document.createElement('p');
    roleP.className = 'font-dm-sans font-bold leading-normal text-xs-7 mb-0';
    // Handle line breaks in role and add star icon for Science Communication Coordinator
    let roleHTML = project.role.replace(/\n/g, '<br>');
    // Add yellow star icon after "Science Communication Coordinator."
    roleHTML = roleHTML.replace(
      /Science Communication Coordinator\./g,
      'Science Communication Coordinator. <i class=\'bx bx-star text-[8px] text-award-gold inline-block align-middle\'></i>'
    );
    roleP.innerHTML = roleHTML;
    roleDiv.appendChild(roleP);
    textBox.appendChild(roleDiv);
  }
  
  contentDiv.appendChild(textBox);
  card.appendChild(contentDiv);
  
  return card;
}

/**
 * Creates the international research projects section container
 * @param {Array} projects - Array of projects (or single item array for page break rendering)
 * @param {Object} options - Optional parameters for page break rendering
 * @param {boolean} options.isFirstInSection - Whether this is the first card in the section (for single item)
 * @param {boolean} options.isLast - Whether this is the last card in the section (for single item)
 */
export function createInternationalResearchProjectsCard(projects, options = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = `flex flex-col ${CARD_INTERNAL_GAP} items-start justify-center relative shrink-0 w-full`;
  
  if (!projects?.length) return wrapper;
  
  // If single item array (for page break rendering), use provided options or default to true
  const isSingleItem = projects.length === 1;
  
  projects.forEach((project, index) => {
    const isFirstInSection = isSingleItem && options.isFirstInSection !== undefined 
      ? options.isFirstInSection 
      : index === 0;
    const isLast = isSingleItem && options.isLast !== undefined 
      ? options.isLast 
      : index === projects.length - 1;
    const card = createInternationalResearchProjectCard(project, {
      isFirstInPage: isFirstInSection,
      isFirstInSection,
      isLast
    });
    wrapper.appendChild(card);
  });
  
  return wrapper;
}

// =============================================================================
// CARD CREATION - ITALIAN RESEARCH PROJECTS CARD
// =============================================================================

import { createLogoImage } from './shared.js';
import { createLinkBadge } from './shared.js';
import { CARD_INTERNAL_GAP, CARD_TEXT_GAP } from '../config.js';
import { getCardClasses } from '../utils/css-classes.js';

/**
 * Creates a single Italian research project card
 */
function createItalianResearchProjectCard(project, { isFirstInPage, isFirstInSection, isLast }) {
  // Use getCardClasses for consistent styling (isCurrent is false for italian research projects)
  const cardClasses = getCardClasses({ 
    isFirstInPage, 
    isFirstInSection, 
    isLast,
    isCurrent: false 
  });
  
  const card = document.createElement('div');
  card.className = `${cardClasses} w-full`;
  card.dataset.card = 'italian-research-projects';
  
  // Add project icon
  if (project.logo) {
    card.appendChild(createLogoImage(project.logo, project.name, 'w-5 h-5'));
  }
  
  const contentDiv = document.createElement('div');
  contentDiv.className = `basis-0 flex flex-col ${CARD_INTERNAL_GAP} grow items-start min-h-px min-w-px relative shrink-0`;
  
  // Header row with institution, name, link and period
  const headerRow = document.createElement('div');
  headerRow.className = 'flex items-center justify-between relative shrink-0 w-full';
  
  // Left side: institution and name
  const leftDiv = document.createElement('div');
  leftDiv.className = 'flex flex-col gap-0.5 items-start min-w-[100px] relative shrink-0';
  
  if (project.institution) {
    const institutionDiv = document.createElement('div');
    institutionDiv.className = 'flex flex-col font-dm-sans font-normal justify-center min-w-full relative shrink-0 text-slate-500 text-xs-7';
    const institutionP = document.createElement('p');
    institutionP.className = 'leading-tight mb-0';
    institutionP.textContent = project.institution;
    institutionDiv.appendChild(institutionP);
    leftDiv.appendChild(institutionDiv);
  }
  
  const nameDiv = document.createElement('div');
  nameDiv.className = 'flex flex-col font-dm-sans font-medium justify-center min-w-full relative shrink-0 text-slate-800 text-xs-8';
  const nameP = document.createElement('p');
  nameP.className = 'leading-normal mb-0';
  nameP.textContent = project.name;
  nameDiv.appendChild(nameP);
  leftDiv.appendChild(nameDiv);
  
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
    if (linkBadgeDiv.firstElementChild) {
      badgesRow.appendChild(linkBadgeDiv.firstElementChild);
    }
  } else {
    // Empty spacer when no link
    const spacer = document.createElement('div');
    spacer.className = 'h-2.5 shrink-0 w-4';
    badgesRow.appendChild(spacer);
  }
  
  // Period badge
  if (project.period) {
    const periodBadge = document.createElement('span');
    periodBadge.className = 'inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md bg-gray-100 text-gray-700';
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
  textBox.className = `flex flex-col font-dm-sans font-normal ${CARD_TEXT_GAP} items-start pl-1.5 pr-0 py-0 relative shrink-0 text-slate-800 w-full`;
  
  // Description
  if (project.description) {
    const descDiv = document.createElement('div');
    descDiv.className = 'flex flex-col justify-center relative shrink-0 text-xs-7 w-full';
    const descP = document.createElement('p');
    descP.className = 'leading-normal mb-0 text-slate-800';
    descP.textContent = project.description;
    descDiv.appendChild(descP);
    textBox.appendChild(descDiv);
  }
  
  // Role (in bold)
  if (project.role) {
    const roleDiv = document.createElement('div');
    roleDiv.className = 'flex flex-col justify-center relative shrink-0 w-full';
    const roleP = document.createElement('p');
    roleP.className = 'font-dm-sans font-bold leading-normal text-xs-7 mb-0 text-slate-800';
    roleP.textContent = project.role;
    roleDiv.appendChild(roleP);
    textBox.appendChild(roleDiv);
  }
  
  contentDiv.appendChild(textBox);
  card.appendChild(contentDiv);
  
  return card;
}

/**
 * Creates the Italian research projects section container
 * @param {Array} projects - Array of projects (or single item array for page break rendering)
 * @param {Object} options - Optional parameters for page break rendering
 * @param {boolean} options.isFirstInSection - Whether this is the first card in the section (for single item)
 * @param {boolean} options.isLast - Whether this is the last card in the section (for single item)
 */
export function createItalianResearchProjectsCard(projects, options = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = `flex flex-col ${CARD_INTERNAL_GAP} items-start justify-center relative shrink-0 w-full`;
  
  if (!projects?.length) return wrapper;
  
  // If single item array (for page break rendering), use provided options or default to true
  const isSingleItem = projects.length === 1;
  
  projects.forEach((project, index) => {
    const isFirstInPage = isSingleItem && options.isFirstInPage !== undefined 
      ? options.isFirstInPage 
      : index === 0;
    const isFirstInSection = isSingleItem && options.isFirstInSection !== undefined 
      ? options.isFirstInSection 
      : index === 0;
    const isLast = isSingleItem && options.isLast !== undefined 
      ? options.isLast 
      : index === projects.length - 1;
    const card = createItalianResearchProjectCard(project, {
      isFirstInPage,
      isFirstInSection,
      isLast
    });
    wrapper.appendChild(card);
  });
  
  return wrapper;
}

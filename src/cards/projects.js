// =============================================================================
// CARD CREATION - PROJECTS CARD
// =============================================================================

import { createLogoImage } from './shared.js';
import { createLinkBadge } from './shared.js';
import { CARD_BASE_CLASSES, CARD_INTERNAL_GAP, CARD_TEXT_GAP } from '../config.js';

/**
 * Creates a single project card
 */
function createProjectCard(project, { isFirstInPage, isFirstInSection, isLast }) {
  const bgClass = 'bg-white';
  const borderClass = isLast
    ? 'border border-gray-200'
    : 'border border-gray-200 border-b-0';
  const roundedClass = isFirstInSection ? 'rounded-t-md' : (isLast ? 'rounded-b-md' : '');
  
  const card = document.createElement('div');
  card.className = `${CARD_BASE_CLASSES} ${bgClass} ${borderClass} ${roundedClass} w-full`;
  
  // Add project icon
  if (project.logo) {
    card.appendChild(createLogoImage(project.logo, project.name, 'w-5 h-5'));
  }
  
  const contentDiv = document.createElement('div');
  contentDiv.className = `basis-0 flex flex-col ${CARD_INTERNAL_GAP} grow items-start min-h-px min-w-px relative shrink-0`;
  
  // Header row with name, funding agency, link and period
  const headerRow = document.createElement('div');
  headerRow.className = 'flex items-start justify-between relative shrink-0 w-full';
  
  // Left side: project name
  const leftDiv = document.createElement('div');
  leftDiv.className = 'flex flex-col gap-0.5 items-start relative shrink-0 w-[178px]';
  
  const nameDiv = document.createElement('div');
  nameDiv.className = 'flex flex-col font-dm-sans font-medium justify-center leading-[0] relative shrink-0 text-ink text-xs-8 w-full';
  const nameP = document.createElement('p');
  nameP.className = 'leading-normal mb-0';
  nameP.textContent = project.name;
  nameDiv.appendChild(nameP);
  leftDiv.appendChild(nameDiv);
  
  headerRow.appendChild(leftDiv);
  
  // Right side: funding agency, link and period badges
  const rightDiv = document.createElement('div');
  rightDiv.className = 'flex flex-col gap-0.5 items-end relative shrink-0';
  
  const badgesRow = document.createElement('div');
  badgesRow.className = 'flex gap-2 items-start relative shrink-0';
  
  // Funding agency badge
  if (project.funding_agency) {
    const fundingBadge = document.createElement('div');
    fundingBadge.className = 'bg-gray-lighter flex font-dm-sans font-normal gap-0.5 h-2.5 items-center leading-[8px] px-0.5 py-0 relative rounded-sm shrink-0 text-gray-darkest text-xs-6 text-center whitespace-nowrap';
    const fundingP = document.createElement('p');
    fundingP.className = 'leading-[8px] relative shrink-0';
    const fundingLabel = document.createElement('span');
    fundingLabel.className = 'font-dm-sans font-bold';
    fundingLabel.textContent = project.funding_type || 'Funding Agency';
    fundingP.appendChild(fundingLabel);
    fundingP.appendChild(document.createTextNode(': '));
    const fundingAgency = document.createElement('span');
    fundingAgency.textContent = project.funding_agency;
    fundingP.appendChild(fundingAgency);
    fundingBadge.appendChild(fundingP);
    badgesRow.appendChild(fundingBadge);
  }
  
  // Link badge
  if (project.link) {
    const linkBadgeDiv = document.createElement('div');
    linkBadgeDiv.className = 'h-2.5 relative shrink-0 w-4';
    linkBadgeDiv.insertAdjacentHTML('beforeend', createLinkBadge(project.link));
    if (linkBadgeDiv.firstElementChild) {
      badgesRow.appendChild(linkBadgeDiv.firstElementChild);
    }
  }
  
  // Period badge
  if (project.period) {
    const periodBadge = document.createElement('span');
    periodBadge.className = 'inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md bg-gray-100 text-gray-700';
    periodBadge.textContent = project.period;
    badgesRow.appendChild(periodBadge);
  }
  
  rightDiv.appendChild(badgesRow);
  headerRow.appendChild(rightDiv);
  
  contentDiv.appendChild(headerRow);
  
  // Title in italic
  if (project.title) {
    const titleDiv = document.createElement('div');
    titleDiv.className = 'flex flex-col font-dm-sans font-normal italic h-2.5 justify-center leading-[0] relative shrink-0 text-ink text-xs-6 w-full';
    const titleP = document.createElement('p');
    titleP.className = 'leading-[8px] mb-0';
    titleP.textContent = project.title;
    titleDiv.appendChild(titleP);
    contentDiv.appendChild(titleDiv);
  }
  
  // Description and activities text box
  const textBox = document.createElement('div');
  textBox.className = `flex flex-col ${CARD_TEXT_GAP} items-start pl-1.5 pr-0 py-0 relative shrink-0 text-ink w-full`;
  
  // Description
  if (project.description) {
    const descDiv = document.createElement('div');
    descDiv.className = 'flex flex-col font-dm-sans font-normal justify-center leading-[0] relative shrink-0 text-xs-7 w-full';
    const descP = document.createElement('p');
    descP.className = 'leading-normal mb-0';
    descP.textContent = project.description;
    descDiv.appendChild(descP);
    textBox.appendChild(descDiv);
  }
  
  // Activities section
  if (project.activities) {
    const activitiesDiv = document.createElement('div');
    activitiesDiv.className = `flex flex-col ${CARD_TEXT_GAP} items-start relative shrink-0 w-full`;
    const activitiesRow = document.createElement('div');
    activitiesRow.className = 'flex font-dm-sans font-medium items-start leading-[0] relative shrink-0 text-ink w-full';
    
    const activitiesLabel = document.createElement('div');
    activitiesLabel.className = 'flex flex-col justify-center relative shrink-0 text-xs-7 w-[60px]';
    const labelP = document.createElement('p');
    labelP.className = 'font-dm-sans font-bold leading-[9px] mb-0';
    labelP.textContent = 'Activities';
    activitiesLabel.appendChild(labelP);
    activitiesRow.appendChild(activitiesLabel);
    
    const activitiesContent = document.createElement('div');
    activitiesContent.className = 'basis-0 flex flex-col grow justify-center min-h-px min-w-px relative shrink-0 text-xs-7';
    const contentP = document.createElement('p');
    contentP.className = 'leading-normal mb-0';
    contentP.textContent = project.activities;
    activitiesContent.appendChild(contentP);
    activitiesRow.appendChild(activitiesContent);
    
    activitiesDiv.appendChild(activitiesRow);
    textBox.appendChild(activitiesDiv);
  }
  
  contentDiv.appendChild(textBox);
  card.appendChild(contentDiv);
  
  return card;
}

/**
 * Creates the projects section container
 * Can handle both array of projects (for single render) or single project (for page break rendering)
 * @param {Array} projects - Array of projects (or single item array for page break rendering)
 * @param {Object} options - Optional parameters for page break rendering
 * @param {boolean} options.isFirstInSection - Whether this is the first card in the section (for single item)
 * @param {boolean} options.isLast - Whether this is the last card in the section (for single item)
 */
export function createProjectsCard(projects, options = {}) {
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
    const card = createProjectCard(project, {
      isFirstInPage: isFirstInSection,
      isFirstInSection,
      isLast
    });
    wrapper.appendChild(card);
  });
  
  return wrapper;
}

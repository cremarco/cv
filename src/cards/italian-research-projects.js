// =============================================================================
// CARD CREATION - ITALIAN RESEARCH PROJECTS CARD
// =============================================================================

import { createLogoImage } from './shared.js';
import { createLinkBadge } from './shared.js';
import { CARD_BASE_CLASSES, CARD_INTERNAL_GAP, CARD_TEXT_GAP } from '../config.js';

/**
 * Creates a single Italian research project card
 */
function createItalianResearchProjectCard(project, { isFirstInPage, isFirstInSection, isLast }) {
  // Override background color - all cards have accent-lightest background
  const bgClass = 'bg-accent-lightest';
  const borderClass = isLast
    ? 'border border-accent-soft'
    : 'border border-accent-soft border-b-0';
  const roundedClass = isFirstInSection ? 'rounded-t-md' : (isLast ? 'rounded-b-md' : '');
  
  const card = document.createElement('div');
  card.className = `${CARD_BASE_CLASSES} ${bgClass} ${borderClass} ${roundedClass} w-full`;
  
  // Add project icon
  if (project.logo) {
    card.appendChild(createLogoImage(project.logo, project.name, 'w-5 h-5'));
  }
  
  const contentDiv = document.createElement('div');
  contentDiv.className = `basis-0 flex flex-col ${CARD_INTERNAL_GAP} grow items-start min-h-px min-w-px relative shrink-0`;
  
  // Header row with institution, name, link and period
  const headerRow = document.createElement('div');
  headerRow.className = 'flex items-start justify-between relative shrink-0 w-full';
  
  // Left side: institution and name
  const leftDiv = document.createElement('div');
  leftDiv.className = 'flex flex-col gap-0.5 items-start leading-[0] min-w-[100px] relative shrink-0';
  
  if (project.institution) {
    const institutionDiv = document.createElement('div');
    institutionDiv.className = 'flex flex-col font-dm-sans font-normal justify-center min-w-full relative shrink-0 text-muted text-xs-7';
    const institutionP = document.createElement('p');
    institutionP.className = 'leading-[9px] mb-0';
    institutionP.textContent = project.institution;
    institutionDiv.appendChild(institutionP);
    leftDiv.appendChild(institutionDiv);
  }
  
  const nameDiv = document.createElement('div');
  nameDiv.className = 'flex flex-col font-dm-sans font-medium justify-center min-w-full relative shrink-0 text-ink text-xs-8';
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
  badgesRow.className = 'flex gap-2 items-start justify-end relative shrink-0';
  
  // Link badge
  if (project.link) {
    const linkBadgeDiv = document.createElement('div');
    linkBadgeDiv.className = 'h-2.5 relative shrink-0 w-4';
    linkBadgeDiv.insertAdjacentHTML('beforeend', createLinkBadge(project.link, true));
    if (linkBadgeDiv.firstElementChild) {
      badgesRow.appendChild(linkBadgeDiv.firstElementChild);
    }
  } else {
    // Empty spacer when no link
    const spacer = document.createElement('div');
    spacer.className = 'h-2.5 shrink-0 w-4';
    badgesRow.appendChild(spacer);
  }
  
  // Period badge (always with purple background for Italian projects)
  if (project.period) {
    const periodBadge = document.createElement('div');
    periodBadge.className = 'bg-accent-soft flex flex-col h-2.5 items-center justify-center px-0.5 py-0 relative rounded-sm shrink-0';
    const periodP = document.createElement('p');
    periodP.className = 'font-dm-sans font-normal leading-[8px] relative shrink-0 text-accent text-xs-6 whitespace-nowrap text-right';
    periodP.textContent = project.period;
    periodBadge.appendChild(periodP);
    badgesRow.appendChild(periodBadge);
  }
  
  rightDiv.appendChild(badgesRow);
  headerRow.appendChild(rightDiv);
  
  contentDiv.appendChild(headerRow);
  
  // Description and role text box
  const textBox = document.createElement('div');
  textBox.className = `flex flex-col font-dm-sans font-normal ${CARD_TEXT_GAP} items-start leading-[0] pl-1.5 pr-0 py-0 relative shrink-0 text-ink w-full`;
  
  // Description
  if (project.description) {
    const descDiv = document.createElement('div');
    descDiv.className = 'flex flex-col justify-center relative shrink-0 text-xs-7 w-full';
    const descP = document.createElement('p');
    descP.className = 'leading-normal mb-0';
    descP.textContent = project.description;
    descDiv.appendChild(descP);
    textBox.appendChild(descDiv);
  }
  
  // Role (in bold)
  if (project.role) {
    const roleDiv = document.createElement('div');
    roleDiv.className = 'flex flex-col justify-center relative shrink-0 w-full';
    const roleP = document.createElement('p');
    roleP.className = 'font-dm-sans font-bold leading-normal text-xs-7 mb-0';
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
 */
export function createItalianResearchProjectsCard(projects) {
  const wrapper = document.createElement('div');
  wrapper.className = `flex flex-col ${CARD_INTERNAL_GAP} items-start justify-center relative shrink-0 w-full`;
  
  if (!projects?.length) return wrapper;
  
  // If single item array (for page break rendering), treat it as first and last
  const isSingleItem = projects.length === 1;
  
  projects.forEach((project, index) => {
    const isFirstInSection = index === 0;
    const isLast = index === projects.length - 1;
    const card = createItalianResearchProjectCard(project, {
      isFirstInPage: isFirstInSection,
      isFirstInSection,
      isLast: isSingleItem ? true : isLast
    });
    wrapper.appendChild(card);
  });
  
  return wrapper;
}

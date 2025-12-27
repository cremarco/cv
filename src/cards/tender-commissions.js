// =============================================================================
// CARD CREATION - TENDER COMMISSIONS CARD
// =============================================================================

import { createLinkBadge } from './shared.js';
import { CARD_INTERNAL_GAP, CARD_PADDING_CLASSES, CARD_SURFACE_CLASSES } from '../config.js';

/**
 * Creates a single tender commission item card
 */
function createTenderCommissionItemCard(item) {
  const card = document.createElement('div');
  card.className = 'flex items-start relative rounded-tl-[4px] rounded-tr-[4px] shrink-0 w-full';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'basis-0 flex flex-col grow items-start min-h-px min-w-px relative shrink-0';
  
  const innerDiv = document.createElement('div');
  innerDiv.className = 'flex items-start justify-between relative shrink-0 w-full';
  
  // Build title
  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex flex-col font-dm-sans font-medium justify-center relative shrink-0 text-ink text-xs-8 min-w-0 flex-1';
  
  const titleP = document.createElement('p');
  titleP.className = 'font-dm-sans font-normal leading-normal mb-0';
  
  if (item.note) {
    // Split title and note
    const titleText = document.createTextNode(`${item.title} - `);
    const noteSpan = document.createElement('span');
    noteSpan.className = 'font-dm-sans font-bold';
    noteSpan.textContent = item.note;
    
    titleP.appendChild(titleText);
    titleP.appendChild(noteSpan);
  } else {
    titleP.textContent = item.title;
  }
  
  titleDiv.appendChild(titleP);
  innerDiv.appendChild(titleDiv);
  
  // Build badges (link and year)
  if (item.link || item.year) {
    const badgesDiv = document.createElement('div');
    badgesDiv.className = 'flex gap-2 items-start relative shrink-0';
    
    if (item.link) {
      const linkBadgeDiv = document.createElement('div');
      linkBadgeDiv.className = 'h-2.5 relative shrink-0 w-4';
      linkBadgeDiv.insertAdjacentHTML('beforeend', createLinkBadge(item.link));
      if (linkBadgeDiv.firstElementChild) {
        badgesDiv.appendChild(linkBadgeDiv.firstElementChild);
      }
    }
    
    if (item.year) {
      const yearBadge = document.createElement('span');
      yearBadge.className = 'inline-flex items-center px-1 py-0.5 text-[7px] font-medium rounded-md bg-gray-100 text-gray-700';
      yearBadge.textContent = item.year;
      badgesDiv.appendChild(yearBadge);
    }
    
    innerDiv.appendChild(badgesDiv);
  }
  
  contentDiv.appendChild(innerDiv);
  card.appendChild(contentDiv);
  return card;
}

/**
 * Creates the tender commissions section container
 */
export function createTenderCommissionsCard(data) {
  const wrapper = document.createElement('div');
  wrapper.className = `${CARD_SURFACE_CLASSES} ${CARD_PADDING_CLASSES} flex flex-col items-start justify-center relative rounded-md shrink-0 w-full`;
  
  const innerWrapper = document.createElement('div');
  innerWrapper.className = 'flex items-start relative shrink-0 w-full';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = `basis-0 flex flex-col ${CARD_INTERNAL_GAP} grow items-start min-h-px min-w-px relative shrink-0`;
  
  // Add organization label
  if (data.organization) {
    const orgLabel = document.createElement('div');
    orgLabel.className = 'flex items-start relative shrink-0 w-full';
    const text = document.createElement('div');
    text.className = 'flex flex-col font-dm-sans font-normal justify-center relative shrink-0 text-muted text-xs-7';
    const p = document.createElement('p');
    p.className = 'leading-normal mb-0';
    p.textContent = data.organization;
    text.appendChild(p);
    orgLabel.appendChild(text);
    contentDiv.appendChild(orgLabel);
  }
  
  // Add items
  if (data.items && data.items.length > 0) {
    data.items.forEach((item) => {
      const card = createTenderCommissionItemCard(item);
      contentDiv.appendChild(card);
    });
  }
  
  innerWrapper.appendChild(contentDiv);
  wrapper.appendChild(innerWrapper);
  
  return wrapper;
}

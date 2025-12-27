// =============================================================================
// CARD CREATION - COMMUNITY SERVICE CARD
// =============================================================================

import { createLinkBadge } from './shared.js';

/**
 * Creates a single community service item card
 */
function createCommunityServiceItemCard(item) {
  const card = document.createElement('div');
  card.className = 'flex items-start relative rounded-tl-[4px] rounded-tr-[4px] shrink-0 w-full';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'basis-0 flex flex-col grow items-start min-h-px min-w-px relative shrink-0';
  
  const innerDiv = document.createElement('div');
  innerDiv.className = 'flex items-start justify-between relative shrink-0 w-full';
  
  // Build title and description
  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex flex-col font-dm-sans font-medium justify-center relative shrink-0 text-ink text-xs-8 min-w-0 flex-1';
  
  if (item.description) {
    const titleP = document.createElement('p');
    titleP.className = 'font-dm-sans font-normal leading-normal mb-0';
    titleP.textContent = item.title;
    titleDiv.appendChild(titleP);
    
    const descP = document.createElement('p');
    descP.className = 'leading-normal mb-0';
    const descSpan1 = document.createElement('span');
    descSpan1.className = 'font-dm-sans font-normal';
    descSpan1.textContent = `    (${item.description}`;
    const descSpan2 = document.createElement('span');
    descSpan2.className = 'font-dm-sans font-normal';
    descSpan2.textContent = ')';
    descP.appendChild(descSpan1);
    descP.appendChild(descSpan2);
    titleDiv.appendChild(descP);
  } else {
    const titleP = document.createElement('p');
    titleP.className = 'font-dm-sans font-normal leading-normal mb-0';
    titleP.textContent = item.title;
    titleDiv.appendChild(titleP);
  }
  
  innerDiv.appendChild(titleDiv);
  
  // Build badges (link and year)
  if (item.link || item.year) {
    const badgesDiv = document.createElement('div');
    badgesDiv.className = 'flex gap-2 items-start relative shrink-0';
    
    if (item.link) {
      badgesDiv.insertAdjacentHTML('beforeend', createLinkBadge(item.link, true));
    }
    
    if (item.year) {
      const yearBadge = document.createElement('div');
      yearBadge.className = 'flex flex-col h-2.5 items-center justify-center px-0.5 py-0 relative rounded-sm shrink-0 w-5';
      const yearP = document.createElement('p');
      yearP.className = 'font-dm-sans font-normal leading-[8px] relative shrink-0 text-gray-dark text-xs-6 whitespace-nowrap';
      yearP.textContent = item.year;
      yearBadge.appendChild(yearP);
      badgesDiv.appendChild(yearBadge);
    }
    
    innerDiv.appendChild(badgesDiv);
  }
  
  contentDiv.appendChild(innerDiv);
  card.appendChild(contentDiv);
  return card;
}

/**
 * Creates a category label (Chair, Organizer, etc.)
 */
function createCategoryLabel(label) {
  const labelDiv = document.createElement('div');
  labelDiv.className = 'flex items-start relative shrink-0 w-full';
  const text = document.createElement('div');
  text.className = 'flex flex-col font-dm-sans font-normal justify-center relative shrink-0 text-muted text-xs-7';
  const p = document.createElement('p');
  p.className = 'leading-normal mb-0';
  p.textContent = label;
  text.appendChild(p);
  labelDiv.appendChild(text);
  return labelDiv;
}

/**
 * Creates the community service section container
 */
export function createCommunityServiceCard(data) {
  const wrapper = document.createElement('div');
  wrapper.className = 'bg-white flex flex-col items-start justify-center p-2 relative rounded-md shrink-0 w-full';
  
  const innerWrapper = document.createElement('div');
  innerWrapper.className = 'flex items-start relative shrink-0 w-full';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'basis-0 flex flex-col gap-1 grow items-start min-h-px min-w-px relative shrink-0';
  
  // Add Chair section
  if (data.chair && data.chair.length > 0) {
    contentDiv.appendChild(createCategoryLabel('Chair'));
    
    data.chair.forEach((item) => {
      const card = createCommunityServiceItemCard(item);
      contentDiv.appendChild(card);
    });
  }
  
  // Add Organiser section
  if (data.organiser && data.organiser.length > 0) {
    contentDiv.appendChild(createCategoryLabel('Organiser'));
    
    data.organiser.forEach((item) => {
      const card = createCommunityServiceItemCard(item);
      contentDiv.appendChild(card);
    });
  }
  
  innerWrapper.appendChild(contentDiv);
  wrapper.appendChild(innerWrapper);
  
  return wrapper;
}


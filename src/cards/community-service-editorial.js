// =============================================================================
// CARD CREATION - EDITORIAL COMMUNITY SERVICE CARD
// =============================================================================

import { CARD_INTERNAL_GAP, CARD_PADDING_CLASSES, CARD_SURFACE_CLASSES } from '../config.js';

/**
 * Creates a single editorial community service item card
 */
function createEditorialCommunityServiceItemCard(item) {
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
  
  // If item has items array (Member of Committee with multiple links)
  if (item.items && Array.isArray(item.items)) {
    const fragment = document.createDocumentFragment();
    item.items.forEach((linkItem, index) => {
      if (index > 0) {
        const comma = document.createTextNode(', ');
        fragment.appendChild(comma);
      }
      const link = document.createElement('a');
      link.href = linkItem.link;
      link.target = '_blank';
      link.className = 'underline cursor-pointer';
      link.textContent = linkItem.name;
      fragment.appendChild(link);
    });
    if (item.more) {
      const moreText = document.createTextNode(', ...  ');
      fragment.appendChild(moreText);
    }
    titleP.appendChild(fragment);
  } else {
    // Simple title
    titleP.textContent = item.title || '';
  }
  
  titleDiv.appendChild(titleP);
  innerDiv.appendChild(titleDiv);
  
  // Build badges (year if present)
  if (item.year) {
    const badgesDiv = document.createElement('div');
    badgesDiv.className = 'flex gap-2 items-start relative shrink-0';
    
    const yearBadge = document.createElement('div');
    yearBadge.className = 'flex flex-col h-2.5 items-center justify-center px-0.5 py-0 relative rounded-sm shrink-0 w-5';
    const yearP = document.createElement('p');
    yearP.className = 'font-dm-sans font-normal leading-[8px] relative shrink-0 text-gray-dark text-xs-6 whitespace-nowrap';
    yearP.textContent = item.year;
    yearBadge.appendChild(yearP);
    badgesDiv.appendChild(yearBadge);
    
    innerDiv.appendChild(badgesDiv);
  } else {
    // Empty space for alignment when no year
    const badgesDiv = document.createElement('div');
    badgesDiv.className = 'flex gap-2 items-start relative shrink-0';
    const spacer = document.createElement('div');
    spacer.className = 'h-2.5 shrink-0 w-[15px]';
    badgesDiv.appendChild(spacer);
    const emptyBadge = document.createElement('div');
    emptyBadge.className = 'flex flex-col h-2.5 items-center justify-center px-0.5 py-0 relative rounded-sm shrink-0 w-5';
    const emptyP = document.createElement('p');
    emptyP.className = 'font-dm-sans font-normal leading-[8px] relative shrink-0 text-gray-dark text-xs-6 whitespace-nowrap';
    emptyP.innerHTML = '&nbsp;';
    emptyBadge.appendChild(emptyP);
    badgesDiv.appendChild(emptyBadge);
    innerDiv.appendChild(badgesDiv);
  }
  
  contentDiv.appendChild(innerDiv);
  card.appendChild(contentDiv);
  return card;
}

/**
 * Creates a category label (Associate Editor, Member of Committee, Reviewer, etc.)
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
 * Creates the editorial community service section container
 */
export function createEditorialCommunityServiceCard(data) {
  const wrapper = document.createElement('div');
  wrapper.className = `${CARD_SURFACE_CLASSES} ${CARD_PADDING_CLASSES} flex flex-col items-start justify-center relative rounded-md shrink-0 w-full`;
  
  const innerWrapper = document.createElement('div');
  innerWrapper.className = 'flex items-start relative shrink-0 w-full';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = `basis-0 flex flex-col ${CARD_INTERNAL_GAP} grow items-start min-h-px min-w-px relative shrink-0`;
  
  // Add Associate Editor section
  if (data.associate_editor && data.associate_editor.length > 0) {
    contentDiv.appendChild(createCategoryLabel('Associate Editor'));
    
    data.associate_editor.forEach((item) => {
      const card = createEditorialCommunityServiceItemCard(item);
      contentDiv.appendChild(card);
    });
  }
  
  // Add Member of Committee section
  if (data.member_of_committee && data.member_of_committee.length > 0) {
    contentDiv.appendChild(createCategoryLabel('Member of Committee'));
    
    data.member_of_committee.forEach((item) => {
      const card = createEditorialCommunityServiceItemCard(item);
      contentDiv.appendChild(card);
    });
  }
  
  // Add Reviewer section
  if (data.reviewer && data.reviewer.length > 0) {
    contentDiv.appendChild(createCategoryLabel('Reviewer'));
    
    data.reviewer.forEach((item) => {
      const card = createEditorialCommunityServiceItemCard(item);
      contentDiv.appendChild(card);
    });
  }
  
  innerWrapper.appendChild(contentDiv);
  wrapper.appendChild(innerWrapper);
  
  return wrapper;
}

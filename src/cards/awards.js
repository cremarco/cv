// =============================================================================
// CARD CREATION - AWARDS CARD
// =============================================================================

import { createLinkBadge } from './shared.js';

/**
 * Creates a single award card
 */
function createAwardCard(award) {
  const card = document.createElement('div');
  card.className = 'flex flex-col gap-0.5 items-center relative shrink-0';
  
  // Award image
  const imgContainer = document.createElement('div');
  imgContainer.className = 'h-[115px] relative shrink-0 w-[160px] flex items-center justify-center';
  const img = document.createElement('img');
  img.src = `img/awards/${award.image}`;
  img.alt = `${award.title} - ${award.event} ${award.year}`;
  img.className = 'max-w-full max-h-full object-contain pointer-events-none';
  img.style.width = '100%';
  img.style.height = '100%';
  imgContainer.appendChild(img);
  card.appendChild(imgContainer);
  
  // Title and link badge
  const titleContainer = document.createElement('div');
  titleContainer.className = 'flex gap-1 items-start relative shrink-0 w-full';
  
  const title = document.createElement('p');
  title.className = 'font-dm-sans font-medium leading-[9px] relative shrink-0 text-gray-dark text-[7px] whitespace-nowrap';
  title.textContent = award.title;
  titleContainer.appendChild(title);
  
  if (award.link) {
    titleContainer.insertAdjacentHTML('beforeend', createLinkBadge(award.link, true));
  }
  card.appendChild(titleContainer);
  
  // Event and year
  const eventText = document.createElement('p');
  eventText.className = 'font-dm-sans font-normal leading-[8px] min-w-full relative shrink-0 text-muted text-xs-6';
  eventText.innerHTML = `${award.event} <span class="font-dm-sans font-bold">${award.year}</span>`;
  card.appendChild(eventText);
  
  return card;
}

/**
 * Creates a container with all award cards
 */
export function createAwardsCard(awards) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col gap-4';
  
  if (!awards?.length) return wrapper;
  
  const row = document.createElement('div');
  row.className = 'flex gap-3 h-[137px] items-center justify-center relative shrink-0 w-full';
  
  awards.forEach(award => row.appendChild(createAwardCard(award)));
  wrapper.appendChild(row);
  
  return wrapper;
}



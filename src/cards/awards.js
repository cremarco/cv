// =============================================================================
// CARD CREATION - AWARDS CARD
// =============================================================================

import { createLinkBadge } from './shared.js';

/**
 * Creates a single award card
 */
function createAwardCard(award) {
  const card = document.createElement('div');
  card.className = 'flex flex-col gap-0.5 items-center min-w-0 relative w-full';
  
  // Award image
  const imgContainer = document.createElement('div');
  imgContainer.className = 'h-[108px] relative shrink-0 w-full max-w-[145px] flex items-center justify-center';
  const img = document.createElement('img');
  img.src = `img/awards/${award.image}`;
  img.alt = `${award.title} - ${award.event} ${award.year}`;
  img.className = 'max-w-full max-h-full object-contain pointer-events-none w-full h-full';
  imgContainer.appendChild(img);
  card.appendChild(imgContainer);
  
  // Title and link badge
  const titleContainer = document.createElement('div');
  titleContainer.className = 'flex gap-1 items-center justify-center min-w-0 relative shrink-0 w-full';
  
  const title = document.createElement('p');
  title.className = 'font-dm-sans font-medium leading-tight min-w-0 relative text-center text-slate-600 text-[7px] whitespace-normal';
  title.textContent = award.title;
  titleContainer.appendChild(title);
  
  if (award.link) {
    titleContainer.insertAdjacentHTML('beforeend', createLinkBadge(award.link));
  }
  card.appendChild(titleContainer);
  
  // Event and year
  const eventText = document.createElement('p');
  eventText.className = 'font-dm-sans font-normal leading-tight max-w-full relative shrink-0 text-center text-slate-500 text-xs-6 w-full whitespace-normal break-words';
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
  row.className = 'grid grid-cols-2 gap-x-10 gap-y-4 items-start relative shrink-0 w-full';
  
  awards.forEach(award => row.appendChild(createAwardCard(award)));
  wrapper.appendChild(row);
  
  return wrapper;
}

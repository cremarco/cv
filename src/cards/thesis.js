// =============================================================================
// CARD CREATION - THESIS SUPERVISOR CARD
// =============================================================================

import { CARD_INTERNAL_GAP, CARD_PADDING_CLASSES, CARD_SURFACE_CLASSES } from '../config.js';

/**
 * Creates a thesis supervisor statistics card
 */
export function createThesisSupervisorCard(data) {
  const wrapper = document.createElement('div');
  wrapper.className = `flex ${CARD_INTERNAL_GAP}`;
  
  // Bachelor's thesis section
  if (data.bachelor_thesis?.length > 0) {
    const item = data.bachelor_thesis[0];
    const bachelorCard = document.createElement('div');
    bachelorCard.className = `${CARD_SURFACE_CLASSES} ${CARD_PADDING_CLASSES} rounded-md flex flex-col items-center justify-center`;
    bachelorCard.innerHTML = `
      <div class="flex flex-col items-center justify-center">
        <p class="text-ink text-xs-16 font-dm-sans font-normal mb-0">${item.count}</p>
        <div class="flex flex-col justify-center text-muted text-xs-6 text-center font-dm-sans font-normal">
          <p class="mb-0">${item.program}</p>
          <p>@${item.university}</p>
        </div>
      </div>
      <div class="flex flex-col justify-center text-muted text-xs-7 text-center font-dm-sans font-normal mt-1">
        <p>Bachelor's thesis</p>
      </div>
    `;
    wrapper.appendChild(bachelorCard);
  }
  
  // Master's thesis section
  if (data.master_thesis?.length > 0) {
    const masterCards = data.master_thesis.map((item, index) => {
      const divider = index > 0 ? '<div class="border border-[rgba(0,0,0,0.05)] border-solid h-[25px] shrink-0 w-[0.5px]"></div>' : '';
      const programParts = item.program.split(' ');
      const needsLineBreak = programParts.length > 2;
      
      const programHtml = needsLineBreak
        ? `<p class="mb-0">${programParts.slice(0, 2).join(' ')}</p>
           <p>${programParts.slice(2).join(' ')}@${item.university}</p>`
        : `<p class="mb-0">${item.program}</p>
           <p>@${item.university}</p>`;
      
      return `
        ${divider}
        <div class="flex flex-col items-center justify-center">
          <p class="text-ink text-xs-16 font-dm-sans font-normal mb-0">${item.count}</p>
          <div class="flex flex-col justify-center text-muted text-xs-6 text-center font-dm-sans font-normal">
            ${programHtml}
          </div>
        </div>
      `;
    }).join('');
    
    const masterCard = document.createElement('div');
    masterCard.className = `${CARD_SURFACE_CLASSES} ${CARD_PADDING_CLASSES} rounded-md flex-1`;
    masterCard.innerHTML = `
      <div class="flex flex-col gap-1 items-center justify-center">
        <div class="flex gap-4 items-center justify-center">${masterCards}</div>
        <div class="flex flex-col justify-center text-muted text-xs-7 text-center font-dm-sans font-normal">
          <p>Master's thesis</p>
        </div>
      </div>
    `;
    wrapper.appendChild(masterCard);
  }
  
  return wrapper;
}

// =============================================================================
// CARD CREATION - PUBLICATIONS SECTION
// =============================================================================

import { getCardClasses } from '../utils/css-classes.js';

/**
 * Creates the publications header with links and metrics
 */
function createPublicationsHeader(data, metrics) {
  const header = document.createElement('div');
  header.className = 'flex flex-col gap-4 w-full';
  
  // Update date as subtitle (same style as other section subtitles)
  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex flex-col items-start leading-none';
  titleDiv.innerHTML = `
    <div class="text-xs-8 font-dm-sans text-ink -mt-1 mb-2">Update date: ${data.update_date}</div>
  `;
  header.appendChild(titleDiv);
  
  // Links and legend row
  const linksRow = document.createElement('div');
  linksRow.className = 'flex items-center justify-between w-full';
  
  // Research profile links
  const linksGroup = document.createElement('div');
  linksGroup.className = 'flex gap-1 items-center';
  
  // Google Scholar badge - same style as time badge
  if (metrics?.google_scholar) {
    const gs = metrics.google_scholar;
    const gsBadge = document.createElement('span');
    gsBadge.className = 'inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded-md bg-purple-100 text-purple-700 gap-1';
    gsBadge.innerHTML = `
      <img src="img/logo/google_scholar.png" alt="Google Scholar" class="w-3 h-3 object-contain rounded shadow-sm">
      <a href="${gs.url}" class="underline">Google Scholar</a>
      <span>cit: ${gs.citations}, h-index: ${gs.h_index}, i10-index: ${gs.i10_index}</span>
    `;
    linksGroup.appendChild(gsBadge);
  }
  
  // Scopus badge - same style as time badge
  if (metrics?.scopus) {
    const scopusBadge = document.createElement('span');
    scopusBadge.className = 'inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded-md bg-purple-100 text-purple-700 gap-1';
    scopusBadge.innerHTML = `
      <img src="img/logo/scopus.png" alt="Scopus" class="w-3 h-3 object-contain">
      <a href="${metrics.scopus.url}" class="underline">Scopus</a>
      <span>h-index: ${metrics.scopus.h_index}</span>
    `;
    linksGroup.appendChild(scopusBadge);
  }
  
  // Orcid badge - same style as time badge
  if (metrics?.orcid) {
    const orcidBadge = document.createElement('span');
    orcidBadge.className = 'inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded-md bg-purple-100 text-purple-700 gap-1';
    orcidBadge.innerHTML = `
      <i class='bx bxl-orcid text-[12px]' style="color: #A6CE39;"></i>
      <a href="${metrics.orcid.url}" class="underline">Orcid</a>
      <span>${metrics.orcid.id}</span>
    `;
    linksGroup.appendChild(orcidBadge);
  }
  
  linksRow.appendChild(linksGroup);
  
  // Legend - same style as Link badge
  const legendGroup = document.createElement('div');
  legendGroup.className = 'flex gap-1 items-center';
  legendGroup.innerHTML = `
    <span class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded gap-0.5">
      <i class='bx bx-microphone text-[8px]'></i>
      <span>Speaker</span>
    </span>
    <span class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded gap-0.5">
      <i class='bx bxs-star text-[8px]' style="color: rgba(219, 182, 0, 1);"></i>
      <span>Best paper</span>
    </span>
    <span class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded gap-0.5">
      <i class='bx bxs-trophy text-[8px]' style="color: rgba(219, 182, 0, 1);"></i>
      <span>Winner</span>
    </span>
  `;
  linksRow.appendChild(legendGroup);
  
  header.appendChild(linksRow);
  
  return header;
}

/**
 * Creates the publications summary cards (counts)
 */
function createPublicationsSummaryCards(summary) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex gap-1 items-start w-full';
  
  const items = [
    { count: summary.journal_papers, label: 'Journal Papers' },
    { count: summary.conference_papers, label: 'Conference Papers' },
    { count: summary.workshop_papers, label: 'Workshop Papers' },
    { count: summary.challenge_papers, label: 'Challenge Papers' },
    { count: summary.book_chapters, label: 'Book Chapter' },
  ];
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'flex-1 bg-white px-3 py-2 rounded-md flex flex-col gap-1 items-start';
    card.innerHTML = `
      <div class="flex h-[15px] items-center justify-center w-full">
        <span class="text-ink text-[20px] font-dm-sans leading-[10px] text-right w-full">${item.count}</span>
      </div>
      <div class="flex flex-col items-center justify-center w-full">
        <span class="text-muted text-[7px] font-dm-sans text-center tracking-[0.07px] leading-[9px]">${item.label}</span>
      </div>
    `;
    wrapper.appendChild(card);
  });
  
  return wrapper;
}

/**
 * Creates a single publication card following the same style as other cards
 */
export function createPublicationCard(paper, { isFirstInPage, isFirstInSection, isLast }) {
  // Use getCardClasses for consistent styling (isCurrent is false for publications)
  const cardClasses = getCardClasses({ 
    isFirstInPage, 
    isFirstInSection, 
    isCurrent: false 
  });
  
  const card = document.createElement('div');
  card.className = `${cardClasses} w-full`;
  
  // Add rounded-b-md to last card
  if (isLast) {
    card.classList.add('rounded-b-md');
  }
  
  // Paper type badge text
  const typeLabels = {
    'journal': 'Journal paper',
    'conference': 'Conference paper',
    'workshop': 'Workshop paper',
    'challenge': 'Challenge paper',
    'book_chapter': 'Book chapter',
  };
  
  // Build attributes HTML
  let attrsHTML = '';
  
  // Best paper badge
  if (paper.best_paper) {
    attrsHTML += `
      <div class="bg-gray-lighter flex gap-0.5 h-2.5 items-center px-0.5 rounded-sm">
        <i class='bx bxs-star text-[8px]' style="color: rgba(219, 182, 0, 1);"></i>
        <span class="text-ink text-xs-6 font-dm-sans text-center tracking-[0.06px] leading-[8px]">Best paper</span>
      </div>
    `;
  }
  
  // Speaker badge
  if (paper.speaker) {
    attrsHTML += `
      <div class="bg-gray-lighter flex gap-0.5 h-2.5 items-center px-0.5 rounded-sm">
        <i class='bx bx-microphone text-[8px] text-ink'></i>
        <span class="text-ink text-xs-6 font-dm-sans text-center tracking-[0.06px] leading-[8px]">Speaker</span>
      </div>
    `;
  }
  
  // ICORE badge
  if (paper.icore) {
    attrsHTML += `
      <div class="bg-gray-lighter flex gap-0.5 h-2.5 items-center justify-center px-0.5 rounded-sm text-ink text-xs-6 font-dm-sans text-center tracking-[0.06px] leading-[8px]">
        <span class="font-bold">ICORE:</span>
        <span>${paper.icore}</span>
      </div>
    `;
  }
  
  // Quartiles badge
  if (paper.quartiles?.length > 0) {
    const quartilesText = paper.quartiles.map(q => `<span class="font-bold">${q.rank}</span> ${q.field}`).join(', ');
    attrsHTML += `
      <div class="bg-gray-lighter flex gap-0.5 h-2.5 items-center justify-center px-0.5 rounded-sm text-ink text-xs-6 font-dm-sans text-center tracking-[0.06px] leading-[8px]">
        <span class="font-bold">QUARTILES:</span>
        <span>${quartilesText}</span>
      </div>
    `;
  }
  
  // DOI badge
  if (paper.doi) {
    attrsHTML += `
      <div class="bg-gray-lighter flex gap-0.5 h-2.5 items-center justify-center px-0.5 rounded-sm text-ink text-xs-6 font-dm-sans text-center tracking-[0.06px] leading-[8px]">
        <span class="font-bold">DOI:</span>
        <a href="https://doi.org/${paper.doi}" class="underline">${paper.doi}</a>
      </div>
    `;
  }
  
  // CEUR badge
  if (paper.ceur) {
    attrsHTML += `
      <div class="bg-gray-lighter flex gap-0.5 h-2.5 items-center justify-center px-0.5 rounded-sm text-ink text-xs-6 font-dm-sans text-center tracking-[0.06px] leading-[8px]">
        <span class="font-bold">CEUR:</span>
        <span>${paper.ceur}</span>
      </div>
    `;
  }
  
  // Use same structure as other cards: contentDiv with flex-1
  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  contentDiv.innerHTML = `
    <div class="flex flex-wrap gap-1.5 items-start mb-1">
      <div class="bg-gray-lighter flex flex-col h-2.5 items-center justify-center px-0.5 rounded-sm w-[15px] shrink-0">
        <span class="text-ink text-xs-6 font-dm-sans text-center tracking-[0.06px] leading-[8px]">${paper.number}</span>
      </div>
      <div class="flex-1 flex flex-col font-dm-sans justify-center text-ink text-[7px] tracking-[0.07px] leading-[9px] min-w-0">
        <p class="mb-0">${paper.authors}</p>
        <p class="italic mb-0 font-dm-sans">${paper.title}</p>
        <p class="mb-0">${paper.venue}</p>
      </div>
      <div class="bg-accent-soft flex h-2.5 items-center justify-center px-0.5 rounded-sm shrink-0">
        <span class="text-accent text-xs-6 font-dm-sans text-center tracking-[0.06px] leading-[8px]">${typeLabels[paper.type] || paper.type}</span>
      </div>
    </div>
    <div class="pl-1.5 flex gap-[2px] items-center justify-end">
      ${attrsHTML}
    </div>
  `;
  card.appendChild(contentDiv);
  
  return card;
}

/**
 * Creates the publications section container
 */
export function createPublicationsContainer(pubData, metrics) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col gap-4 items-start w-full';
  
  // Header with links
  const headerContainer = document.createElement('div');
  headerContainer.className = 'flex flex-col gap-4 w-full';
  headerContainer.appendChild(createPublicationsHeader(pubData, metrics));
  
  // Summary cards
  headerContainer.appendChild(createPublicationsSummaryCards(pubData.summary));
  wrapper.appendChild(headerContainer);
  
  // Papers list - no gap between cards (they connect like other sections)
  const papersContainer = document.createElement('div');
  papersContainer.className = 'flex flex-col gap-0 items-start w-full';
  
  pubData.papers.forEach((paper, index) => {
    const isFirstInSection = index === 0;
    const isLast = index === pubData.papers.length - 1;
    // For publications, we assume they're all on the same page initially
    // The page break logic will handle it if needed
    const isFirstInPage = isFirstInSection;
    
    papersContainer.appendChild(createPublicationCard(paper, { 
      isFirstInPage, 
      isFirstInSection, 
      isLast 
    }));
  });
  
  wrapper.appendChild(papersContainer);
  
  return wrapper;
}


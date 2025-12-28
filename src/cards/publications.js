// =============================================================================
// CARD CREATION - PUBLICATIONS SECTION
// =============================================================================

import { getCardClasses } from '../utils/css-classes.js';
import { CARD_INTERNAL_GAP, CARD_PADDING_CLASSES, CARD_SURFACE_CLASSES } from '../config.js';

const formatMetricValue = (value) => (value ?? '—');

/**
 * Creates the publications header with links and metrics
 */
export function createPublicationsHeader(data, metrics) {
  const header = document.createElement('div');
  header.className = 'flex flex-col gap-4 w-full';
  
  // Update date as subtitle (same style as other section subtitles)
  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex flex-col items-start leading-none';
  titleDiv.innerHTML = `
    <div class="text-xs-8 font-dm-sans text-slate-800 -mt-3 mb-2">Update date: ${data.update_date}</div>
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
    const googleScholarUrl = gs.url || '#';
    const gsBadge = document.createElement('span');
    gsBadge.className = 'inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded-md bg-purple-100 text-purple-700 gap-1';
    gsBadge.innerHTML = `
      <img src="img/logo/google_scholar.png" alt="Google Scholar" class="w-3 h-3 object-contain rounded shadow-sm">
      <a href="${googleScholarUrl}" target="_blank" rel="noopener noreferrer" class="underline">Google Scholar</a>
      <span>cit: ${formatMetricValue(gs.citations)}, h-index: ${formatMetricValue(gs.h_index)}, i10-index: ${formatMetricValue(gs.i10_index)}</span>
    `;
    linksGroup.appendChild(gsBadge);
  }
  
  // Scopus badge - same style as time badge
  if (metrics?.scopus) {
    const scopusUrl = metrics.scopus.url || '#';
    const scopusBadge = document.createElement('span');
    scopusBadge.className = 'inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded-md bg-purple-100 text-purple-700 gap-1';
    scopusBadge.innerHTML = `
      <img src="img/logo/scopus.png" alt="Scopus" class="w-3 h-3 object-contain">
      <a href="${scopusUrl}" target="_blank" rel="noopener noreferrer" class="underline">Scopus</a>
      <span>cit: ${formatMetricValue(metrics.scopus.citations)}, h-index: ${formatMetricValue(metrics.scopus.h_index)}</span>
    `;
    linksGroup.appendChild(scopusBadge);
  }
  
  linksRow.appendChild(linksGroup);
  
  // Legend - same style as Link badge
  const legendGroup = document.createElement('div');
  legendGroup.className = 'flex gap-1 items-center';
  legendGroup.innerHTML = `
    <span class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded gap-0.5">
      <i class='bx bx-microphone text-[8px] text-amber-500'></i>
      <span>Speaker</span>
    </span>
    <span class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded gap-0.5">
      <i class='bx bx-star text-[8px] text-amber-500'></i>
      <span>Best paper</span>
    </span>
    <span class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded gap-0.5">
      <i class='bx bx-trophy text-[8px] text-amber-500'></i>
      <span>Winner</span>
    </span>
  `;
  linksRow.appendChild(legendGroup);
  
  header.appendChild(linksRow);
  
  return header;
}

/**
 * Calculates publication counts dynamically from papers array
 */
export function calculatePublicationCounts(papers) {
  const counts = {
    journal_papers: 0,
    conference_papers: 0,
    workshop_papers: 0,
    challenge_papers: 0,
    book_chapters: 0,
  };
  
  if (!Array.isArray(papers)) {
    return counts;
  }
  
  papers.forEach(paper => {
    switch (paper.type) {
      case 'journal':
        counts.journal_papers++;
        break;
      case 'conference':
        counts.conference_papers++;
        break;
      case 'workshop':
        counts.workshop_papers++;
        break;
      case 'challenge':
        counts.challenge_papers++;
        break;
      case 'book_chapter':
        counts.book_chapters++;
        break;
    }
  });
  
  return counts;
}

/**
 * Creates the publications summary cards (counts)
 */
export function createPublicationsSummaryCards(counts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex gap-1 items-start w-full';
  
  const items = [
    { count: counts.journal_papers, label: 'Journal Papers' },
    { count: counts.conference_papers, label: 'Conference Papers' },
    { count: counts.workshop_papers, label: 'Workshop Papers' },
    { count: counts.challenge_papers, label: 'Challenge Papers' },
    { count: counts.book_chapters, label: 'Book Chapter' },
  ];
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = `flex-1 ${CARD_SURFACE_CLASSES} ${CARD_PADDING_CLASSES} rounded-md flex flex-col ${CARD_INTERNAL_GAP} items-start`;
    card.innerHTML = `
      <div class="flex h-[15px] items-center justify-center w-full">
        <span class="text-slate-800 text-[20px] font-dm-sans leading-tight text-center w-full">${item.count}</span>
      </div>
      <div class="flex flex-col items-center justify-center w-full">
        <span class="text-slate-500 text-xs-7 font-dm-sans text-center">${item.label}</span>
      </div>
    `;
    wrapper.appendChild(card);
  });
  
  return wrapper;
}

/**
 * Creates a single publication card following the same style as other cards
 */
export function createPublicationCard(paper, { isFirstInPage, isFirstInSection, isLast, index }) {
  // Use getCardClasses for consistent styling (isCurrent is false for publications)
  const cardClasses = getCardClasses({ 
    isFirstInPage, 
    isFirstInSection, 
    isLast,
    isCurrent: false 
  });
  
  const card = document.createElement('div');
  card.className = `${cardClasses} w-full`;
  card.dataset.card = 'publications';
  
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
      <span class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded gap-0.5">
        <i class='bx bx-star text-[8px] text-amber-500'></i>
        <span>Best paper</span>
      </span>
    `;
  }
  
  // Speaker badge
  if (paper.speaker) {
    attrsHTML += `
      <span class="inline-flex items-center justify-center px-1 py-0.5 text-[6px] font-medium bg-gray-200 text-gray-800 rounded gap-0.5">
        <i class='bx bx-microphone text-[8px] text-amber-500'></i>
        <span>Speaker</span>
      </span>
    `;
  }
  
  // ICORE badge
  if (paper.icore) {
    attrsHTML += `
      <div class="bg-slate-200 flex gap-0.5 h-2.5 items-center justify-center px-0.5 rounded-sm">
        <span class="text-slate-800 text-xs-5 font-dm-sans text-center tracking-[0.06px] leading-tight"><span class="font-bold">ICORE:</span> ${paper.icore}</span>
      </div>
    `;
  }
  
  // Quartiles badge
  if (paper.quartiles?.length > 0) {
    const quartilesText = paper.quartiles.map(q => `<span class="font-bold">${q.rank}</span> ${q.field}`).join(', ');
    attrsHTML += `
      <div class="bg-slate-200 flex gap-0.5 h-2.5 items-center justify-center px-0.5 rounded-sm">
        <span class="text-slate-800 text-xs-5 font-dm-sans text-center tracking-[0.06px] leading-tight"><span class="font-bold">QUARTILES:</span> ${quartilesText}</span>
      </div>
    `;
  }
  
  // DOI badge
  if (paper.doi) {
    attrsHTML += `
      <div class="bg-slate-200 flex gap-0.5 h-2.5 items-center justify-center px-0.5 rounded-sm">
        <span class="text-slate-800 text-xs-5 font-dm-sans text-center tracking-[0.06px] leading-tight"><span class="font-bold">DOI:</span> <a href="https://doi.org/${paper.doi}" target="_blank" rel="noopener noreferrer" class="underline">${paper.doi}</a></span>
      </div>
    `;
  }
  
  // CEUR badge
  if (paper.ceur) {
    const ceurId = String(paper.ceur).trim();
    const ceurUrl = paper.ceur_url || `https://ceur-ws.org/${encodeURIComponent(ceurId)}/`;
    attrsHTML += `
      <div class="bg-slate-200 flex gap-0.5 h-2.5 items-center justify-center px-0.5 rounded-sm">
        <span class="text-slate-800 text-xs-5 font-dm-sans text-center tracking-[0.06px] leading-tight"><span class="font-bold">CEUR:</span> <a href="${ceurUrl}" target="_blank" rel="noopener noreferrer" class="underline">${ceurId}</a></span>
      </div>
    `;
  }
  
  // Use same structure as other cards: contentDiv with flex-1
  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';
  contentDiv.innerHTML = `
    <div class="flex flex-wrap gap-1.5 items-center mb-1">
      <span class="inline-flex items-center px-1.5 py-0.5 text-[8px] font-medium rounded-md bg-gray-100 text-gray-700 shrink-0">${index + 1}</span>
      <div class="flex-1 flex flex-col font-dm-sans justify-center text-slate-800 text-xs-6 leading-normal min-w-0">
        <p class="mb-0">${paper.authors}</p>
        <p class="italic mb-0 font-dm-sans">${paper.title}</p>
        <p class="mb-0">${paper.venue}</p>
      </div>
      <div class="bg-purple-100 flex h-2.5 items-center justify-center px-0.5 rounded-sm shrink-0">
        <span class="text-purple-500 text-xs-5 font-dm-sans text-center tracking-[0.06px] leading-tight">${typeLabels[paper.type] || paper.type}</span>
      </div>
    </div>
    ${attrsHTML ? `<div class="pl-1.5 flex gap-[2px] items-center justify-end mt-0.5">${attrsHTML}</div>` : ''}
  `;
  card.appendChild(contentDiv);
  
  return card;
}

// =============================================================================
// CARD FACTORY
// Maps card types to their creation functions
// =============================================================================

import { createExperienceCard } from './experience.js';
import { createTransferCard } from './transfer.js';
import { createEducationCard } from './education.js';
import { createTeachingCard } from './teaching.js';
import { createWebinarCard } from './webinar.js';

export function createCard(type, data, options = {}) {
  switch (type) {
    case 'experience':
      return createExperienceCard(data, options);
    case 'transfer':
      return createTransferCard(data, options);
    case 'education':
      return createEducationCard(data);
    case 'teaching-phd':
      return createTeachingCard(data, { ...options, isPhd: true });
    case 'teaching-general':
      return createTeachingCard(data, { ...options, isPhd: false });
    case 'webinar':
      return createWebinarCard(data);
    default:
      console.warn(`Unknown card type: ${type}`);
      return document.createElement('div');
  }
}




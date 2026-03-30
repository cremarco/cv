import test from 'node:test';
import assert from 'node:assert/strict';

import { isInternalFileLink } from '../src/utils/render-options.js';

function setMockWindow(href) {
  const parsed = new URL(href);
  globalThis.window = {
    location: {
      href: parsed.href,
      origin: parsed.origin,
    },
  };
}

test('isInternalFileLink detects same-origin internal files', () => {
  setMockWindow('http://localhost:4173/?pdf=1');
  assert.equal(isInternalFileLink('/files/contratto.pdf'), true);
});

test('isInternalFileLink hides cremarco.github.io links also from localhost', () => {
  setMockWindow('http://localhost:4173/?pdf=1&no-link=1');
  assert.equal(isInternalFileLink('https://cremarco.github.io/cv/files/example.pdf'), true);
});

test('isInternalFileLink keeps unrelated external links visible', () => {
  setMockWindow('http://localhost:4173/?pdf=1&no-link=1');
  assert.equal(isInternalFileLink('https://example.com/report.pdf'), false);
});

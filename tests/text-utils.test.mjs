import test from 'node:test';
import assert from 'node:assert/strict';

import { formatSentence, buildTopicText } from '../src/utils/text.js';

test('formatSentence appends trailing period when missing', () => {
  assert.equal(formatSentence('Semantic Web'), 'Semantic Web.');
});

test('formatSentence does not duplicate trailing period', () => {
  assert.equal(formatSentence('Semantic Web.'), 'Semantic Web.');
});

test('buildTopicText joins topic and SSD labels', () => {
  assert.equal(buildTopicText({ topic: 'AI systems', ssd: 'INF/01' }), 'AI systems, SSD INF/01');
});

test('buildTopicText skips missing values', () => {
  assert.equal(buildTopicText({ topic: 'Knowledge Graphs' }), 'Knowledge Graphs');
  assert.equal(buildTopicText({ ssd: 'INF/01' }), 'SSD INF/01');
  assert.equal(buildTopicText({}), '');
});

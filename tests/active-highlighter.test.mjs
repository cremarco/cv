import test from 'node:test';
import assert from 'node:assert/strict';

import { isTimePeriodActive } from '../src/utils/active-highlighter.js';

const referenceDate = new Date(2026, 4, 14);

test('isTimePeriodActive treats future-ending ranges as active', () => {
  assert.equal(isTimePeriodActive('11 Nov 2026 - 12 Nov 2026', referenceDate), true);
  assert.equal(isTimePeriodActive('Mar 2023 - Dec 2026', referenceDate), true);
});

test('isTimePeriodActive treats expired ranges as inactive', () => {
  assert.equal(isTimePeriodActive('Sep 2024 - Nov 2025', referenceDate), false);
  assert.equal(isTimePeriodActive('2018 - 2020', referenceDate), false);
});

test('isTimePeriodActive treats current ranges as active', () => {
  assert.equal(isTimePeriodActive('2026 - Current', referenceDate), true);
  assert.equal(isTimePeriodActive('Jan 2015 - Present', referenceDate), true);
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { parseMonthYear, compareDatesDesc } from '../src/utils/date.js';

test('parseMonthYear parses supported month-year format', () => {
  const value = parseMonthYear('Sep 2024');
  assert.ok(value instanceof Date);
  assert.equal(value.getFullYear(), 2024);
  assert.equal(value.getMonth(), 8);
});

test('parseMonthYear parses supported day-month-year format', () => {
  const value = parseMonthYear('12 Jun 2026');
  assert.ok(value instanceof Date);
  assert.equal(value.getFullYear(), 2026);
  assert.equal(value.getMonth(), 5);
  assert.equal(value.getDate(), 12);
});

test('parseMonthYear returns null for invalid values', () => {
  assert.equal(parseMonthYear('2024-09'), null);
  assert.equal(parseMonthYear(''), null);
  assert.equal(parseMonthYear(null), null);
});

test('compareDatesDesc sorts most recent dates first', () => {
  const values = ['Jan 2024', 'Sep 2025', 'Mar 2022'];
  const sorted = [...values].sort(compareDatesDesc);
  assert.deepEqual(sorted, ['Sep 2025', 'Jan 2024', 'Mar 2022']);
});

test('compareDatesDesc puts unparsable dates at the end', () => {
  const values = ['Jan 2024', 'n/a', 'Feb 2024'];
  const sorted = [...values].sort(compareDatesDesc);
  assert.deepEqual(sorted, ['Feb 2024', 'Jan 2024', 'n/a']);
});

test('compareDatesDesc supports date ranges', () => {
  const values = ['12 Jun 2026', '11 Nov 2026 - 12 Nov 2026'];
  const sorted = [...values].sort(compareDatesDesc);
  assert.deepEqual(sorted, ['11 Nov 2026 - 12 Nov 2026', '12 Jun 2026']);
});

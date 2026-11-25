import test from 'node:test';
import assert from 'node:assert/strict';
import { nextOpen } from '../gp-spot.mjs';

test('desktop always keeps one layer open; phone can fold the open one', () => {
  assert.equal(nextOpen(0, 2, { compact: false }), 2);
  assert.equal(nextOpen(2, 2, { compact: false }), 2);
  assert.equal(nextOpen(2, 2, { compact: true }), -1);
  assert.equal(nextOpen(-1, 1, { compact: true }), 1);
});

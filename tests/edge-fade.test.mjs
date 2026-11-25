import test from 'node:test';
import assert from 'node:assert/strict';
import { edgeState } from '../edge-fade.mjs';

test('edge fade marks only the side that still has hidden chips', () => {
  assert.equal(edgeState({ scrollLeft: 0, scrollWidth: 300, clientWidth: 300 }), 'none');
  assert.equal(edgeState({ scrollLeft: 0, scrollWidth: 600, clientWidth: 300 }), 'end');
  assert.equal(edgeState({ scrollLeft: 150, scrollWidth: 600, clientWidth: 300 }), 'both');
  assert.equal(edgeState({ scrollLeft: 300, scrollWidth: 600, clientWidth: 300 }), 'start');
  assert.equal(edgeState({ scrollLeft: 0, scrollWidth: 302, clientWidth: 300 }), 'none');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { nextItem, selectCategory, selectItem, createRotationTimer } from '../remarketing.mjs';
import * as showcase from '../remarketing.mjs';

const categories = [
  { id: 'welcome', items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
  { id: 'aftercare', items: [{ id: 'd' }] },
  { id: 'empty', items: [] },
];

test('rotation wraps within the selected category without changing category', () => {
  const state = { category: 0, item: 2 };
  assert.deepEqual(nextItem(categories, state), { category: 0, item: 0 });
  assert.deepEqual(state, { category: 0, item: 2 });
  assert.deepEqual(nextItem(categories, { category: 1, item: 0 }), { category: 1, item: 0 });
});

test('automatic showcase visits every message and skips empty groups before wrapping', () => {
  assert.equal(typeof showcase.nextShowcase, 'function');
  let state = { category: 0, item: 0 };
  const visited = [];
  for (let tick = 0; tick < 4; tick += 1) {
    visited.push(categories[state.category].items[state.item].id);
    state = showcase.nextShowcase(categories, state);
  }
  assert.deepEqual(visited, ['a', 'b', 'c', 'd']);
  assert.deepEqual(state, { category: 0, item: 0 });
  const invalid = { category: 2, item: 0 };
  assert.equal(showcase.nextShowcase(categories, invalid), invalid);
  assert.equal(showcase.nextShowcase([], invalid), invalid);
});

test('category selection resets the item only when the category changes', () => {
  const state = { category: 0, item: 2 };
  assert.equal(selectCategory(categories, state, 0), state);
  assert.deepEqual(selectCategory(categories, state, 1), { category: 1, item: 0 });
  for (const index of [-1, 3, 1.2, NaN, '1', 2]) {
    assert.equal(selectCategory(categories, state, index), state);
  }
});

test('item selection rejects invalid indexes and preserves the category', () => {
  const state = { category: 0, item: 0 };
  assert.deepEqual(selectItem(categories, state, 2), { category: 0, item: 2 });
  for (const index of [-1, 3, 1.2, NaN, '1']) {
    assert.equal(selectItem(categories, state, index), state);
  }
  assert.deepEqual(nextItem([], state), state);
});

function scheduler() {
  let sequence = 0;
  const pending = new Map();
  return {
    pending,
    schedule(callback, delay) { const id = ++sequence; pending.set(id, { callback, delay }); return id; },
    cancel(id) { pending.delete(id); },
    fire() { const entry = pending.entries().next().value; if (!entry) return; pending.delete(entry[0]); entry[1].callback(); },
  };
}

test('rotation timer has one pending tick, suspends cleanly and resumes a fresh interval', () => {
  const clock = scheduler();
  let selected = 0;
  const timer = createRotationTimer(() => { selected += 1; }, { schedule: clock.schedule, cancel: clock.cancel });
  timer.setRunning(true);
  timer.setRunning(true);
  assert.equal(clock.pending.size, 1);
  assert.equal([...clock.pending.values()][0].delay, 4200);
  clock.fire();
  assert.equal(selected, 1);
  assert.equal(clock.pending.size, 1);
  timer.setRunning(false);
  assert.equal(clock.pending.size, 0);
  clock.fire();
  assert.equal(selected, 1);
  timer.setRunning(true);
  assert.equal(clock.pending.size, 1);
  timer.dispose();
  assert.equal(clock.pending.size, 0);
  timer.setRunning(true);
  assert.equal(clock.pending.size, 0);
});

test('a tick can stop rotation without creating an orphan timer', () => {
  const clock = scheduler();
  let timer;
  timer = createRotationTimer(() => timer.setRunning(false), { schedule: clock.schedule, cancel: clock.cancel, duration: 9000 });
  timer.setRunning(true);
  assert.equal([...clock.pending.values()][0].delay, 6500);
  clock.fire();
  assert.equal(clock.pending.size, 0);
});

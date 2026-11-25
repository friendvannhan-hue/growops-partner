import test from 'node:test';
import assert from 'node:assert/strict';
import * as rails from '../mobile-rails.mjs';
import * as integration from '../integration-explorer.mjs';

test('rail position follows the closest visible card, including a partly visible final card', () => {
  assert.equal(typeof rails.getRailIndex, 'function');
  assert.equal(rails.getRailIndex([{left:20,width:300},{left:332,width:300}], {left:20,width:350}), 0);
  assert.equal(rails.getRailIndex([{left:-260,width:300},{left:52,width:300}], {left:20,width:350}), 1);
  assert.equal(rails.getRailIndex([], {left:20,width:350}), -1);
});

test('rail arrows stay at the ends and remain valid when a filter reduces the card count', () => {
  assert.equal(typeof rails.stepRailIndex, 'function');
  assert.equal(rails.stepRailIndex(0,-1,4),0);
  assert.equal(rails.stepRailIndex(3,1,4),3);
  assert.equal(rails.stepRailIndex(0,1,4),1);
  assert.equal(rails.stepRailIndex(7,-1,3),1);
  assert.equal(rails.stepRailIndex(0,1,0),-1);
});

test('integration tabs support horizontal and vertical arrows and wrap at both ends', () => {
  assert.equal(typeof integration.integrationKeyIndex, 'function');
  for (const key of ['ArrowRight','ArrowDown']) assert.equal(integration.integrationKeyIndex(key,5,6),0);
  for (const key of ['ArrowLeft','ArrowUp']) assert.equal(integration.integrationKeyIndex(key,0,6),5);
  assert.equal(integration.integrationKeyIndex('Home',3,6),0);
  assert.equal(integration.integrationKeyIndex('End',3,6),5);
  assert.equal(integration.integrationKeyIndex('Tab',3,6),null);
});

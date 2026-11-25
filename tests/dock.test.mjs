import test from 'node:test';
import assert from 'node:assert/strict';
import { dockVisible } from '../dock.mjs';

test('mobile dock shows only after the hero and hides at the contact footer', () => {
  assert.equal(dockVisible({ pastHero: false, contactInView: false }), false);
  assert.equal(dockVisible({ pastHero: true, contactInView: false }), true);
  assert.equal(dockVisible({ pastHero: true, contactInView: true }), false);
});

test('mobile dock hides while another Zalo button is on screen', () => {
  assert.equal(dockVisible({ pastHero: true, contactInView: false, ctaInView: 1 }), false);
  assert.equal(dockVisible({ pastHero: true, contactInView: false, ctaInView: 0 }), true);
});

test('mobile dock steps aside while an opened fold is being read', () => {
  assert.equal(dockVisible({ pastHero: true, contactInView: false, foldOpenInView: 1 }), false);
  assert.equal(dockVisible({ pastHero: true, contactInView: false, foldOpenInView: 0 }), true);
});

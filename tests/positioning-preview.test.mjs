import test from 'node:test';
import assert from 'node:assert/strict';
import {openTargetAncestors} from '../positioning-preview.mjs';

test('deep links open every closed disclosure in outer-first order', () => {
  const order=[];
  const outer={tagName:'DETAILS',parentElement:null,set open(v){order.push(['outer',v]);}};
  const inner={tagName:'DETAILS',parentElement:outer,set open(v){order.push(['inner',v]);}};
  const wrapper={tagName:'DIV',parentElement:inner};
  assert.equal(openTargetAncestors({parentElement:wrapper}),2);
  assert.deepEqual(order,[['outer',true],['inner',true]]);
  assert.equal(openTargetAncestors(null),0);
});

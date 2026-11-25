import test from 'node:test';
import assert from 'node:assert/strict';
import { riseTargets, lockOpen, parseViNumber, formatViNumber } from '../motion.mjs';

function el(tag, text = '', parent = null) {
  const node = { tagName: tag, textContent: text, parentElement: parent, children: [], nextElementSibling: null, previousElementSibling: null };
  if (parent) {
    const prev = parent.children.at(-1);
    if (prev) { prev.nextElementSibling = node; node.previousElementSibling = prev; }
    parent.children.push(node);
  }
  return node;
}

test('riseTargets lấy h2, eyebrow ngắn phía trước và đoạn dẫn phía sau', () => {
  const shell = el('DIV');
  const eyebrow = el('P', 'GIÁ TRỊ', shell);
  const h2 = el('H2', 'Tiêu đề', shell);
  const lead = el('P', 'Đoạn dẫn', shell);
  const root = { querySelectorAll: () => [h2] };
  assert.deepEqual(riseTargets(root), [h2, lead, eyebrow]);
});

test('riseTargets bỏ qua đoạn dài phía trước h2 và phần tử không phải P', () => {
  const shell = el('DIV');
  el('P', 'x'.repeat(80), shell);
  const h2 = el('H2', 'Tiêu đề', shell);
  el('UL', '', shell);
  const root = { querySelectorAll: () => [h2] };
  assert.deepEqual(riseTargets(root), [h2]);
});

test('lockOpen mở mọi mục chi tiết và chặn bấm gập tiêu đề', () => {
  const summary = { tabIndex: 0, parentElement: { hasAttribute: () => false } };
  const details = { open: false, querySelector: () => summary };
  let handler;
  const root = { querySelectorAll: () => [details], addEventListener: (type, fn) => { handler = fn; } };
  lockOpen(root);
  assert.equal(details.open, true);
  assert.equal(summary.tabIndex, -1);
  let prevented = false;
  handler({ target: { closest: () => summary }, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  prevented = false;
  handler({ target: { closest: () => null }, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, false);
  const foldSummary = { parentElement: { hasAttribute: name => name === 'data-fold' } };
  handler({ target: { closest: () => foldSummary }, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, false, 'mục data-fold vẫn bấm mở/gập được');
});

test('parseViNumber/formatViNumber đọc và viết số kiểu Việt', () => {
  assert.equal(parseViNumber('66.574'), 66574);
  assert.equal(parseViNumber('500'), 500);
  assert.equal(parseViNumber('24,5–30,5'), null);
  assert.equal(formatViNumber(66574), '66.574');
  assert.equal(formatViNumber(1797.4), '1.797');
});

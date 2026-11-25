import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { posts, selectPosts, readSaved, toggleSaved } from '../social-media-manager-da-kenh/posts.mjs';

test('Vietnamese search accepts accentless, multiple terms and brand names', () => {
  assert.deepEqual(selectPosts(posts, { query: 'HANH TRINH thu gian osen' }).map(p => p.id), ['osen-spa']);
  assert.deepEqual(selectPosts(posts, { query: 'phu quoc collage' }).map(p => p.id), ['osen-phu-quoc']);
  assert.deepEqual(selectPosts(posts, { query: 'LS2 carbon' }).map(p => p.id), ['ls2-carbon']);
  assert.equal(selectPosts(posts, { query: 'mo studio' }).length, 0);
});

test('Brand, type, channel and saved filters compose', () => {
  assert.equal(selectPosts(posts, { brand: 'osen' }).length, 6);
  assert.equal(selectPosts(posts, { brand: 'ls2' }).length, 4);
  assert.equal(selectPosts(posts, { brand: 'fashion', channel: 'design' }).length, 5);
  assert.equal(selectPosts(posts, { brand: 'ls2', kind: 'album' }).length, 2);
  assert.equal(selectPosts(posts, { brand: 'fashion', channel: 'facebook' }).length, 0);
  assert.deepEqual(selectPosts(posts, { savedOnly: true, brand: 'ls2', saved: ['osen-spa', 'ls2-carbon', 'mo-details'] }).map(p => p.id), ['ls2-carbon']);
  assert.equal(selectPosts(posts, { savedOnly: true, saved: [] }).length, 0);
});

test('Saved state recovers from corruption and removes deleted fictional sample IDs', () => {
  const ids = posts.map(p => p.id);
  for (const raw of [null, 'bad-json', '{}', 'null']) assert.deepEqual(readSaved(raw, ids), []);
  assert.deepEqual(readSaved('["osen-spa","unknown","osen-spa",null,42,"mo-soft"]', ids), ['osen-spa']);
  assert.deepEqual(toggleSaved(['osen-spa'], 'unknown', ids), ['osen-spa']);
  assert.deepEqual(toggleSaved(['osen-spa'], 'osen-spa', ids), []);
  assert.deepEqual(toggleSaved([], 'ls2-carbon', ids), ['ls2-carbon']);
});

test('Every supplied artwork is represented once; framing stays within the source image', async () => {
  const sources = JSON.parse(await readFile(new URL('../social-media-manager-da-kenh/image-sources.json', import.meta.url)));
  assert.equal(posts.length, 15);
  assert.equal(new Set(posts.map(p => p.id)).size, 15);
  assert.equal(sources.length, 15);
  for (const post of posts) {
    const source = sources.find(s => s.id === post.id);
    assert.ok(source, post.id);
    assert.equal(post.image, source.file);
    assert.equal(post.width, source.width);
    assert.equal(post.height, source.height);
    await readFile(new URL('../social-media-manager-da-kenh/' + post.image, import.meta.url));
    for (const box of [post.cover, ...(post.frames || []).map(f => f.box)]) {
      const [x,y,w,h] = box.split(' ').map(Number);
      assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x+w <= post.width && y+h <= post.height, post.id + ' ' + box);
    }
  }
});

test('The portfolio does not invent clients, hidden album frames or performance metrics', () => {
  for (const post of posts) {
    for (const field of ['price', 'productId', 'likes', 'voucher', 'followers']) assert.equal(field in post, false);
    assert.equal(/ưu đãi|giảm giá|mua ngay|giỏ hàng|đặt hàng|tồn kho/i.test(post.caption), false);
  }
  assert.equal(posts.find(p => p.id === 'osen-family').frames.length, 5);
  assert.equal(posts.find(p => p.id === 'osen-spa').frames.length, 4);
  assert.ok(posts.filter(p => p.brandKey === 'fashion').every(p => p.brand === 'Thời trang'));
  for (const id of ['ls2-opening-ticket','ls2-opening-store','ls2-store-campaign']) assert.match(posts.find(p => p.id === id).sourceNote, /không phải ưu đãi hiện hành/);
});

test('Static fallback exposes all 15 designs, while browser-only controls remain optional', async () => {
  const html = await readFile(new URL('../social-media-manager-da-kenh/index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/data-post-card=/g) || []).length, 15);
  for (const post of posts) assert.ok(html.includes(`data-post-card="${post.id}"`));
  assert.ok(html.includes('loading="lazy"'));
  assert.ok(html.includes('aria-labelledby="viewer-title"'));
  assert.equal(/MƠ|Mơ studio|mo-studio/i.test(html), false);
});

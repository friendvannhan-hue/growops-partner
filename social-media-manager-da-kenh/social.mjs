import { posts, selectPosts, readSaved, toggleSaved } from './posts.mjs?v=20261027-3';

const storageKey = 'growops-social-gallery-v1';
const ids = posts.map(post => post.id);
const state = { query: '', brand: 'all', savedOnly: false, saved: [] };
try { state.saved = readSaved(localStorage.getItem(storageKey), ids); } catch {}
const byId = id => document.getElementById(id);
const modal = byId('social-viewer');
const stage = byId('viewer-stage');
const cards = [...document.querySelectorAll('[data-post-card]')];
let currentPost = null;
let frameIndex = 0;
let returnFocus = null;
let lastHash = '';
let toastTimer;
let touchStart = null;

function announce(message) {
  const toast = byId('social-toast');
  toast.textContent = message;
  const host = modal.open ? modal : document.body;
  if (toast.parentElement !== host) host.appendChild(toast);
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
}

function updateSavedControls() {
  document.querySelectorAll('[data-save]').forEach(button => {
    const post = posts.find(item => item.id === button.dataset.save);
    if (!post) return;
    const selected = state.saved.includes(post.id);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? 'Bỏ lưu' : 'Lưu'} ${post.title}`);
  });
  document.querySelectorAll('[data-saved-count]').forEach(item => { item.textContent = String(state.saved.length); });
}

function render() {
  const visible = selectPosts(posts, state);
  const visibleIds = new Set(visible.map(post => post.id));
  cards.forEach(card => { card.hidden = !visibleIds.has(card.dataset.postCard); });
  byId('social-empty').hidden = visible.length > 0;
  byId('social-result').textContent = `${visible.length} mẫu & bộ ảnh${state.savedOnly ? ' đã lưu' : ''}`;
  document.querySelectorAll('[data-brand]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.brand === state.brand)); });
  document.querySelector('[data-library-view="saved"]').setAttribute('aria-pressed', String(state.savedOnly));
  byId('active-filter-reset').hidden = !state.query && state.brand === 'all' && !state.savedOnly;
  updateSavedControls();
}

function savePost(id) {
  state.saved = toggleSaved(state.saved, id, ids);
  let persisted = true;
  try { localStorage.setItem(storageKey, JSON.stringify(state.saved)); } catch { persisted = false; }
  render();
  announce(persisted ? (state.saved.includes(id) ? 'Đã lưu mẫu trên trình duyệt này.' : 'Đã bỏ lưu mẫu.') : 'Đã cập nhật trong phiên này. Trình duyệt hiện không cho phép lưu lâu dài.');
}

function resetZoom() {
  stage.dataset.zoomed = 'false';
  byId('viewer-zoom').setAttribute('aria-pressed', 'false');
  byId('viewer-zoom').setAttribute('aria-label', 'Phóng to thiết kế');
  stage.scrollTop = 0;
  stage.scrollLeft = 0;
}

function renderViewer() {
  const post = currentPost;
  if (!post) return;
  resetZoom();
  const frames = post.frames || [{ box: post.cover, label: post.title }];
  const frame = frames[frameIndex];
  const multi = frames.length > 1;
  byId('viewer-brand').textContent = post.brand;
  byId('viewer-title').textContent = post.title;
  byId('viewer-source').textContent = post.sourceNote;
  byId('viewer-caption').textContent = post.caption;
  byId('viewer-original').href = post.image;
  byId('viewer-save').dataset.save = post.id;
  byId('viewer-counter').textContent = multi ? `${frameIndex + 1} / ${frames.length}` : '1 thiết kế';
  byId('viewer-frame-label').textContent = multi ? frame.label : '';
  byId('viewer-previous').hidden = !multi;
  byId('viewer-next').hidden = !multi;
  byId('viewer-frame-label').parentElement.hidden = !multi;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const [, , width, height] = frame.box.split(' ');
  svg.setAttribute('viewBox', frame.box);
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', frame.label);
  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  image.setAttribute('href', post.image);
  image.setAttribute('width', post.width);
  image.setAttribute('height', post.height);
  // Clip the source to the selected frame, including the SVG letterbox area.
  // Without this, tall mobile stages can expose Facebook chrome and adjacent frames.
  const [x, y] = frame.box.split(' ');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clip.setAttribute('id', 'viewer-frame-clip');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  for (const [name, value] of Object.entries({ x, y, width, height })) rect.setAttribute(name, value);
  clip.append(rect); defs.append(clip);
  image.setAttribute('clip-path', 'url(#viewer-frame-clip)');
  svg.append(defs, image);
  byId('viewer-media').replaceChildren(svg);
  updateSavedControls();
}

function openPost(id, changeHash = true) {
  const post = posts.find(item => item.id === id);
  if (!post) return;
  currentPost = post;
  frameIndex = 0;
  if (!modal.open) {
    returnFocus = document.activeElement;
    lastHash = location.hash;
    modal.showModal();
    document.body.classList.add('social-modal-open');
  }
  modal.querySelector('details').open = false;
  renderViewer();
  if (changeHash) history.replaceState(null, '', `#post=${encodeURIComponent(id)}`);
  byId('viewer-close').focus();
}

function stepFrame(step) {
  if (!currentPost?.frames) return;
  frameIndex = (frameIndex + step + currentPost.frames.length) % currentPost.frames.length;
  renderViewer();
}

document.addEventListener('click', event => {
  const openLink = event.target.closest('[data-open-post]');
  if (openLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    event.preventDefault(); openPost(openLink.dataset.openPost); return;
  }
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.save) { savePost(button.dataset.save); return; }
  if (button.dataset.brand) { state.brand = button.dataset.brand; render(); }
  if (button.dataset.libraryView) { state.savedOnly = !state.savedOnly; render(); }
  if (button.hasAttribute('data-reset-filters')) {
    Object.assign(state, { query: '', brand: 'all', savedOnly: false });
    byId('social-search').value = '';
    render();
  }
});

byId('social-search').addEventListener('input', event => { state.query = event.target.value; render(); });
byId('viewer-close').addEventListener('click', () => modal.close());
byId('viewer-previous').addEventListener('click', () => stepFrame(-1));
byId('viewer-next').addEventListener('click', () => stepFrame(1));
byId('viewer-zoom').addEventListener('click', () => {
  const zoomed = stage.dataset.zoomed !== 'true';
  stage.dataset.zoomed = String(zoomed);
  byId('viewer-zoom').setAttribute('aria-pressed', String(zoomed));
  byId('viewer-zoom').setAttribute('aria-label', zoomed ? 'Thu nhỏ thiết kế' : 'Phóng to thiết kế');
});
modal.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); stepFrame(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); stepFrame(1); }
});
// Album navigation does not capture vertical scrolling or pinch zoom.
stage.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 && stage.dataset.zoomed !== 'true'
    ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
stage.addEventListener('touchend', event => {
  if (!touchStart || event.changedTouches.length !== 1) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) stepFrame(dx < 0 ? 1 : -1);
  touchStart = null;
}, { passive: true });
stage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
modal.addEventListener('click', event => {
  if (event.target !== modal) return;
  const rect = modal.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
});
modal.addEventListener('close', () => {
  document.body.classList.remove('social-modal-open');
  if (location.hash.startsWith('#post=')) history.replaceState(null, '', location.pathname + location.search + (lastHash.startsWith('#post=') ? '' : lastHash));
  if (returnFocus?.isConnected && !returnFocus.closest('[hidden]')) returnFocus.focus();
  else byId('social-search').focus();
});
window.addEventListener('storage', event => {
  if (event.key !== storageKey) return;
  state.saved = readSaved(event.newValue, ids); render();
});
document.addEventListener('keydown', event => {
  if (event.key !== '/' || modal.open || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
  event.preventDefault(); byId('social-search').focus();
});
document.querySelectorAll('.artwork-window img').forEach(img => {
  img.addEventListener('error', () => {
    const visual = img.closest('.social-open');
    const message = document.createElement('span');
    message.className = 'social-image-error'; message.textContent = 'Ảnh chưa tải được. Chạm để thử xem bản lớn.';
    visual.append(message);
  }, { once: true });
});

document.documentElement.classList.add('social-enhanced');
render();
const linkedPost = new URLSearchParams(location.hash.slice(1)).get('post');
if (linkedPost) openPost(linkedPost, false);

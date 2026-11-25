// Khối "Ba lớp giải pháp" trên trang chủ: bấm số để mở nội dung ngay tại chỗ.
// Máy tính: luôn có đúng 1 lớp mở (bảng bên phải). Điện thoại: dạng xếp chồng, bấm lại lớp đang mở thì gập.
export function nextOpen(current, clicked, { compact }) {
  if (clicked === current) return compact ? -1 : current;
  return clicked;
}

export function setupSpot(root, media) {
  if (!root || root.dataset.spotReady === 'true') return null;
  const tabs = [...root.querySelectorAll('.gp-spot-tab')];
  const panels = tabs.map(t => root.ownerDocument.getElementById(t.getAttribute('aria-controls')));
  if (!tabs.length || panels.some(p => !p)) return null;
  root.dataset.spotReady = 'true';
  let open = Math.max(0, tabs.findIndex(t => t.getAttribute('aria-expanded') === 'true'));
  const render = () => {
    tabs.forEach((t, i) => {
      t.setAttribute('aria-expanded', String(i === open));
      panels[i].hidden = i !== open;
    });
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    open = nextOpen(open, i, { compact: media.matches });
    render();
    if (open === i && media.matches) t.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }));
  // Về khổ máy tính mà đang gập hết thì mở lại lớp đầu.
  media.addEventListener?.('change', () => { if (!media.matches && open < 0) { open = 0; render(); } });
  render();
  return { tabs, panels, get open() { return open; } };
}

if (typeof document !== 'undefined') {
  setupSpot(document.querySelector('[data-gp-spot]'), matchMedia('(max-width: 767px)'));
}

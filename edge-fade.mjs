// Thanh tab/chip kéo ngang: mờ mép phía còn nội dung, và hiện dòng "Vuốt ngang để xem thêm" cho tới lần vuốt đầu.
// edgeState là hàm thuần để kiểm bằng test; phần DOM chỉ gắn data-edge cho CSS đọc.
export function edgeState({ scrollLeft, scrollWidth, clientWidth }, tolerance = 4) {
  if (scrollWidth - clientWidth <= tolerance) return 'none';
  const atStart = scrollLeft <= tolerance;
  const atEnd = scrollLeft + clientWidth >= scrollWidth - tolerance;
  if (atStart) return 'end';
  if (atEnd) return 'start';
  return 'both';
}

export function setupEdgeFade(el) {
  if (!el || el.dataset.edgeReady === 'true') return null;
  el.dataset.edgeReady = 'true';
  const doc = el.ownerDocument;
  const hint = doc.createElement('p');
  hint.className = 'swipe-hint';
  hint.setAttribute('aria-hidden', 'true');
  hint.textContent = 'Vuốt ngang để xem thêm';
  hint.hidden = true;
  el.after(hint);
  let swiped = false;
  const sync = () => {
    const state = edgeState(el);
    el.dataset.edge = state;
    hint.hidden = swiped || state === 'none';
  };
  // Chỉ coi là "đã vuốt" khi người dùng tự chạm/kéo; thanh Remarketing tự cuộn theo tab đang chạy.
  el.addEventListener('pointerdown', () => { swiped = true; sync(); }, { passive: true });
  el.addEventListener('scroll', sync, { passive: true });
  if ('ResizeObserver' in globalThis) new ResizeObserver(sync).observe(el);
  else globalThis.addEventListener?.('resize', sync);
  sync();
  return { sync, hint };
}

if (typeof document !== 'undefined') {
  const start = () => document.querySelectorAll('[data-rm-tabs], [data-service-filters]').forEach(setupEdgeFade);
  // Thanh tab Remarketing được dựng lại bằng JS; chờ một nhịp để nút đã vào chỗ.
  if (document.readyState === 'complete') requestAnimationFrame(start);
  else addEventListener('load', () => requestAnimationFrame(start), { once: true });
}

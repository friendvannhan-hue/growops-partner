// Native scrolling keeps every original card and its existing controls in place.
export function getRailIndex(cards, viewport) {
  if (!cards.length || !viewport || !Number.isFinite(viewport.width)) return -1;
  const center = viewport.left + viewport.width / 2;
  let selected = -1;
  let distance = Infinity;
  cards.forEach((card, index) => {
    if (!(card.width > 0)) return;
    const next = Math.abs(card.left + card.width / 2 - center);
    if (next < distance) { distance = next; selected = index; }
  });
  return selected;
}

export function stepRailIndex(index, direction, total) {
  if (!Number.isInteger(total) || total < 1) return -1;
  const current = Math.max(0, Math.min(total - 1, Number.isInteger(index) ? index : 0));
  return Math.max(0, Math.min(total - 1, current + (direction < 0 ? -1 : 1)));
}

export function setupMobileRail(host, {key, label}, view = globalThis) {
  if (!host || host.dataset.mobileRailReady === 'true' || typeof view.matchMedia !== 'function') return null;
  const doc = host.ownerDocument;
  const mobile = view.matchMedia('(max-width: 767px)');
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  const previousId = host.id;
  const previousTabIndex = host.getAttribute('tabindex');
  const hadClass = host.classList.contains('mobile-rail');
  const cards = () => [...host.children].filter(card => !card.hidden && card.getBoundingClientRect().width > 0);
  let visible = [];
  let selected = -1;
  let frame = null;
  let destroyed = false;
  const cleanups = [];
  const listen = (node, event, handler, options) => {
    node.addEventListener(event, handler, options);
    cleanups.push(() => node.removeEventListener(event, handler, options));
  };
  const element = (tag, className, text) => {
    const node = doc.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  if (!host.id) host.id = `mobile-rail-${key}`;
  host.classList.add('mobile-rail');
  host.dataset.mobileRailReady = 'true';
  const nav = element('div', 'mobile-rail-nav');
  nav.hidden = true;
  nav.setAttribute('role', 'group');
  nav.setAttribute('aria-label', `Duyệt ${label}`);
  const previous = element('button', 'mobile-rail-prev', '←');
  const next = element('button', 'mobile-rail-next', '→');
  for (const [button, direction] of [[previous, 'trước'], [next, 'tiếp theo']]) {
    button.type = 'button';
    button.setAttribute('aria-controls', host.id);
    button.setAttribute('aria-label', `${label}: xem thẻ ${direction}`);
  }
  const middle = element('div', 'mobile-rail-middle');
  const count = element('span', 'mobile-rail-count');
  count.setAttribute('aria-live', 'polite');
  count.setAttribute('aria-atomic', 'true');
  const dots = element('div', 'mobile-rail-dots');
  dots.setAttribute('aria-hidden', 'true');
  middle.append(count, dots, element('span', 'mobile-rail-hint', 'Vuốt để xem tiếp'));
  nav.append(previous, middle, next);

  function restoreTabIndex() {
    if (previousTabIndex === null) host.removeAttribute('tabindex');
    else host.setAttribute('tabindex', previousTabIndex);
  }
  function update() {
    frame = null;
    if (destroyed || !mobile.matches) return;
    const available = cards();
    const changed = available.length !== visible.length || available.some((card, index) => card !== visible[index]);
    visible = available;
    if (changed) {
      dots.replaceChildren(...visible.map(() => element('span', '')));
      // Filtering must start with an available card, not an empty scroll offset.
      host.scrollLeft = 0;
    }
    selected = getRailIndex(visible.map(card => card.getBoundingClientRect()), host.getBoundingClientRect());
    nav.hidden = visible.length < 2;
    if (visible.length > 1) host.tabIndex = 0;
    else restoreTabIndex();
    const text = `${String(Math.max(0, selected + 1)).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
    if (count.textContent !== text) {
      count.textContent = text;
      count.setAttribute('aria-label', `Thẻ ${Math.max(0, selected + 1)} trên ${visible.length}`);
    }
    [...dots.children].forEach((dot, index) => { dot.dataset.active = String(index === selected); });
    previous.disabled = selected <= 0;
    next.disabled = selected < 0 || selected >= visible.length - 1;
  }
  function queueUpdate() {
    if (destroyed || !mobile.matches || frame !== null) return;
    frame = view.requestAnimationFrame(update);
  }
  function goTo(index) {
    if (index < 0 || !visible[index]) return;
    const bounds = host.getBoundingClientRect();
    const card = visible[index].getBoundingClientRect();
    host.scrollTo({left: host.scrollLeft + card.left - bounds.left, behavior: reduced.matches ? 'auto' : 'smooth'});
    queueUpdate();
  }
  function syncViewport() {
    if (mobile.matches) {
      if (!nav.isConnected) host.after(nav);
      update();
    } else {
      nav.remove();
      restoreTabIndex();
      host.scrollLeft = 0;
    }
  }
  listen(host, 'scroll', queueUpdate, {passive: true});
  listen(previous, 'click', () => goTo(stepRailIndex(selected, -1, visible.length)));
  listen(next, 'click', () => goTo(stepRailIndex(selected, 1, visible.length)));
  listen(host, 'keydown', event => {
    if (!mobile.matches || event.target !== host || !visible.length) return;
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1
      : event.key === 'ArrowRight' ? stepRailIndex(selected, 1, visible.length)
      : event.key === 'ArrowLeft' ? stepRailIndex(selected, -1, visible.length) : null;
    if (index === null) return;
    event.preventDefault();
    goTo(index);
  });
  listen(mobile, 'change', syncViewport);
  listen(view, 'resize', queueUpdate, {passive: true});
  const observer = typeof view.MutationObserver === 'function' ? new view.MutationObserver(queueUpdate) : null;
  observer?.observe(host, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']});
  syncViewport();
  return {
    destroy() {
      destroyed = true;
      if (frame !== null) view.cancelAnimationFrame(frame);
      observer?.disconnect();
      cleanups.forEach(cleanup => cleanup());
      nav.remove();
      restoreTabIndex();
      if (!hadClass) host.classList.remove('mobile-rail');
      if (!previousId) host.removeAttribute('id');
      delete host.dataset.mobileRailReady;
    },
  };
}

if (typeof document !== 'undefined') {
  for (const config of [
    {selector: '#solution-ecosystem .flow-solutions', key: 'solutions', label: 'nhóm giải pháp'},
    {selector: '#operating-trio .flow-trio-steps', key: 'trio', label: 'năng lực điều phối'},
    {selector: '#tools .tool-atlas', key: 'tools', label: 'nhóm công cụ'},
    {selector: '#oa-brand-grid', key: 'oa', label: 'thương hiệu Zalo OA'},
  ]) setupMobileRail(document.querySelector(config.selector), config);
}

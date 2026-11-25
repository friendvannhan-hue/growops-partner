const validIndex = (index, list) => Number.isInteger(index) && index >= 0 && index < list.length;
const ROTATION_MS = 4200;

export function selectCategory(categories, state, index) {
  if (!validIndex(index, categories) || !categories[index].items?.length || index === state.category) return state;
  return { category: index, item: 0 };
}

export function selectItem(categories, state, index) {
  const items = categories[state.category]?.items || [];
  if (!validIndex(index, items)) return state;
  return { category: state.category, item: index };
}

export function nextItem(categories, state) {
  const items = categories[state.category]?.items || [];
  if (!items.length || !validIndex(state.item, items)) return state;
  return { category: state.category, item: (state.item + 1) % items.length };
}

export function nextShowcase(categories, state) {
  const items = categories[state.category]?.items || [];
  if (!items.length || !validIndex(state.item, items)) return state;
  if (state.item + 1 < items.length) return { category: state.category, item: state.item + 1 };
  for (let offset = 1; offset <= categories.length; offset += 1) {
    const category = (state.category + offset) % categories.length;
    if (categories[category].items?.length) return { category, item: 0 };
  }
  return state;
}

// A single cancellable timeout avoids queued slides after a tab becomes visible again.
export function createRotationTimer(onTick, options = {}) {
  const schedule = options.schedule || ((callback, delay) => setTimeout(callback, delay));
  const cancel = options.cancel || ((id) => clearTimeout(id));
  const duration = Number.isFinite(options.duration) ? Math.max(1000, Math.min(6500, options.duration)) : ROTATION_MS;
  let id = null;
  let running = false;
  let disposed = false;
  const queue = () => {
    if (!running || disposed || id !== null) return;
    id = schedule(() => {
      id = null;
      if (!running || disposed) return;
      onTick();
      queue();
    }, duration);
  };
  return {
    setRunning(value) {
      if (disposed) return;
      running = Boolean(value);
      if (!running && id !== null) { cancel(id); id = null; }
      queue();
    },
    dispose() {
      disposed = true;
      running = false;
      if (id !== null) cancel(id);
      id = null;
    },
  };
}

export function setupRemarketing(root, categories, view = globalThis) {
  if (!root || root.dataset.remarketingReady === 'true' || !Array.isArray(categories) || !categories.length) return null;
  const doc = root.ownerDocument;
  const tabsHost = root.querySelector('[data-rm-tabs]');
  const stage = root.querySelector('[data-rm-stage]');
  const optionsHost = root.querySelector('[data-rm-options]');
  const toggle = root.querySelector('[data-rm-toggle]');
  const panel = root.querySelector('[data-rm-panel]');
  const kicker = root.querySelector('[data-rm-kicker]');
  const description = root.querySelector('[data-rm-description]');
  const count = root.querySelector('[data-rm-count]');
  const status = root.querySelector('[data-rm-status]');
  const mobileSummary = root.querySelector('[data-rm-mobile-summary]');
  const mobileRule = root.querySelector('[data-rm-mobile-rule]');
  const ruleNote = (text) => { const note = element('p', 'rm-option-rule'); note.append(element('b', '', 'Luật gửi (minh họa)'), document.createTextNode(text)); return note; };
  if (!tabsHost || !stage || !optionsHost || !toggle || categories.some((category) => !category.id || !category.items?.length)) return null;

  const media = typeof view.matchMedia === 'function' ? view.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  let state = { category: 0, item: 0 };
  let userPaused = Boolean(media.matches);
  // Khách bấm/cuộn xem mẫu: chỉ dừng tạm, tự chạy lại sau RESUME_MS (anh muốn dải luôn tự chạy).
  let browsing = false;
  let resumeTimer;
  const RESUME_MS = 8000;
  let hover = false;
  let focused = false;
  let inView = typeof view.IntersectionObserver !== 'function';
  let destroyed = false;
  const cleanups = [];
  const listen = (node, event, handler) => {
    node.addEventListener(event, handler);
    cleanups.push(() => node.removeEventListener(event, handler));
  };
  const element = (tag, className, text) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const padded = (value) => String(value).padStart(2, '0');
  const uniqueId = root.id || 'remarketing';
  const current = () => categories[state.category];
  const currentItem = () => current().items[state.item];
  const hasMultipleMessages = categories.reduce((total, category) => total + category.items.length, 0) > 1;
  root.style.setProperty('--rm-cycle', `${ROTATION_MS}ms`);

  function keepVisible(host, child) {
    if (!child || host.scrollWidth <= host.clientWidth) return;
    const bounds = host.getBoundingClientRect();
    const selected = child.getBoundingClientRect();
    const left = selected.left - bounds.left;
    const right = selected.right - bounds.right;
    if (left < 0) host.scrollLeft += left - 8;
    else if (right > 0) host.scrollLeft += right + 8;
  }

  function chip(className, label, text, icon) {
    const chipNode = element('div', `rm-chip ${className}`);
    chipNode.setAttribute('aria-hidden', 'true');
    const mark = element('span', `rm-chip-mark rm-chip-mark--${icon}`);
    const copy = element('div', 'rm-chip-copy');
    copy.append(element('span', 'rm-chip-label', label), element('strong', '', text));
    chipNode.append(mark, copy);
    return chipNode;
  }

  function sourceImage(item) {
    const crop = item.crop;
    const hasCrop = crop && ['x', 'y', 'width', 'height', 'sourceWidth', 'sourceHeight'].every((key) => Number.isFinite(crop[key])) && crop.width > 0 && crop.height > 0 && crop.sourceWidth > 0 && crop.sourceHeight > 0 && crop.x >= 0 && crop.y >= 0;
    const frame = element('div', hasCrop ? 'rm-source-crop' : 'rm-source-full');
    const image = element('img', 'rm-source-image');
    image.src = item.image;
    image.alt = `Mẫu tin ${item.brand}: ${item.title}`;
    if (typeof item.transcript === 'string' && item.transcript.trim()) {
      image.setAttribute('aria-describedby', `${uniqueId}-transcript-${item.id}`);
    }
    image.decoding = 'async';
    image.loading = 'lazy';
    if (hasCrop) {
      frame.style.aspectRatio = `${crop.width} / ${crop.height}`;
      frame.style.setProperty('--crop-ratio', String(crop.width / crop.height));
      image.style.width = `${crop.sourceWidth / crop.width * 100}%`;
      image.style.left = `${-crop.x / crop.width * 100}%`;
      image.style.top = `${-crop.y / crop.height * 100}%`;
      image.width = crop.sourceWidth;
      image.height = crop.sourceHeight;
    }
    frame.append(image);
    return frame;
  }

  function illustrativeMessage(item) {
    const card = element('article', 'rm-message');
    card.append(element('span', 'rm-message-type', 'Kịch bản minh họa'));
    if (item.smallTitle) card.append(element('p', 'rm-message-eyebrow', item.smallTitle));
    card.append(element('h3', 'rm-message-title', item.title));
    if (item.greeting) card.append(element('p', 'rm-message-greeting', item.greeting));
    for (const text of item.body || []) card.append(element('p', 'rm-message-body', text));
    if (item.offer) {
      const offer = element('div', 'rm-message-offer');
      if (item.offer.title) offer.append(element('strong', '', item.offer.title));
      if (item.offer.detail) offer.append(element('span', '', item.offer.detail));
      card.append(offer);
    }
    if (item.cta) card.append(element('span', 'rm-message-cta', `${item.cta}  →`));
    return card;
  }

  function renderStage() {
    hover = false;
    const category = current();
    const item = currentItem();
    const figure = element('figure', `rm-phone${item.source === 'actual' ? ' rm-phone--actual' : ''}`);
    const screen = element('div', 'rm-phone-screen');
    const deviceStatus = element('div', 'rm-device-status');
    deviceStatus.setAttribute('aria-hidden', 'true');
    deviceStatus.append(element('span', '', '9:41'), element('span', 'rm-device-island'), element('span', 'rm-device-bars', '▰'));
    const header = element('div', 'rm-phone-header');
    const avatar = element('div', 'rm-brand-avatar');
    if (item.logo) {
      const logo = element('img');
      logo.src = item.logo;
      logo.alt = '';
      logo.loading = 'lazy';
      logo.decoding = 'async';
      avatar.append(logo);
    } else avatar.append(element('span', '', item.brand?.charAt(0) || 'G'));
    const brand = element('div', 'rm-phone-brand');
    brand.append(element('strong', '', item.brand), element('span', '', 'Zalo Official Account'));
    header.append(avatar, brand, element('span', 'rm-verified', '✓'));
    const content = element('div', 'rm-screen-content');
    const actual = item.source === 'actual' && item.image;
    content.setAttribute('tabindex', '0');
    content.setAttribute('role', 'region');
    content.setAttribute('aria-label', `${actual ? 'Mẫu tin tham khảo' : 'Kịch bản minh họa'} của ${item.brand}. Cuộn để xem toàn bộ nội dung.`);
    const messageView = element('div', 'rm-message-view');
    messageView.append(actual ? sourceImage(item) : illustrativeMessage(item));
    content.append(messageView);
    content.addEventListener('mouseenter', () => { hover = true; updateMotion(); });
    content.addEventListener('mouseleave', () => { hover = false; updateMotion(); });
    content.addEventListener('scroll', () => holdBriefly(), { passive: true });
    content.addEventListener('pointerdown', () => holdBriefly());
    screen.append(deviceStatus, header, content, element('div', 'rm-device-home'));
    const caption = element('figcaption', 'rm-source-caption');
    caption.append(element('span', 'rm-source-dot'), doc.createTextNode(actual ? 'Mẫu tin tham khảo' : 'Kịch bản minh họa'));
    figure.append(screen, caption);
    if (actual && typeof item.transcript === 'string' && item.transcript.trim()) {
      const transcript = element('p', 'rm-sr-only', item.transcript);
      transcript.id = `${uniqueId}-transcript-${item.id}`;
      figure.append(transcript);
    }
    const popups = element('div', 'rm-popups');
    popups.setAttribute('aria-hidden', 'true');
    const popupCopy = [
      ['one', '<svg class="ga-i" viewBox="0 0 24 24" fill="none" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M8 15C12.8747 15 15 12.949 15 8C15 12.949 17.1104 15 22 15C17.1104 15 15 17.1104 15 22C15 17.1104 12.8747 15 8 15Z" stroke="currentColor" stroke-linejoin="round"/><path d="M2 6.5C5.13376 6.5 6.5 5.18153 6.5 2C6.5 5.18153 7.85669 6.5 11 6.5C7.85669 6.5 6.5 7.85669 6.5 11C6.5 7.85669 5.13376 6.5 2 6.5Z" stroke="currentColor" stroke-linejoin="round"/></svg>', item.tag || category.label],
      ['two', '<svg class="ga-i" viewBox="0 0 24 24" fill="none" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M6.00005 19L19 5.99996M19 5.99996V18.48M19 5.99996H6.52005" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>', 'Kết nối đúng lúc'],
      ['three', '<svg class="ga-i" viewBox="0 0 24 24" fill="none" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M22 8.86222C22 10.4087 21.4062 11.8941 20.3458 12.9929C17.9049 15.523 15.5374 18.1613 13.0053 20.5997C12.4249 21.1505 11.5042 21.1304 10.9488 20.5547L3.65376 12.9929C1.44875 10.7072 1.44875 7.01723 3.65376 4.73157C5.88044 2.42345 9.50794 2.42345 11.7346 4.73157L11.9998 5.00642L12.2648 4.73173C13.3324 3.6245 14.7864 3 16.3053 3C17.8242 3 19.2781 3.62444 20.3458 4.73157C21.4063 5.83045 22 7.31577 22 8.86222Z" stroke="currentColor" stroke-linejoin="round"/></svg>', 'Thêm một lần nhớ Brand'],
    ];
    for (const [position, svg, text] of popupCopy) {
      const bubble = element('div', `rm-pop-bubble rm-pop-bubble--${position}`);
      const badge = element('span', 'rm-pop-icon');
      badge.innerHTML = svg; // Icon Iconoir tĩnh, không lấy từ dữ liệu
      bubble.append(badge, element('span', 'rm-pop-copy', text));
      popups.append(bubble);
    }
    stage.replaceChildren(
      element('span', 'rm-stage-orbit rm-stage-orbit--one'),
      element('span', 'rm-stage-orbit rm-stage-orbit--two'),
      chip('rm-chip--context', 'Điểm chạm', item.chipTitle || item.tag || category.label, 'message'),
      figure,
      chip('rm-chip--response', 'Theo hành trình', item.chipDetail || category.label, 'arrow'),
      popups,
    );
  }

  const tabButtons = categories.map((category, index) => {
    const tab = element('button', 'rm-tab', category.label);
    tab.type = 'button';
    tab.id = `${uniqueId}-tab-${index}`;
    tab.dataset.rmCategory = String(index);
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel?.id || `${uniqueId}-panel`);
    listen(tab, 'click', () => chooseCategory(index));
    listen(tab, 'keydown', (event) => {
      const target = keyboardIndex(event.key, index, categories.length, false);
      if (target === null) return;
      event.preventDefault();
      chooseCategory(target);
      tabButtons[target].focus({ preventScroll: true });
    });
    return tab;
  });
  tabsHost.setAttribute('role', 'tablist');
  tabsHost.replaceChildren(...tabButtons);
  if (panel) {
    if (!panel.id) panel.id = `${uniqueId}-panel`;
    panel.setAttribute('role', 'tabpanel');
  }

  function keyboardIndex(key, index, length, vertical) {
    if (key === 'Home') return 0;
    if (key === 'End') return length - 1;
    if (key === 'ArrowRight' || (vertical && key === 'ArrowDown')) return (index + 1) % length;
    if (key === 'ArrowLeft' || (vertical && key === 'ArrowUp')) return (index + length - 1) % length;
    return null;
  }

  let optionButtons = [];
  function renderOptions() {
    optionButtons = [];
    const options = current().items.map((item, index) => {
      const active = index === state.item;
      const row = element('div', 'rm-option');
      row.dataset.active = String(active);
      const rail = element('span', 'rm-option-rail');
      rail.setAttribute('aria-hidden', 'true');
      rail.append(element('span', 'rm-option-progress'));
      const button = element('button', 'rm-option-button');
      button.type = 'button';
      button.dataset.rmItem = String(index);
      button.id = `${uniqueId}-item-${state.category}-${index}`;
      button.setAttribute('aria-expanded', String(active));
      const copy = element('span', 'rm-option-copy');
      copy.append(element('span', 'rm-option-brand', item.brand), element('span', 'rm-option-title', item.title));
      const number = element('span', 'rm-option-number', padded(index + 1));
      number.setAttribute('aria-hidden', 'true');
      const indicator = element('span', 'rm-option-indicator', active ? '−' : '+');
      indicator.setAttribute('aria-hidden', 'true');
      button.append(number, copy, indicator);
      const detail = element('div', 'rm-option-detail');
      detail.id = `${uniqueId}-detail-${state.category}-${index}`;
      detail.hidden = !active;
      button.setAttribute('aria-controls', detail.id);
      detail.append(element('p', '', item.description));
      if (item.rule) detail.append(ruleNote(item.rule));
      const tag = element('span', 'rm-option-tag', item.tag || current().label);
      detail.append(tag);
      button.addEventListener('click', () => chooseItem(index));
      button.addEventListener('keydown', (event) => {
        const target = keyboardIndex(event.key, index, current().items.length, true);
        if (target === null) return;
        event.preventDefault();
        chooseItem(target);
        optionButtons[target]?.focus({ preventScroll: true });
      });
      optionButtons.push(button);
      row.append(rail, button, detail);
      return row;
    });
    optionsHost.replaceChildren(...options);
  }

  function announce() {
    if (status) status.textContent = `${current().label}. ${currentItem().brand}: ${currentItem().title}.`;
  }
  function chooseCategory(index) {
    const selected = selectCategory(categories, state, index);
    holdBriefly();
    if (selected === state) { updateMotion(); announce(); return; }
    state = selected;
    render();
    announce();
  }
  function chooseItem(index) {
    const selected = selectItem(categories, state, index);
    holdBriefly();
    if (selected.item === state.item) { updateMotion(); announce(); return; }
    const hadFocus = optionsHost.contains(doc.activeElement);
    state = selected;
    render();
    if (hadFocus) optionButtons[index]?.focus({ preventScroll: true });
    announce();
  }
  const timer = createRotationTimer(() => {
    state = nextShowcase(categories, state);
    render();
  }, {
    schedule: (callback, delay) => view.setTimeout(callback, delay),
    cancel: (id) => view.clearTimeout(id),
    duration: ROTATION_MS,
  });

  function holdBriefly() {
    browsing = true;
    view.clearTimeout?.(resumeTimer);
    resumeTimer = view.setTimeout?.(() => { browsing = false; updateMotion(); }, RESUME_MS);
    updateMotion();
  }
  function updateMotion() {
    if (destroyed) return;
    const running = !userPaused && !browsing && !hover && !focused && inView && doc.visibilityState !== 'hidden' && hasMultipleMessages;
    const wasRunning = root.dataset.rmRunning === 'true';
    root.dataset.rmRunning = String(running);
    root.dataset.rmUserPaused = String(userPaused);
    root.dataset.rmReduced = String(media.matches);
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.textContent = userPaused ? 'Tự động chuyển mẫu' : 'Tạm dừng chuyển mẫu';
    toggle.setAttribute('aria-label', userPaused ? 'Bật tự động chuyển mẫu tin' : 'Tạm dừng tự động chuyển mẫu tin');
    if (running && !wasRunning) {
      // Resuming starts a full interval, so the visible rail and timer agree.
      const progress = optionsHost.querySelector('[data-active="true"] .rm-option-progress');
      if (progress) { progress.style.animation = 'none'; void progress.offsetHeight; progress.style.animation = ''; }
    }
    timer.setRunning(running);
  }
  function render() {
    tabButtons.forEach((tab, index) => {
      const active = index === state.category;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panel?.setAttribute('aria-labelledby', tabButtons[state.category].id);
    if (kicker) kicker.textContent = current().kicker || '';
    if (description) description.textContent = current().description || '';
    if (mobileSummary) mobileSummary.textContent = currentItem().description || '';
    if (mobileRule) {
      mobileRule.replaceChildren(...(currentItem().rule ? ruleNote(currentItem().rule).childNodes : []));
      mobileRule.style.animation = 'none'; void mobileRule.offsetWidth; mobileRule.style.animation = '';
    }
    if (count) count.textContent = `${padded(state.item + 1)} / ${padded(current().items.length)}`;
    root.dataset.rmCategory = current().id;
    root.dataset.rmItem = currentItem().id;
    renderStage();
    renderOptions();
    keepVisible(tabsHost, tabButtons[state.category]);
    keepVisible(optionsHost, optionButtons[state.item]?.closest('.rm-option'));
    updateMotion();
  }

  listen(toggle, 'click', () => { userPaused = !userPaused; updateMotion(); });
  const pauseForBrowsing = () => holdBriefly();
  listen(tabsHost, 'pointerdown', pauseForBrowsing);
  listen(optionsHost, 'pointerdown', pauseForBrowsing);
  listen(root, 'mouseleave', () => { hover = false; updateMotion(); });
  // Chỉ dừng khi đi bằng bàn phím; chạm/bấm chuột đã có holdBriefly.
  listen(root, 'focusin', (event) => { focused = !toggle.contains(event.target) && Boolean(event.target?.matches?.(':focus-visible')); updateMotion(); });
  listen(root, 'focusout', (event) => {
    focused = root.contains(event.relatedTarget) && !toggle.contains(event.relatedTarget) && Boolean(event.relatedTarget?.matches?.(':focus-visible'));
    updateMotion();
  });
  listen(doc, 'visibilitychange', updateMotion);
  const motionChange = () => {
    if (media.matches) userPaused = true;
    updateMotion();
  };
  media.addEventListener?.('change', motionChange);
  cleanups.push(() => media.removeEventListener?.('change', motionChange));
  let observer;
  if (typeof view.IntersectionObserver === 'function') {
    observer = new view.IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      updateMotion();
    }, { threshold: 0.1 });
    observer.observe(root);
  }
  root.dataset.remarketingReady = 'true';
  toggle.hidden = false;
  render();
  return {
    destroy() {
      destroyed = true;
      view.clearTimeout?.(resumeTimer);
      timer.dispose();
      observer?.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      root.dataset.rmRunning = 'false';
      delete root.dataset.remarketingReady;
    },
    getState: () => ({ ...state, userPaused }),
  };
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-remarketing]');
  if (root) import('./remarketing-data.mjs')
    .then(({ categories }) => setupRemarketing(root, categories))
    .catch((error) => console.warn('Remarketing showcase kept its static view:', error));
}

// Chuyển động kiểu link.me: chỉ chạy khi phần tử đang trong màn hình, tôn trọng "giảm chuyển động".
// Không có JS hoặc tắt chuyển động => nội dung vẫn hiện đầy đủ (trạng thái tĩnh).

// Chọn các khối tiêu đề sẽ "trồi lên" khi cuộn tới: eyebrow, h2 và đoạn dẫn ngay sau h2.
export function riseTargets(root) {
  const picked = new Set();
  root.querySelectorAll('#main-content > section:not(.ga-hero) h2:not(.sr-only)').forEach(h2 => {
    picked.add(h2);
    const next = h2.nextElementSibling;
    if (next && next.tagName === 'P') picked.add(next);
    const prev = h2.previousElementSibling;
    if (prev && prev.tagName === 'P' && prev.textContent.trim().length < 60) picked.add(prev);
  });
  return [...picked];
}

// Mục chi tiết luôn mở (anh yêu cầu 25/11/2026), trừ các mục gắn data-fold: khách tự bấm mở/gập
// (khối chi phí, phạm vi triển khai — anh chỉnh lại cùng ngày).
// Bắt sự kiện ở gốc nên cả các mục do JS tạo sau (bản di động) cũng không gập được.
export function lockOpen(root) {
  root.querySelectorAll('#main-content details:not([data-fold])').forEach(d => {
    d.open = true;
    const s = d.querySelector(':scope > summary');
    if (s) s.tabIndex = -1;
  });
  root.addEventListener('click', e => {
    const s = e.target?.closest?.('#main-content summary');
    if (s && !s.parentElement?.hasAttribute?.('data-fold')) e.preventDefault();
  }, true);
}

// Số đếm lên khi cuộn tới (kiểu Haravan). Chỉ số nguyên viết kiểu Việt "66.574"; giữ nguyên chữ gốc khi xong.
export function parseViNumber(text) {
  const t = String(text).trim();
  return /^\d{1,3}(\.\d{3})*$/.test(t) ? Number(t.replace(/\./g, '')) : null;
}
export function formatViNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

if (typeof document !== 'undefined') lockOpen(document);

if (typeof document !== 'undefined' && typeof IntersectionObserver === 'function') {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // Hoạt cảnh lặp (sơ đồ nguồn lực, quầng sáng): tạm dừng khi ra khỏi màn hình để đỡ tốn pin.
  const live = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('is-on', e.isIntersecting));
  }, { threshold: 0.15 });
  document.querySelectorAll('.ga-hero, [data-flow]').forEach(el => live.observe(el));

  if (!reduce.matches) {
    const targets = riseTargets(document);
    targets.forEach(el => {
      el.classList.add('go-rise');
      const group = el.parentElement ? [...el.parentElement.children].filter(c => targets.includes(c)) : [];
      el.style.setProperty('--d', String(Math.max(0, group.indexOf(el))));
    });
    document.documentElement.classList.add('go-motion');
    const once = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        once.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    // Danh sách gắn data-stagger: từng thẻ con trồi lên lần lượt khi cuộn tới.
    document.querySelectorAll('[data-stagger]').forEach(list => [...list.children].forEach((el, i) => {
      el.classList.add('go-rise');
      el.style.setProperty('--d', String(i + 1));
      targets.push(el);
    }));
    targets.forEach(el => {
      // Đã nằm trên màn hình lúc tải (vd. mở bằng #neo) thì hiện ngay, không bắt chờ.
      if (el.getBoundingClientRect().top < innerHeight * 0.9) el.classList.add('is-in');
      else once.observe(el);
    });

    // Đếm số
    const counters = [...document.querySelectorAll('.proof-number-value > span:first-child, .oa-followers > strong')]
      .filter(el => el.childElementCount === 0 && parseViNumber(el.textContent) !== null);
    const count = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        count.unobserve(e.target);
        const el = e.target, final = el.textContent, target = parseViNumber(final), t0 = performance.now(), dur = 1400;
        el.style.fontVariantNumeric = 'tabular-nums';
        const tick = now => {
          const k = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
          el.textContent = k < 1 ? formatViNumber(target * eased) : final;
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => count.observe(el));
  }
}

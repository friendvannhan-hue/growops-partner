// Nút tư vấn dính đáy trên mobile: hiện sau khi cuộn qua phần đầu trang, ẩn khi tới chân trang liên hệ.
// Cũng ẩn khi một nút Zalo khác đang trên màn hình, tránh hai nút đen giống nhau chồng lên nhau,
// và khi người đọc đang mở một mục gập (data-fold) trên màn hình, để nút không che phần đang đọc.
export function dockVisible({ pastHero, contactInView, ctaInView = 0, foldOpenInView = 0 }) {
  return Boolean(pastHero && !contactInView && ctaInView <= 0 && foldOpenInView <= 0);
}

if (typeof document !== 'undefined') {
  const dock = document.querySelector('[data-dock]');
  const hero = document.querySelector('[data-dock-after]');
  const contact = document.querySelector('#contact, .services-help, .social-contact');
  if (dock && hero && 'IntersectionObserver' in window) {
    const state = { pastHero: false, contactInView: false, ctaInView: 0, foldOpenInView: 0 };
    const sync = () => {
      const show = dockVisible(state);
      dock.classList.toggle('is-visible', show);
      dock.inert = !show;
      dock.setAttribute('aria-hidden', String(!show));
    };
    new IntersectionObserver(([entry]) => {
      state.pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      sync();
    }).observe(hero);
    if (contact) {
      new IntersectionObserver(([entry]) => {
        state.contactInView = entry.isIntersecting;
        sync();
      }).observe(contact);
    }
    const seen = new Set();
    const ctaObserver = new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      state.ctaInView = seen.size;
      sync();
    });
    document.querySelectorAll('#main-content a[href*="zalo.me"]').forEach(a => {
      if (!a.closest('[data-dock]') && !hero.contains(a)) ctaObserver.observe(a);
    });
    const folds = [...document.querySelectorAll('#main-content details[data-fold]')];
    const foldsOnScreen = new Set();
    const countOpenFolds = () => {
      state.foldOpenInView = [...foldsOnScreen].filter(d => d.open).length;
      sync();
    };
    const foldObserver = new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? foldsOnScreen.add(e.target) : foldsOnScreen.delete(e.target)));
      countOpenFolds();
    });
    folds.forEach(d => { foldObserver.observe(d); d.addEventListener('toggle', countOpenFolds); });
    sync();
  }
}

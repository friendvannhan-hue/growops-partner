// Keep one accessible set; the second set is a decorative seamless-loop copy.
const root = document.querySelector('#experience');
const toggle = root?.querySelector('.experience-motion-toggle');
const rails = [...(root?.querySelectorAll('[data-portfolio-rail]') || [])];
if (root && toggle && rails.length && typeof matchMedia === 'function') {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  rails.forEach((rail) => {
    const track = rail.querySelector('.portfolio-track');
    const group = track?.firstElementChild;
    if (!group) return;
    const copy = group.cloneNode(true);
    copy.classList.add('portfolio-copy');
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('inert', '');
    copy.removeAttribute('aria-label');
    copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    copy.querySelectorAll('img').forEach((img) => { img.alt = ''; img.loading = 'eager'; });
    track.appendChild(copy);
  });
  const refresh = () => {
    root.dataset.railsMoving = String(!paused && !reduced.matches);
    root.dataset.documentVisible = String(!document.hidden);
    toggle.hidden = reduced.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Bật chuyển động' : 'Tạm dừng · xem tất cả';
  };
  toggle.addEventListener('click', () => { paused = !paused; refresh(); });
  reduced.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver((entries) => entries.forEach(({target,isIntersecting}) => {
      target.dataset.railVisible = String(isIntersecting);
    }));
    rails.forEach((rail) => observer.observe(rail));
  } else rails.forEach((rail) => { rail.dataset.railVisible = 'true'; });
  refresh();
}

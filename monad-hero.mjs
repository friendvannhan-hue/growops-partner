// This changes presentation only; the diagram is readable without JavaScript.
const pipeline = document.querySelector('.monad-pipeline');
const toggle = pipeline?.querySelector('.monad-motion-toggle');
if (pipeline && toggle) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  const refresh = () => {
    pipeline.dataset.heroPaused = String(paused || reduced.matches);
    toggle.hidden = reduced.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Tiếp tục hiệu ứng' : 'Tạm dừng hiệu ứng';
  };
  toggle.addEventListener('click', () => { paused = !paused; refresh(); });
  reduced.addEventListener('change', refresh);
  refresh();
}

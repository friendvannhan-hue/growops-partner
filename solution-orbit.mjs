// A single perimeter signal; no content or reading order depends on animation.
const maps = [...document.querySelectorAll('[data-orbit-frame]')];
const visibleMaps = new Set();
const refresh = () => maps.forEach((map) => {
  map.dataset.orbitActive = String(!document.hidden && visibleMaps.has(map));
});
if (typeof IntersectionObserver === 'function') {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) visibleMaps.add(target);
      else visibleMaps.delete(target);
    });
    refresh();
  });
  maps.forEach((map) => observer.observe(map));
} else {
  maps.forEach((map) => visibleMaps.add(map));
  refresh();
}
document.addEventListener('visibilitychange', refresh);

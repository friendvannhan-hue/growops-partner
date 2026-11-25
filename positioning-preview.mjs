// Keep existing deep links useful when their content sits in a closed disclosure.
export function openTargetAncestors(target) {
  const ancestors = [];
  for (let node = target?.parentElement; node; node = node.parentElement) {
    if (node.tagName === 'DETAILS') ancestors.push(node);
  }
  ancestors.reverse().forEach(node => { node.open = true; });
  return ancestors.length;
}

if (typeof document !== 'undefined') {
  function revealHash() {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (target && openTargetAncestors(target)) {
      if (target.matches('[data-integration-panel]')) {
        document.querySelector(`[data-integration-select="${target.dataset.integrationPanel}"]`)?.click();
      }
      if (target.matches('[data-feature-panel]')) {
        document.querySelector(`[data-feature="${target.dataset.featurePanel}"]`)?.click();
      }
      requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
    }
  }
  addEventListener('hashchange', revealHash);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link?.hash === location.hash) revealHash();
  });
  revealHash();
}

export function integrationKeyIndex(key, index, length) {
  if (!Number.isInteger(length) || length < 1 || !Number.isInteger(index) || index < 0 || index >= length) return null;
  if (key === 'ArrowDown' || key === 'ArrowRight') return (index + 1) % length;
  if (key === 'ArrowUp' || key === 'ArrowLeft') return (index - 1 + length) % length;
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  return null;
}

export function setupIntegrationExplorer(root = document) {
  const host = root.querySelector('.integration-browser');
  const picker = host?.querySelector('.integration-picker');
  if (!host || !picker || host.dataset.integrationReady === 'true') return;
  const buttons = [...picker.querySelectorAll('[data-integration-select]')];
  const panels = [...host.querySelectorAll('[data-integration-panel]')];
  const keys = buttons.map(button => button.dataset.integrationSelect);
  if (!buttons.length || buttons.length !== panels.length || new Set(keys).size !== keys.length ||
      new Set(panels.map(panel => panel.dataset.integrationPanel)).size !== panels.length ||
      panels.some(panel => !buttons.some(button => button.dataset.integrationSelect === panel.dataset.integrationPanel &&
        button.getAttribute('aria-controls') === panel.id))) return;

  const select = (key, focus = false) => {
    if (!keys.includes(key)) return;
    buttons.forEach(button => {
      const active = button.dataset.integrationSelect === key;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus({preventScroll: true});
      if (active && picker.scrollWidth > picker.clientWidth) {
        const bounds = picker.getBoundingClientRect();
        const selected = button.getBoundingClientRect();
        if (selected.left < bounds.left) picker.scrollLeft += selected.left - bounds.left;
        else if (selected.right > bounds.right) picker.scrollLeft += selected.right - bounds.right;
      }
    });
    panels.forEach(panel => {
      const active = panel.dataset.integrationPanel === key;
      panel.hidden = !active;
      panel.dataset.selected = String(active);
    });
  };

  buttons.forEach((button, index) => {
    const key = button.dataset.integrationSelect;
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => select(key));
    button.addEventListener('keydown', event => {
      const next = integrationKeyIndex(event.key, index, buttons.length);
      if (next === null) return;
      event.preventDefault();
      select(keys[next], true);
    });
  });
  panels.forEach(panel => {
    const button = buttons.find(item => item.dataset.integrationSelect === panel.dataset.integrationPanel);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.tabIndex = 0;
  });
  select(keys[0]);
  const mobile = host.ownerDocument.defaultView?.matchMedia('(max-width: 767px)');
  const syncOrientation = () => picker.setAttribute('aria-orientation', mobile?.matches ? 'horizontal' : 'vertical');
  mobile?.addEventListener('change', syncOrientation);
  syncOrientation();
  picker.hidden = false;
  host.dataset.integrationReady = 'true';
}

if (typeof document !== 'undefined') setupIntegrationExplorer();

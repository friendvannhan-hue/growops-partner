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
      if (active && focus) button.focus();
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
      const next = event.key === 'ArrowDown' ? (index + 1) % buttons.length
        : event.key === 'ArrowUp' ? (index - 1 + buttons.length) % buttons.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null;
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
  picker.hidden = false;
  host.dataset.integrationReady = 'true';
}

if (typeof document !== 'undefined') setupIntegrationExplorer();

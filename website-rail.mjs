export function setupWebsiteRail(root = document) {
  const grid = root.querySelector('.website-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.website-card')];
  const buttons = cards.map(card => card.querySelector('.website-select'));
  const details = cards.map(card => card.querySelector('.website-detail'));
  if (!cards.length || buttons.some(button => !button) || details.some(detail => !detail)) return;
  const status = root.querySelector('.website-rail-status');
  const activate = (index, announce = true) => {
    cards.forEach((card, position) => {
      const active = position === index;
      card.dataset.active = String(active);
      buttons[position].setAttribute('aria-expanded', String(active));
      details[position].hidden = !active;
    });
    if (announce && status) status.textContent = `Dự án đang xem: ${details[index].querySelector('h4').textContent}.`;
  };
  buttons.forEach((button, index) => {
    button.hidden = false;
    button.addEventListener('click', () => activate(index));
    button.addEventListener('focus', () => activate(index));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % cards.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + cards.length) % cards.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = cards.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
    });
    cards[index].addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !matchMedia('(min-width:1101px) and (hover:hover)').matches) return;
      const focused = root.activeElement;
      if (focused && grid.contains(focused) && focused.matches(':focus-visible')) return;
      activate(index, false);
    });
  });
  grid.dataset.enhanced = 'true';
  activate(0, false);
}
if (typeof document !== 'undefined') setupWebsiteRail();

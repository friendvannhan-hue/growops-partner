const portfolio = document.querySelector('#oa-growth');
const controls = portfolio?.querySelector('.oa-stage-legend');
const grid = portfolio?.querySelector('.oa-growth-grid');
const status = portfolio?.querySelector('.oa-filter-status');
if (portfolio && controls && grid && status) {
  const buttons = [...controls.querySelectorAll('[data-oa-filter]')];
  const cards = [...grid.querySelectorAll('.oa-growth-card')];
  for (const button of buttons) button.addEventListener('click', () => {
    const filter = button.dataset.oaFilter;
    if (!['all', 'scaled', 'growing', 'building'].includes(filter)) return;
    let count = 0;
    for (const card of cards) {
      card.hidden = filter !== 'all' && card.dataset.stage !== filter;
      if (!card.hidden) count++;
    }
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    grid.dataset.filtered = String(filter !== 'all');
    status.textContent = `Đang hiển thị ${count} thương hiệu.`;
  });
  controls.hidden = false;
}

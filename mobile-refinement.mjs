// Mobile disclosures reuse the original content and restore its exact DOM on desktop.
export function setupMobileDisclosure(host, cards, { title, subtitle }, media) {
  if (!host || !cards.length) return;
  const records = [];
  const sync = () => {
    if (media.matches && !records.length) {
      host.classList.add('mobile-disclosure-list');
      cards.forEach((card, index) => {
        const doc = card.ownerDocument;
        const label = card.querySelector(title)?.textContent.trim();
        if (!label) return;
        const cue = subtitle ? card.querySelector(subtitle)?.textContent.trim() : '';
        const details = doc.createElement('details');
        details.className = 'mobile-disclosure';
        details.open = true;
        const summary = doc.createElement('summary');
        const text = doc.createElement('span');
        const strong = doc.createElement('strong');
        strong.textContent = label;
        text.append(strong);
        if (cue) {
          const small = doc.createElement('span');
          small.className = 'mobile-disclosure-cue';
          small.textContent = cue;
          text.append(small);
        }
        const icon = doc.createElement('span');
        icon.className = 'mobile-disclosure-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '+';
        summary.append(text, icon);
        const content = doc.createElement('div');
        content.className = 'mobile-disclosure-content';
        content.append(...card.childNodes);
        details.append(summary, content);
        card.append(details);
        records.push({ card, content });
      });
    } else if (!media.matches && records.length) {
      records.splice(0).forEach(({ card, content }) => card.replaceChildren(...content.childNodes));
      host.classList.remove('mobile-disclosure-list');
    }
  };
  media.addEventListener('change', sync);
  sync();
}

export function setupMobileComparison(root) {
  const table = root?.querySelector('.flow-comparison-table');
  if (!table || root.querySelector('.comparison-mobile')) return;
  const doc = table.ownerDocument;
  const mobile = doc.createElement('div');
  mobile.className = 'comparison-mobile';
  const legend = doc.createElement('div');
  legend.className = 'comparison-mobile-legend';
  for (const title of ['Quản lý rời rạc', 'Private Traffic + CDP']) {
    const span = doc.createElement('span');
    span.textContent = title;
    legend.append(span);
  }
  mobile.append(legend);
  const primary = doc.createElement('div');
  primary.className = 'comparison-mobile-primary';
  const extra = doc.createElement('details');
  extra.className = 'comparison-mobile-extra';
  extra.open = true;
  const summary = doc.createElement('summary');
  const rows = [...table.querySelectorAll('tbody tr')];
  summary.textContent = `Xem thêm ${rows.length - 3} điểm khác biệt`;
  extra.append(summary);
  rows.forEach((row, index) => {
    const article = doc.createElement('article');
    article.className = 'comparison-mobile-row';
    const heading = doc.createElement('h3');
    const axis = row.querySelector('th');
    heading.textContent = [...axis.childNodes].map(n => n.textContent.trim()).filter(Boolean).join(' · ');
    article.append(heading);
    const values = doc.createElement('div');
    values.className = 'comparison-mobile-values';
    [...row.querySelectorAll('td')].forEach((cell, position) => {
      const value = doc.createElement('div');
      value.className = position ? 'comparison-mobile-after' : 'comparison-mobile-before';
      const label = doc.createElement('span');
      label.className = 'sr-only';
      label.textContent = position ? 'Private Traffic + CDP: ' : 'Quản lý rời rạc: ';
      value.append(label, ...[...cell.childNodes].map(n => n.cloneNode(true)));
      values.append(value);
    });
    article.append(values);
    (index < 3 ? primary : extra).append(article);
  });
  mobile.append(primary, extra);
  table.closest('.flow-comparison-board').after(mobile);
  root.classList.add('has-mobile-comparison');
}

if (typeof document !== 'undefined') {
  const media = matchMedia('(max-width: 767px)');
  for (const config of [
    { selector: '#solution-ecosystem .flow-solutions', title: 'h3', subtitle: '.solution-window-sub' },
    { selector: '#operating-trio .flow-trio-steps', title: 'h3', subtitle: '.trio-step-copy h4' },
    { selector: '#tools .tool-atlas', title: 'h3', subtitle: '.tool-family-heading p' },
  ]) {
    const host = document.querySelector(config.selector);
    setupMobileDisclosure(host, [...host?.children || []], config, media);
  }
  const industries = document.querySelector('#experience .experience-industries');
  if (industries) setupMobileDisclosure(industries.parentElement, [industries], { title: 'h3' }, media);
  setupMobileComparison(document.querySelector('#comparison'));
}

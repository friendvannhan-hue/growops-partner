const comparison = document.querySelector('#comparison');
const controls = comparison?.querySelector('.comparison-focus');
const note = comparison?.querySelector('.comparison-focus-note');
if (comparison && controls && note) {
  const buttons = [...controls.querySelectorAll('[data-compare-focus]')];
  const insights = {
    all: 'Chín yếu tố cùng được giữ lại để đối chiếu hai cách vận hành.',
    cac: 'CAC: mục tiêu giảm mua lại khách nhờ referral và mua lại, không phải cam kết giảm chi phí.',
    ltv: 'LTV: số lần mua chỉ là minh họa; cần đọc cùng giá trị đơn và thời gian.',
    retention: 'Retention: các dải là giả định và kỳ vọng; cần so sánh cùng kỳ đo, cùng nhóm khách.'
  };
  buttons.forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.compareFocus;
    if (!Object.hasOwn(insights, key)) return;
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    comparison.querySelectorAll('tbody tr').forEach((row) => {
      row.dataset.focused = String(key !== 'all' && Boolean(row.querySelector(`#compare-${key}`)));
    });
    note.textContent = insights[key];
    note.hidden = false;
  }));
  controls.hidden = false;
}

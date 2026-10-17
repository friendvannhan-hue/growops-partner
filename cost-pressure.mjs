export const ORDER_DEFAULT = 445000;

export function computeOrderBreakdown(value) {
  const numeric = Number(value);
  const order = Number.isFinite(numeric)
    ? Math.round(Math.min(2000000, Math.max(10000, numeric)))
    : ORDER_DEFAULT;
  const fees = {
    fixed: Math.round(order * 0.085),
    transaction: Math.round(order * 0.06),
    service: Math.round(order * 0.055) + 3000,
    piship: 2700,
  };
  const total = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
  return { order, fees, total, remaining: order - total, percent: total / order * 100 };
}

export function setupCostPressure(root = document) {
  const scope = root.querySelector(".cost-order");
  const input = root.querySelector("#cost-order-value");
  if (scope && input) {
    const currency = (value) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
    const percent = new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const put = (selector, value) => {
      scope.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
    };
    const update = () => {
      const data = computeOrderBreakdown(input.value);
      put("#cost-order-display, [data-order-total]", currency(data.order));
      input.setAttribute("aria-valuetext", currency(data.order));
      put("[data-fee-total]", currency(data.total));
      put("[data-fee-percent]", `${percent.format(data.percent)}%`);
      put("[data-order-remaining]", currency(data.remaining));
      scope.dataset.costReady = "true";
      let remaining = data.order;
      for (const [key, fee] of Object.entries(data.fees)) {
        remaining -= fee;
        put(`[data-fee="${key}"]`, `−${currency(fee)}`);
        const bar = scope.querySelector(`[data-fee-bar="${key}"]`);
        if (bar) {
          bar.style.setProperty("--bar-start", `${remaining / data.order * 100}%`);
          bar.style.setProperty("--bar-width", `${fee / data.order * 100}%`);
          bar.style.transform = `scaleX(${fee / data.order})`;
        }
      }
      const retainedBar = scope.querySelector("[data-remaining-bar]");
      retainedBar?.style.setProperty("--bar-width", `${data.remaining / data.order * 100}%`);
      if (retainedBar) retainedBar.style.transform = `scaleX(${data.remaining / data.order})`;
    };
    input.addEventListener("input", update);
    update();
  }

  const tablist = root.querySelector(".cost-platform-tabs");
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const documentRoot = root.ownerDocument || root;
  const panels = tabs.map((tab) => documentRoot.getElementById(tab.getAttribute("aria-controls")));
  if (tabs.length !== 2 || panels.some((panel) => !panel)) return;
  const activate = (index) => {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(index));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(next);
      tabs[next].focus();
    });
  });
  activate(0);
  tablist.hidden = false;
}

if (typeof document !== "undefined") setupCostPressure();

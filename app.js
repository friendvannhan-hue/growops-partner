export function nextExpandedState(current) {
  return current !== true;
}

export function shouldElevateHeader(scrollY) {
  return Number(scrollY) > 16;
}

export function menuAccessibilityState(isMobile, isOpen) {
  if (!isMobile) return { ariaHidden: null, inert: false };
  return {
    ariaHidden: String(!isOpen),
    inert: !isOpen,
  };
}

export function calculateScrollProgress(scrollY, scrollHeight, viewportHeight) {
  const available = Number(scrollHeight) - Number(viewportHeight);
  if (available <= 0) return 0;
  return Math.min(100, Math.max(0, (Number(scrollY) / available) * 100));
}

export function setupGrowthGlossary(root = document) {
  const panels = root.ownerDocument || root;
  const items = [...root.querySelectorAll("[data-growth-gloss]")]
    .map((trigger) => ({
      trigger,
      panel: panels.getElementById(trigger.getAttribute("aria-controls")),
      pinned: false,
      closeTimer: null,
      focused: panels.activeElement === trigger,
      triggerHovered: false,
      panelHovered: false,
    }))
    .filter(({ panel }) => panel);
  if (!items.length) return;

  const cancelClose = (item) => {
    clearTimeout(item.closeTimer);
    item.closeTimer = null;
  };
  const canAutoClose = (item) => (
    !item.pinned && !item.focused && !item.triggerHovered && !item.panelHovered
  );
  const close = (item) => {
    cancelClose(item);
    item.pinned = false;
    item.trigger.setAttribute("aria-expanded", "false");
    item.panel.hidden = true;
  };
  const open = (item, exclusive = false) => {
    cancelClose(item);
    items.forEach((other) => {
      if (other !== item && (exclusive || canAutoClose(other))) close(other);
    });
    item.trigger.setAttribute("aria-expanded", "true");
    item.panel.hidden = false;
  };
  const scheduleClose = (item) => {
    cancelClose(item);
    if (canAutoClose(item)) {
      item.closeTimer = setTimeout(() => {
        if (canAutoClose(item)) close(item);
      }, 150);
    }
  };

  items.forEach((item) => {
    const { trigger } = item;
    close(item);
    trigger.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      item.triggerHovered = true;
      open(item);
    });
    trigger.addEventListener("pointerleave", () => {
      item.triggerHovered = false;
      scheduleClose(item);
    });
    item.panel.addEventListener("pointerenter", () => {
      item.panelHovered = true;
      cancelClose(item);
    });
    item.panel.addEventListener("pointerleave", () => {
      item.panelHovered = false;
      scheduleClose(item);
    });
    trigger.addEventListener("focus", () => {
      item.focused = true;
      open(item, true);
    });
    trigger.addEventListener("blur", () => {
      item.focused = false;
      if (canAutoClose(item)) close(item);
    });
    trigger.addEventListener("click", () => {
      if (item.pinned) {
        close(item);
      } else {
        open(item, true);
        item.pinned = true;
      }
    });
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") items.forEach(close);
  });
  root.addEventListener("click", (event) => {
    const insideGlossary = items.some(({ trigger, panel }) => (
      trigger.contains(event.target) || panel.contains(event.target)
    ));
    if (!insideGlossary) items.forEach(close);
  });
}

export function setupGrowthReveals(root = document, view = window) {
  if (typeof view.IntersectionObserver !== "function") return;

  let motionQuery;
  try {
    motionQuery = view.matchMedia?.("(prefers-reduced-motion: reduce)");
  } catch {
    return;
  }
  if (motionQuery?.matches) return;

  const revealed = new WeakSet();
  let observer;
  try {
    observer = new view.IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting || revealed.has(target)) return;
        revealed.add(target);
        observer.unobserve(target);
        if (motionQuery?.matches) return;
        try {
          target.classList.add("growth-in-view");
        } catch {
          // The default styles remain visible if an entrance cannot be activated.
        }
      });
    }, { threshold: 0.12 });
    root.querySelectorAll(".growth-reveal, .growth-loop-step").forEach((target) => {
      observer.observe(target);
    });
  } catch {
    observer?.disconnect();
  }
}

function setupServiceAccordions() {
  document.querySelectorAll(".service-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      const willOpen = nextExpandedState(trigger.getAttribute("aria-expanded") === "true");
      trigger.setAttribute("aria-expanded", String(willOpen));
      panel.hidden = !willOpen;
    });
  });
}

function setupMobileNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".primary-nav");
  if (!toggle || !menu) return;

  const mobileQuery = window.matchMedia("(max-width: 900px)");
  const syncMenu = (open) => {
    const state = menuAccessibilityState(mobileQuery.matches, open);
    menu.dataset.open = String(open);
    menu.inert = state.inert;
    if (state.ariaHidden === null) {
      menu.removeAttribute("aria-hidden");
    } else {
      menu.setAttribute("aria-hidden", state.ariaHidden);
    }
  };

  syncMenu(false);

  toggle.addEventListener("click", () => {
    const open = nextExpandedState(toggle.getAttribute("aria-expanded") === "true");
    toggle.setAttribute("aria-expanded", String(open));
    syncMenu(open);
  });

  menu.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    toggle.setAttribute("aria-expanded", "false");
    syncMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") return;
    toggle.setAttribute("aria-expanded", "false");
    syncMenu(false);
    toggle.focus();
  });

  mobileQuery.addEventListener("change", () => {
    toggle.setAttribute("aria-expanded", "false");
    syncMenu(false);
  });
}

function setupHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", shouldElevateHeader(window.scrollY));
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupReadingProgress() {
  const indicator = document.querySelector(".scroll-progress i");
  if (!indicator) return;

  let queued = false;
  const update = () => {
    const progress = calculateScrollProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight,
    );
    indicator.style.transform = `scaleX(${progress / 100})`;
    queued = false;
  };
  const requestUpdate = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

if (typeof document !== "undefined") {
  setupMobileNavigation();
  setupServiceAccordions();
  setupHeaderState();
  setupReadingProgress();
  setupGrowthGlossary();
  setupGrowthReveals();
}

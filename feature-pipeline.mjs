const sources = ["zalo-mini-app", "private-traffic", "ecommerce", "data-foundation"];
const destinations = ["automation", "loyalty"];
const capabilities = [...sources, "data-hub", "customer-360", ...destinations];

export function activePipelineRoutes(feature) {
  if (feature === "data-hub" || feature === "customer-360") return [...sources, "profile", ...destinations];
  if (sources.includes(feature)) return [feature, "profile", ...destinations];
  if (destinations.includes(feature)) return [...sources, "profile", feature];
  return [];
}

export function setupFeaturePipeline(root, view = globalThis) {
  if (!root || root.dataset.pipelineReady === "true") return null;
  const buttons = [...root.querySelectorAll("[data-feature]")];
  const panels = [...root.querySelectorAll("[data-feature-panel]")];
  const wires = [...root.querySelectorAll("[data-route]")];
  const svgs = [...root.querySelectorAll("[data-pipeline-svg]")];
  const pause = root.querySelector("[data-feature-pause]");
  const valid = capabilities.every((key) => {
    const button = buttons.find((item) => item.dataset.feature === key);
    const panel = panels.find((item) => item.dataset.featurePanel === key);
    return button && panel && button.getAttribute("aria-controls") === panel.id;
  });
  if (!valid || buttons.length !== 8 || panels.length !== 8 || !pause) return null;

  const doc = root.ownerDocument;
  const media = typeof view.matchMedia === "function" ? view.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  let userPaused = false;
  let inView = typeof view.IntersectionObserver !== "function";
  const select = (key) => {
    if (!capabilities.includes(key)) return;
    root.dataset.activeFeature = key;
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.feature === key)));
    panels.forEach((panel) => { panel.hidden = panel.dataset.featurePanel !== key; });
    const active = activePipelineRoutes(key);
    wires.forEach((wire) => wire.classList.toggle("is-active", active.includes(wire.dataset.route)));
  };
  const updateMotion = () => {
    const running = inView && !userPaused && !media.matches && doc.visibilityState !== "hidden";
    root.dataset.motion = running ? "running" : "paused";
    svgs.forEach((svg) => {
      const method = running ? "unpauseAnimations" : "pauseAnimations";
      if (typeof svg[method] === "function") svg[method]();
    });
    pause.disabled = media.matches;
    pause.setAttribute("aria-pressed", String(userPaused || media.matches));
    pause.textContent = media.matches ? "Đang giảm chuyển động" : userPaused ? "Tiếp tục hiệu ứng" : "Tạm dừng hiệu ứng";
  };

  buttons.forEach((button) => button.addEventListener("click", () => select(button.dataset.feature)));
  pause.addEventListener("click", () => {
    if (media.matches) return;
    userPaused = !userPaused;
    updateMotion();
  });
  media.addEventListener?.("change", updateMotion);
  doc.addEventListener("visibilitychange", updateMotion);
  root.dataset.pipelineReady = "true";
  pause.hidden = false;
  select("data-hub");
  updateMotion();
  if (typeof view.IntersectionObserver === "function") {
    const observer = new view.IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      updateMotion();
    }, { threshold: 0.06 });
    observer.observe(root);
  }
  return { select };
}

if (typeof document !== "undefined") setupFeaturePipeline(document.getElementById("business-features"));

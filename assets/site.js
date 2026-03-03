(() => {
  const yearNode = document.querySelector("[data-year]");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  const hljs = globalThis.hljs;
  if (hljs && typeof hljs.highlightAll === "function") {
    if (typeof globalThis.hljsDefineSilk === "function" && !hljs.getLanguage?.("silk")) {
      hljs.registerLanguage("silk", globalThis.hljsDefineSilk);
    }

    if (typeof globalThis.hljsDefineToml === "function" && !hljs.getLanguage?.("toml")) {
      hljs.registerLanguage("toml", globalThis.hljsDefineToml);
    }

    hljs.highlightAll();
  }

  let tabInstance = 0;

  function activateTab(set, tabs, panels, next, { focus = false } = {}) {
    if (next < 0 || next >= tabs.length) return;
    for (let i = 0; i < tabs.length; i += 1) {
      const on = i === next;
      tabs[i].setAttribute("aria-selected", on ? "true" : "false");
      tabs[i].tabIndex = on ? 0 : -1;
      if (panels[i]) panels[i].hidden = !on;
    }
    if (focus) tabs[next]?.focus?.();
    set.dataset.activeTab = String(next);
  }

  function getHashTargetId() {
    const raw = String(globalThis.location.hash || "");
    if (!raw || raw === "#") return null;
    try {
      return decodeURIComponent(raw.slice(1));
    } catch {
      return raw.slice(1);
    }
  }

  function initTabSet(set) {
    if (!(set instanceof HTMLElement)) return;
    if (set.dataset.tabsInit === "true") return;

    const tabList = set.querySelector(".tabs-list");
    const tabs = Array.from(set.querySelectorAll(".tabs-tab"));
    const panels = Array.from(set.querySelectorAll(".tabs-panel"));
    if (!tabList || !tabs.length || !panels.length) return;

    tabInstance += 1;
    const prefix = set.dataset.tabsId || `tabs-${tabInstance}`;
    set.dataset.tabsId = prefix;

    tabList.setAttribute("role", "tablist");
    tabList.setAttribute("aria-orientation", "horizontal");

    for (let i = 0; i < tabs.length; i += 1) {
      const tab = tabs[i];
      const panel = panels[i];
      tab.setAttribute("role", "tab");
      tab.id ||= `${prefix}-tab-${i}`;
      if (panel) {
        panel.setAttribute("role", "tabpanel");
        panel.id ||= `${prefix}-panel-${i}`;
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", tab.id);
      }

      tab.addEventListener("click", () => {
        activateTab(set, tabs, panels, i, { focus: true });
      });

      tab.addEventListener("keydown", (event) => {
        const key = String(event.key || "");
        let nextIndex = -1;

        if (key === "ArrowRight") nextIndex = (i + 1) % tabs.length;
        else if (key === "ArrowLeft") nextIndex = (i - 1 + tabs.length) % tabs.length;
        else if (key === "Home") nextIndex = 0;
        else if (key === "End") nextIndex = tabs.length - 1;
        else if (key === "Enter" || key === " ") nextIndex = i;

        if (nextIndex === -1) return;
        event.preventDefault();
        activateTab(set, tabs, panels, nextIndex, { focus: true });
      });
    }

    let active = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    if (active === -1) active = 0;

    const targetId = getHashTargetId();
    if (targetId) {
      try {
        const target = set.querySelector(`#${CSS.escape(targetId)}`);
        if (target) {
          const panel = target.closest?.(".tabs-panel");
          const idx = panel ? panels.indexOf(panel) : -1;
          if (idx !== -1) active = idx;
        }
      } catch {}
    }

    activateTab(set, tabs, panels, active);
    set.dataset.tabsInit = "true";
  }

  function oroInitTabs(root = document) {
    const scope = root && "querySelectorAll" in root ? root : document;
    for (const set of Array.from(scope.querySelectorAll("[data-tabs]"))) {
      initTabSet(set);
    }
  }

  globalThis.oroInitTabs = oroInitTabs;
  oroInitTabs(document);

  globalThis.addEventListener("hashchange", () => {
    const targetId = getHashTargetId();
    if (!targetId) return;
    const sets = Array.from(document.querySelectorAll("[data-tabs][data-tabs-init='true']"));
    for (const set of sets) {
      const panels = Array.from(set.querySelectorAll(".tabs-panel"));
      const tabs = Array.from(set.querySelectorAll(".tabs-tab"));
      if (!tabs.length || !panels.length) continue;
      let idx = -1;
      try {
        const target = set.querySelector(`#${CSS.escape(targetId)}`);
        if (target) {
          const panel = target.closest?.(".tabs-panel");
          idx = panel ? panels.indexOf(panel) : -1;
        }
      } catch {
        idx = -1;
      }
      if (idx !== -1) activateTab(set, tabs, panels, idx);
    }
  });
})();

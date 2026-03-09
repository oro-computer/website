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

  function writeClipboard(text) {
    const value = String(text ?? "");
    if (!value) return Promise.resolve(false);

    if (globalThis.navigator?.clipboard?.writeText) {
      return globalThis.navigator.clipboard
        .writeText(value)
        .then(() => true)
        .catch(() => false);
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return Promise.resolve(Boolean(ok));
    } catch {
      return Promise.resolve(false);
    }
  }

  function getSiteRootUrl() {
    const brand = document.querySelector("a.brand[href]");
    if (brand && brand.href) {
      try {
        return new URL(brand.href);
      } catch {}
    }
    try {
      return new URL("./", globalThis.location.href);
    } catch {
      return new URL("https://example.invalid/");
    }
  }

  function buildChatGPTUrl(targetUrl) {
    const prompt = `Hi ChatGPT! Can you please read [this page](${targetUrl}) and prepare to answer questions about it?`;
    const params = new URLSearchParams({ prompt });
    return `https://chatgpt.com/?${params.toString()}`;
  }

  function buildClaudeUrl(targetUrl) {
    const prompt = `Hi Claude! Can you please read [this page](${targetUrl}) and prepare to answer questions about it?`;
    const params = new URLSearchParams({ q: prompt });
    return `https://claude.ai/new?${params.toString()}`;
  }

  function inferLlmsUrl() {
    const root = getSiteRootUrl();
    const path = String(globalThis.location.pathname || "");
    if (path.includes("/silk/") || path.endsWith("/silk")) {
      return new URL("silk/llms.txt", root).toString();
    }
    if (path.includes("/runtime/") || path.endsWith("/runtime")) {
      return new URL("runtime/llms.txt", root).toString();
    }
    if (path.includes("/sage/") || path.endsWith("/sage")) {
      return new URL("sage/llms.txt", root).toString();
    }
    return new URL("llms.txt", root).toString();
  }

  function initAskAiMenu() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    if (nav.querySelector("[data-ask-ai]")) return;

    const menu = document.createElement("details");
    menu.className = "menu";
    menu.dataset.askAi = "true";

    const summary = document.createElement("summary");
    summary.className = "button button-quiet";
    summary.textContent = "Ask AI";
    menu.appendChild(summary);

    const panel = document.createElement("div");
    panel.className = "menu-panel";

    function itemLink(label, hint) {
      const a = document.createElement("a");
      a.className = "menu-item";
      a.target = "_blank";
      a.rel = "noreferrer";
      const left = document.createElement("span");
      left.textContent = label;
      const right = document.createElement("small");
      right.textContent = hint || "";
      a.appendChild(left);
      a.appendChild(right);
      return a;
    }

    function itemButton(label, hint) {
      const b = document.createElement("button");
      b.className = "menu-item";
      b.type = "button";
      const left = document.createElement("span");
      left.textContent = label;
      const right = document.createElement("small");
      right.textContent = hint || "";
      b.appendChild(left);
      b.appendChild(right);
      return b;
    }

    function sep() {
      const d = document.createElement("div");
      d.className = "menu-sep";
      return d;
    }

    const chatgpt = itemLink("ChatGPT", "New tab");
    const claude = itemLink("Claude", "New tab");
    const viewMd = itemLink("View Markdown", "Raw");
    viewMd.dataset.askAiViewMarkdown = "true";
    const copyMd = itemButton("Copy Markdown", "Clipboard");
    copyMd.dataset.askAiCopyMarkdown = "true";
    const llms = itemLink("Open llms.txt", "Pack");

    const hint = document.createElement("div");
    hint.className = "menu-hint";
    hint.textContent = "Uses the page’s Markdown when available.";

    panel.appendChild(chatgpt);
    panel.appendChild(claude);
    panel.appendChild(sep());
    panel.appendChild(viewMd);
    panel.appendChild(copyMd);
    panel.appendChild(sep());
    panel.appendChild(llms);
    panel.appendChild(hint);

    menu.appendChild(panel);

    const primaryButton = nav.querySelector(".button.button-primary");
    if (primaryButton && primaryButton.parentElement === nav) {
      nav.insertBefore(menu, primaryButton);
    } else {
      nav.appendChild(menu);
    }

    function getContext() {
      const md = globalThis.oroPageMarkdown;
      const markdownUrl = md && md.url ? String(md.url) : "";
      const markdownText = md && md.text ? String(md.text) : "";
      const pageUrl = String(globalThis.location.href || "");
      const llmsUrl = inferLlmsUrl();
      return { markdownUrl, markdownText, pageUrl, llmsUrl };
    }

    function updateMenu() {
      const ctx = getContext();
      const target = ctx.markdownUrl || ctx.pageUrl;
      chatgpt.href = buildChatGPTUrl(target);
      claude.href = buildClaudeUrl(target);

      llms.href = ctx.llmsUrl;

      const hasMd = Boolean(ctx.markdownUrl);
      viewMd.hidden = !hasMd;
      copyMd.hidden = !hasMd;
      if (hasMd) viewMd.href = ctx.markdownUrl;
    }

    async function onCopyMarkdown() {
      const ctx = getContext();
      if (!ctx.markdownUrl) return;

      let text = ctx.markdownText;
      if (!text) {
        try {
          const res = await fetch(ctx.markdownUrl);
          if (res.ok) text = await res.text();
        } catch {}
      }

      const ok = await writeClipboard(text);
      const right = copyMd.querySelector("small");
      if (!right) return;
      const prev = right.textContent;
      right.textContent = ok ? "Copied" : "Failed";
      globalThis.setTimeout(() => {
        right.textContent = prev || "Clipboard";
      }, 900);
    }

    copyMd.addEventListener("click", onCopyMarkdown);

    panel.addEventListener("click", (event) => {
      const a = event.target && event.target.closest ? event.target.closest("a.menu-item") : null;
      if (!a) return;
      menu.open = false;
    });

    // Close when clicking outside or pressing escape.
    document.addEventListener("click", (event) => {
      if (!menu.open) return;
      const t = event.target;
      if (t && menu.contains(t)) return;
      menu.open = false;
    });

    document.addEventListener("keydown", (event) => {
      if (!menu.open) return;
      if (event.key === "Escape") menu.open = false;
    });

    // Keep links current as docs viewers re-render.
    globalThis.addEventListener("oro:page-markdown", updateMenu);
    updateMenu();
  }

  initAskAiMenu();

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

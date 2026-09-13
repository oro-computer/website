import { writeClipboard } from "../lib/clipboard.js";
(() => {
  const yearNode = document.querySelector("[data-year]");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
  const source = document.querySelector("[data-markdown]");
  if (source) globalThis.oroPageMarkdown = {url:new URL(source.dataset.markdown, location.href).href};
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
    if (path.includes("/slg/") || path.endsWith("/slg")) {
      return new URL("slg/llms.txt", root).toString();
    }
    if (path.includes("/virtnosis/") || path.endsWith("/virtnosis")) {
      return new URL("virtnosis/llms.txt", root).toString();
    }
    return new URL("llms.txt", root).toString();
  }

  function shouldShowAskAiMenu() {
    const body = document.body;
    const path = String(globalThis.location.pathname || "");
    if (body?.dataset?.askAi === "true") return true;
    if (body?.classList?.contains("docs-page")) return true;
    if (body?.classList?.contains("docs-landing-page")) return true;
    return /(^|\/)docs(\/|$)/.test(path);
  }

  function initAskAiMenu() {
    if (!shouldShowAskAiMenu()) return;

    const nav = document.querySelector(".nav");
    if (!nav) return;
    if (nav.querySelector("[data-ask-ai]")) return;

    const menu = document.createElement("details");
    menu.className = "menu ask-ai-menu";
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
    hint.textContent = "Uses page Markdown when available.";

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

    globalThis.addEventListener("oro:page-markdown", updateMenu);
    updateMenu();
  }

  initAskAiMenu();

})();

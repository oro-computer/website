(() => {
  const yearNode = document.querySelector("[data-year]");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  const hljs = globalThis.hljs;
  if (!hljs || typeof hljs.highlightAll !== "function") return;

  if (typeof globalThis.hljsDefineSilk === "function" && !hljs.getLanguage?.("silk")) {
    hljs.registerLanguage("silk", globalThis.hljsDefineSilk);
  }

  if (typeof globalThis.hljsDefineToml === "function" && !hljs.getLanguage?.("toml")) {
    hljs.registerLanguage("toml", globalThis.hljsDefineToml);
  }

  hljs.highlightAll();
})();

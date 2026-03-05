(() => {
  const app = document.querySelector("[data-spec-app]");
  if (!app) return;

  const tocRoot = app.querySelector("[data-spec-toc]");
  const searchInput = app.querySelector("[data-spec-search]");
  const contentRoot = app.querySelector("[data-spec-content]");

  const specFile = app.getAttribute("data-spec-file");
  if (!tocRoot || !contentRoot || !specFile) return;

  const githubRepo = app.getAttribute("data-github-repo") || "oro-computer/silk";
  const githubRef = app.getAttribute("data-github-ref") || "master";

  const marked = globalThis.marked;
  if (marked?.setOptions) {
    marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false,
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function stripBackticks(text) {
    return String(text || "").replace(/`([^`]+)`/g, "$1");
  }

  function normalizeRelPath(inputPath) {
    if (!inputPath) return null;
    let p = String(inputPath).trim();
    p = p.replace(/\\/g, "/");
    p = p.replace(/^\.\//, "");
    p = p.replace(/^\/+/, "");
    const parts = [];
    for (const raw of p.split("/")) {
      const part = raw.trim();
      if (!part || part === ".") continue;
      if (part === "..") {
        if (!parts.length) return null;
        parts.pop();
        continue;
      }
      parts.push(part);
    }
    const out = parts.join("/");
    if (!out || out.includes("\0")) return null;
    return out;
  }

  function getSilkBasePath() {
    const path = String(globalThis.location?.pathname || "");
    const idx = path.indexOf("/spec/");
    if (idx !== -1) return path.slice(0, idx + 1);
    // Fallback: assume /silk/spec/... depth.
    const parts = path.split("/").filter(Boolean);
    if (parts.length >= 2) return `/${parts.slice(0, -2).join("/")}/`;
    return "/";
  }

  function viewerHref(kind, id, hash = "") {
    const encoded = encodeURIComponent(String(id || ""));
    const base = getSilkBasePath();
    if (kind === "wiki") return `${base}wiki/?p=${encoded}${hash}`;
    return `${base}docs/?p=${encoded}${hash}`;
  }

  function dropProposalProcess(markdown) {
    const lines = String(markdown).split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (/^##\s+Silk Proposal Process\b/i.test(line)) {
        i += 1;
        while (i < lines.length && !/^##\s+/.test(lines[i])) i += 1;
        continue;
      }
      out.push(line);
      i += 1;
    }
    return out.join("\n");
  }

  function sanitizeMarkdown(markdown) {
    // Keep the spec faithful, but remove repo-workflow prose and status framing
    // that does not belong in a standalone reader-facing specification.
    const banned =
      /(STATUS\.md|PLAN\.md|docs\/wiki\/style-guide\.md|_template-[^`\\s]+|style-guide\.md|README\.md)/;
    const statusLine = /^(Status:|Implementation status:)\s*/i;
    const statusHeading = /^(#{1,6})\s+(Status|Implementation status)\s*:?\s*$/i;
    const testsHeading = /^(#{1,6})\s+Tests\b/i;

    function rewriteStatusLine(line) {
      const m = String(line).match(/^(\s*)(Status:|Implementation status:)\s*/i);
      if (!m) return null;
      const leading = m[1] || "";
      const rest = line.slice(m[0].length);
      const delims = [". ", ": ", "— ", "– "];
      let cut = -1;
      let cutLen = 0;
      for (const d of delims) {
        const idx = rest.indexOf(d);
        if (idx === -1) continue;
        if (cut === -1 || idx < cut) {
          cut = idx;
          cutLen = d.length;
        }
      }
      if (cut === -1) return "";
      return leading + rest.slice(cut + cutLen);
    }

    function rewriteOutsideCode(text) {
      let out = text;

      // Generated-spec phrasing: make the single-file edition self-contained.
      out = out.replace(/Silk['’]s\s+this\s+specification\s+are\b/gi, "This specification is");
      out = out.replace(/\bother\s+this\s+specification\s+files\b/gi, "chapters below");
      out = out.replace(/\bconcept\s+documents\s+under\s+this\s+specification\b/gi, "concept chapters in this specification");

      out = out.replace(/^(\s*#{1,6}\s+)What works today\b/i, "$1Supported behavior");
      out = out.replace(/\bwhat works today\b/gi, "supported behavior");
      out = out.replace(/^(\s*#{1,6}\s+)Syntax\s*\(Selected\)\s*$/i, "$1Syntax");
      out = out.replace(/\bCurrent limitations\b/gi, "Limitations");
      out = out.replace(/\bImplemented in\b/g, "Defined in");
      out = out.replace(/\bExamples\s*\(Works today\)\b/gi, "Examples");
      out = out.replace(/\bExample\s*\(Works today\)\s*:/gi, "Example:");
      out = out.replace(/^(\s*#{1,6}\s+)Works today:\s*/i, "$1Example: ");
      out = out.replace(/^(\s*#{1,6}\s+)Works today\b/i, "$1Example");
      out = out.replace(/^(\s*[-*+]\s+)Works today:\s*/i, "$1Example: ");
      out = out.replace(/^(\s*[-*+]\s+)Works today\b/i, "$1Example");
      out = out.replace(/^\s*Works today:\s*/i, "Example: ");
      out = out.replace(/^(\s*)Works today\b/i, "$1Example");
      out = out.replace(/\(Works today\)/gi, "");

      out = out.replace(/\bthe current compiler\/backend subset\b/gi, "the compiler");
      out = out.replace(/\bthe current compiler subset\b/gi, "the compiler");
      out = out.replace(/\bthe current scalar-slot backend subset\b/gi, "the scalar-slot backend");
      out = out.replace(/\bthe current backend subset\b/gi, "the backend");
      out = out.replace(/\bCurrent subset limitation\b/gi, "Limitation");
      out = out.replace(/\bcurrent\s+(?:subset|support)\b/gi, "");
      out = out.replace(/\s*\(\s*current\s+(?:subset|support)[^)]*\)/gi, "");

      if (/^\s*#{1,6}\s/.test(out)) {
        out = out.replace(
          /\s*\([^)]*(works today|implemented|planned|selected|current\s+(?:subset|compiler|backend|checker|implementation))[^)]*\)/gi,
          ""
        );
      }

      out = out.replace(
        /^(\s*#{1,6}\s+.+?)\s*\(([^)]+)\)\s*$/i,
        (m, head, meta) =>
          /(works today|implemented|planned|selected|current\s+(?:subset|compiler|backend|checker|implementation))/i.test(meta)
            ? head
            : m
      );

      out = out.replace(
        /^(\s*#{1,6}\s+)(?:Current\s+|Initial\s+)?Implemented\s+Subset\s*$/i,
        "$1Details"
      );
      out = out.replace(/^(\s*#{1,6}\s+)Implemented\s*$/i, "$1Details");
      out = out.replace(/^(\s*#{1,6}\s+)Implemented\s+API\b/i, "$1API");

      out = out.replace(/^(\s*[-*+]\s+)Implemented\s*:\s*/i, "$1");
      out = out.replace(/^\s*Implemented\s*:\s*/i, "");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented subset notes:\s*/i, "$1Notes: ");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented initial subset:\s*/i, "$1Notes: ");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented subset:\s*/i, "$1Notes: ");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented runtime areas\b/i, "$1Runtime areas");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented as\b/i, "$1Designed as");
      out = out.replace(/\s*\(\s*Implemented[^)]*\)/gi, "");

      out = out.replace(/\bcurrently\s+not\b/gi, "not");
      out = out.replace(/\(\s*\)/g, "");

      const leading = (out.match(/^\s*/) || [""])[0];
      let body = out.slice(leading.length);
      body = body
        .replace(/ {2,}/g, " ")
        .replace(/\s+:/g, ":")
        .replace(/\s+,/g, ",")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")");
      return leading + body;
    }

    const md = dropProposalProcess(String(markdown));
    const lines = md.split("\n");
    const out = [];
    let inCode = false;
    let skipLevel = null;
    let codeLang = null;
    let skipFixtureList = false;

    for (let line of lines) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith("```")) {
        const entering = !inCode;
        inCode = !inCode;
        if (entering) {
          const lang = trimmed.slice(3).trim().split(/\s+/)[0];
          codeLang = lang ? lang.toLowerCase() : null;
        } else {
          codeLang = null;
        }
        if (skipLevel === null) out.push(line);
        continue;
      }

      if (!inCode) {
        const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*$/);
        if (skipLevel !== null && headingMatch) {
          const level = headingMatch[1].length;
          if (level <= skipLevel) skipLevel = null;
        }

        if (skipLevel === null) {
          const statusMatch = line.match(statusHeading);
          if (statusMatch) {
            skipLevel = statusMatch[1].length;
            continue;
          }

          const testsMatch = line.match(testsHeading);
          if (testsMatch) {
            skipLevel = testsMatch[1].length;
            continue;
          }
        }
      }

      if (skipLevel !== null) continue;

      if (!inCode) {
        // Drop generated-spec “fixtures” lists that were redacted to placeholders.
        // These are useful in the compiler repo, but not in a public, reader-focused spec.
        if (skipFixtureList) {
          const blank = !String(line || "").trim();
          const heading = /^(#{1,6})\s+/.test(line);
          if (blank || heading) {
            skipFixtureList = false;
          } else if (/^\s*[-*+]\s+/.test(line) && /\bthe runnable fixtures\b/i.test(line)) {
            continue;
          } else {
            // Any other content ends the list.
            skipFixtureList = false;
          }
        }

        if (/^\s*Examples that exercise the implemented subset\s*:\s*$/i.test(line)) {
          skipFixtureList = true;
          continue;
        }

        // Drop “Relevant tests” checklist lines that only point at redacted fixtures.
        if (/Relevant tests/i.test(line) && /\bthe runnable fixtures\b/i.test(line)) {
          continue;
        }

        // Avoid rendering backticked prose placeholders as code.
        line = line.replace(/`this specification`/gi, "this specification");
        line = line.replace(
          /`the relevant chapters of this specification`/gi,
          "the relevant chapters of this specification"
        );

        // Prefer a public repo anchor over redacted “fixtures” placeholders.
        line = line.replace(/`the runnable fixtures`/gi, "`examples/`");
      }

      if (!inCode && statusLine.test(line)) {
        const rewritten = rewriteStatusLine(line);
        if (!rewritten || !rewritten.trim()) continue;
        line = rewritten;
      }

      if (!inCode && banned.test(line)) continue;

      if (!inCode) {
        const parts = line.split("`");
        for (let i = 0; i < parts.length; i += 2) {
          parts[i] = rewriteOutsideCode(parts[i]);
        }
        line = parts.join("`");

        // Status-y parentheticals can straddle inline-code spans; strip them on the full line.
        line = line.replace(/\(\s*Implemented[^)]*\)/gi, "");
        line = line.replace(/\(\s*Works today[^)]*\)/gi, "");
        line = line.replace(
          /\(\s*(?:Planned|Selected|current\s+(?:subset|compiler|backend|checker|implementation))[^)]*\)/gi,
          ""
        );
      } else {
        // In code fences, rewrite comment text only.
        const rewriteComment = (comment) => {
          const leading = (comment.match(/^\s*/) || [""])[0];
          const body = comment.slice(leading.length);
          const rewritten = body
            .replace(/\bwhat works today\b/gi, "supported behavior")
            .replace(/\bworks today\b/gi, "Example")
            .replace(/\bcurrent\s+(?:subset|support)\b/gi, "")
            .replace(/\bcurrently\s+not\b/gi, "not")
            .replace(/ {2,}/g, " ")
            .replace(/\(\s*\)/g, "")
            .trimEnd();
          return leading + rewritten;
        };

        const t = line.trimStart();
        const hasLineComment =
          t.startsWith("//") || t.startsWith("#") || t.startsWith("--") || t.startsWith("*");

        if (hasLineComment) {
          line = rewriteComment(line);
        } else if (
          codeLang &&
          ["silk", "slk", "c", "cpp", "cc", "c++", "js", "javascript", "ts", "typescript", "zig"].includes(
            codeLang
          )
        ) {
          const idx = line.indexOf("//");
          if (idx !== -1) {
            const prev = idx > 0 ? line[idx - 1] : "";
            if (idx === 0 || /\s/.test(prev)) {
              line = line.slice(0, idx) + rewriteComment(line.slice(idx));
            }
          }
        } else if (codeLang && ["bash", "sh", "zsh", "fish", "toml", "yaml", "yml"].includes(codeLang)) {
          const idx = line.indexOf("#");
          if (idx !== -1) {
            const prev = idx > 0 ? line[idx - 1] : "";
            if (idx === 0 || /\s/.test(prev)) {
              line = line.slice(0, idx) + rewriteComment(line.slice(idx));
            }
          }
        }
      }

      out.push(line);
    }

    return out.join("\n");
  }

  function registerLanguages() {
    const hljs = globalThis.hljs;
    if (!hljs) return;
    if (typeof globalThis.hljsDefineSilk === "function" && !hljs.getLanguage?.("silk")) {
      hljs.registerLanguage("silk", globalThis.hljsDefineSilk);
    }
    if (typeof globalThis.hljsDefineToml === "function" && !hljs.getLanguage?.("toml")) {
      hljs.registerLanguage("toml", globalThis.hljsDefineToml);
    }
  }

  function highlightContent(container) {
    const hljs = globalThis.hljs;
    if (!hljs || typeof hljs.highlightElement !== "function") return;
    const blocks = Array.from(container.querySelectorAll("pre code"));
    for (const block of blocks) {
      try {
        hljs.highlightElement(block);
      } catch {}
    }
  }

  function highlightInlineCodeInHeadings(container) {
    const hljs = globalThis.hljs;
    if (!hljs || typeof hljs.highlight !== "function") return;
    const nodes = Array.from(container.querySelectorAll("h1 code, h2 code, h3 code, h4 code"));
    if (!nodes.length) return;

    const silkInlineCandidate =
      /(::|^\s*#|^\s*(package|module|import|from|export|public|private|default|const|let|var|mut|move|fn|c_fn|test|theory|struct|extends|enum|type|error|interface|impl|using|as|is|raw|pure|async|task|await|yield|with|region|new|sizeof|alignof|offsetof|typename|asm|ext|where|if|else|match|while|for|in|loop|return|panic|break|continue|assert|attr)\b)/;

    for (const node of nodes) {
      if (node.closest("pre")) continue;
      if (node.dataset.inlineHljs === "true") continue;

      const raw = String(node.textContent || "");
      const text = raw.trim();
      if (!text) continue;
      if (text.length > 160) continue;
      if (!silkInlineCandidate.test(text)) continue;

      try {
        const res = hljs.highlight(raw, { language: "silk", ignoreIllegals: true });
        node.classList.add("hljs", "hljs-inline");
        node.innerHTML = res.value;
        node.dataset.inlineHljs = "true";
      } catch {}
    }
  }

  async function loadDocMaps() {
    const origin = String(globalThis.location?.origin || "");
    const base = getSilkBasePath();
    const docsIndexUrl = new URL(`${base}docs/index.json`, origin).toString();
    const wikiIndexUrl = new URL(`${base}wiki/index.json`, origin).toString();

    async function fetchIndex(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json();
    }

    try {
      const [docsIndex, wikiIndex] = await Promise.all([
        fetchIndex(docsIndexUrl),
        fetchIndex(wikiIndexUrl),
      ]);

      const docsIdByFile = new Map();
      const wikiIdByFile = new Map();
      const titleById = new Map();
      const docsSpecifierToId = new Map();

      function ingest(index, idByFile) {
        for (const sec of index?.sections || []) {
          for (const it of sec?.items || []) {
            const id = String(it.id || "");
            const title = String(it.title || "");
            const file = normalizeRelPath(String(it.file || ""));
            if (id && title) titleById.set(id, title);
            if (file && id) idByFile.set(file, id);
          }
        }
      }

      ingest(docsIndex, docsIdByFile);
      ingest(wikiIndex, wikiIdByFile);

      for (const [id, title] of titleById.entries()) {
        const plain = stripBackticks(title);
        if (plain.startsWith("std::") || plain.startsWith("oro:")) {
          docsSpecifierToId.set(plain, id);
        }
      }

      return { docsIdByFile, wikiIdByFile, titleById, docsSpecifierToId };
    } catch {
      return null;
    }
  }

  function rewriteInlineDocRefs(container, maps) {
    if (!maps) return;
    const { docsIdByFile, wikiIdByFile, titleById, docsSpecifierToId } = maps;

    const codes = Array.from(container.querySelectorAll("code"));
    for (const code of codes) {
      if (code.closest("pre")) continue;
      if (code.closest("a")) continue;
      const raw = String(code.textContent || "").trim();
      if (!raw) continue;

      if (/^the runnable fixtures$/i.test(raw)) {
        const a = document.createElement("a");
        a.className = "docs-inline-code";
        a.href = `https://github.com/${githubRepo}/tree/${githubRef}/examples`;
        a.target = "_blank";
        a.rel = "noreferrer";
        a.textContent = "examples/";
        code.replaceWith(a);
        continue;
      }

      if (/^the implementation status$/i.test(raw)) {
        const a = document.createElement("a");
        a.className = "docs-inline-ref";
        a.href = viewerHref("docs", "compiler/implementation-status");
        a.textContent = "implementation status";
        code.replaceWith(a);
        continue;
      }

      // Link error codes like `E2001` to the compiler diagnostics reference when available.
      if (/^E\d{4}$/i.test(raw) && titleById.has("compiler/diagnostics")) {
        const a = document.createElement("a");
        a.className = "docs-inline-code";
        a.href = viewerHref("docs", "compiler/diagnostics", `#${raw.toUpperCase()}`);
        a.textContent = raw.toUpperCase();
        code.replaceWith(a);
        continue;
      }

      // Convert repository-relative example paths like `examples/foo.slk` into
      // clickable GitHub links.
      if (
        githubRepo &&
        githubRef &&
        (raw.startsWith("examples/") || raw.startsWith("tests/") || raw === "examples/")
      ) {
        const path = raw === "examples/" ? "examples" : raw;
        const isFile = /\.[a-z0-9]+$/i.test(path);
        const base = `https://github.com/${githubRepo}`;
        const href = isFile ? `${base}/blob/${githubRef}/${path}` : `${base}/tree/${githubRef}/${path}`;

        const a = document.createElement("a");
        a.className = "docs-inline-code";
        a.href = href;
        a.target = "_blank";
        a.rel = "noreferrer";
        a.textContent = raw;
        code.replaceWith(a);
        continue;
      }

      // Link stdlib module specifiers like `std::task`.
      if (raw.startsWith("std::") && docsSpecifierToId.size) {
        const parts = raw.split("::").filter(Boolean);
        for (let n = parts.length; n >= 2; n -= 1) {
          const candidate = parts.slice(0, n).join("::");
          const id = docsSpecifierToId.get(candidate);
          if (!id) continue;
          const a = document.createElement("a");
          a.className = "docs-inline-code";
          a.href = viewerHref("docs", id);
          a.textContent = raw;
          code.replaceWith(a);
          break;
        }
        if (!code.isConnected) continue;
      }

      // Link doclike file references such as `docs/std/io.md` or `wiki/language/types.md`.
      let targetKind = null;
      let file = null;
      if (raw.startsWith("docs/")) {
        targetKind = "docs";
        file = raw.slice("docs/".length);
      } else if (raw.startsWith("wiki/")) {
        targetKind = "wiki";
        file = raw.slice("wiki/".length);
      } else if (raw.startsWith("spec/")) {
        targetKind = "docs";
        file = raw;
      } else if (raw.endsWith(".md") || raw.endsWith(".txt")) {
        // Only resolve explicit file references; avoid guessing bare names.
        targetKind = "docs";
        file = raw;
      }

      if (!targetKind || !file) continue;
      const normalized = normalizeRelPath(file);
      if (!normalized) continue;

      const id =
        targetKind === "wiki" ? wikiIdByFile.get(normalized) : docsIdByFile.get(normalized);
      if (!id) continue;

      const a = document.createElement("a");
      a.className = "docs-inline-code";
      a.href = viewerHref(targetKind, id);
      a.textContent = raw;
      code.replaceWith(a);
    }
  }

  function addHeadingAnchors(container) {
    const headings = Array.from(container.querySelectorAll("h2, h3, h4, h5"));
    for (const h of headings) {
      const id = h.getAttribute("id");
      if (!id) continue;
      if (h.querySelector(".docs-heading-anchor")) continue;
      const a = document.createElement("a");
      a.className = "docs-heading-anchor";
      a.href = `#${id}`;
      a.setAttribute("aria-label", "Link to this section");
      a.textContent = "#";
      h.appendChild(a);
    }
  }

  function buildToc(container) {
    const headings = Array.from(container.querySelectorAll("h2, h3, h4, h5"));
    const frag = document.createDocumentFragment();

    const label = document.createElement("div");
    label.className = "spec-toc-title";
    label.textContent = "Table of contents";
    frag.appendChild(label);

    const list = document.createElement("div");
    list.className = "spec-toc";

    for (const h of headings) {
      const id = h.getAttribute("id");
      if (!id) continue;
      const level = h.tagName.toLowerCase();
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.dataset.level = level;
      a.dataset.id = id;
      a.textContent = h.textContent.replace(/#$/, "").trim();
      list.appendChild(a);
    }

    frag.appendChild(list);
    tocRoot.replaceChildren(frag);

    return Array.from(list.querySelectorAll("a[data-id]"));
  }

  function filterToc(links, query) {
    const q = String(query || "").trim().toLowerCase();
    for (const a of links) {
      const text = (a.textContent || "").toLowerCase();
      const ok = !q || text.includes(q);
      a.hidden = !ok;
    }
  }

  function setActive(links, activeId) {
    for (const a of links) {
      a.dataset.active = a.dataset.id === activeId ? "true" : "false";
    }
  }

  function observeActiveHeadings(container, links) {
    const headings = Array.from(container.querySelectorAll("h2, h3, h4, h5")).filter((h) =>
      h.getAttribute("id")
    );
    if (!headings.length) return;

    let current = headings[0].getAttribute("id");
    setActive(links, current);

    const obs = new IntersectionObserver(
      (entries) => {
        // Choose the top-most visible heading.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top || 0) - (b.boundingClientRect.top || 0));
        if (!visible.length) return;
        const id = visible[0].target.getAttribute("id");
        if (!id || id === current) return;
        current = id;
        setActive(links, current);
      },
      { root: null, rootMargin: "-30% 0px -65% 0px", threshold: [0, 1] }
    );

    for (const h of headings) obs.observe(h);
  }

  async function init() {
    let raw = "";
    try {
      const res = await fetch(specFile);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      raw = await res.text();
    } catch {
      contentRoot.innerHTML =
        "<h1>Spec unavailable</h1><p>Unable to load this specification.</p>";
      globalThis.oroPageMarkdown = { url: "", text: "" };
      try {
        globalThis.dispatchEvent(new CustomEvent("oro:page-markdown", { detail: { url: "" } }));
      } catch {}
      return;
    }

    const markdownUrl = new URL(specFile, globalThis.location.href).toString();
    globalThis.oroPageMarkdown = { url: markdownUrl, text: raw };
    try {
      globalThis.dispatchEvent(
        new CustomEvent("oro:page-markdown", { detail: { url: markdownUrl } })
      );
    } catch {}

    const text = sanitizeMarkdown(raw);

    let html = "";
    if (marked?.parse) {
      html = marked.parse(text);
    } else {
      html = `<pre><code class=\"language-plaintext\">${escapeHtml(text)}</code></pre>`;
    }

    contentRoot.innerHTML = html;
    addHeadingAnchors(contentRoot);
    registerLanguages();
    highlightContent(contentRoot);
    highlightInlineCodeInHeadings(contentRoot);

    const links = buildToc(contentRoot);
    observeActiveHeadings(contentRoot, links);

    if (searchInput) {
      searchInput.addEventListener("input", () => filterToc(links, searchInput.value));
    }

    // Smooth-ish navigation without losing focus.
    tocRoot.addEventListener("click", (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a[data-id]") : null;
      if (!a) return;
      const id = a.getAttribute("data-id");
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      globalThis.history.pushState(null, "", `#${id}`);
      target.scrollIntoView();
      setActive(links, id);
    });

    // If we loaded with a hash, jump after rendering.
    if (globalThis.location.hash) {
      const targetId = globalThis.location.hash.slice(1);
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView();
    }

    // Title: first h1 in the spec content.
    const h1 = contentRoot.querySelector("h1");
    if (h1) {
      document.title = `${h1.textContent.trim()} · Oro Computer`;
    }

    loadDocMaps().then((maps) => rewriteInlineDocRefs(contentRoot, maps));
  }

  init();
})();

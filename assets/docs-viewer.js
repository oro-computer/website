(() => {
  const app = document.querySelector("[data-docs-app]");
  if (!app) return;

  const navRoot = app.querySelector("[data-docs-nav]");
  const contentRoot = app.querySelector("[data-docs-content]");
  const searchInput = app.querySelector("[data-docs-search]");
  const resultsRoot = app.querySelector("[data-docs-results]");
  const breadcrumb = app.querySelector("[data-docs-breadcrumb]");
  const tocRoot = app.querySelector("[data-docs-toc]");
  const prevRoot = app.querySelector("[data-docs-prev]");
  const nextRoot = app.querySelector("[data-docs-next]");

  const kind = app.getAttribute("data-kind") || "docs";
  const indexUrl = app.getAttribute("data-index") || "index.json";
  const searchUrl = app.getAttribute("data-search") || "search.json";
  const baseUrl = app.getAttribute("data-base") || "source/";
  const defaultId = app.getAttribute("data-default") || "start";

  const titleSuffix =
    app.getAttribute("data-title-suffix") ||
    (kind === "wiki" ? "Silk Wiki" : "Silk Docs");

  const marked = globalThis.marked;
  if (marked?.setOptions) {
    marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false,
    });
  }

  function isExternalHref(href) {
    return (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("data:") ||
      href.startsWith("javascript:")
    );
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeRelPath(input) {
    if (!input) return null;
    let path = String(input);

    try {
      path = decodeURIComponent(path);
    } catch {}

    path = path.replace(/\\/g, "/");
    path = path.replace(/^\.\//, "");
    path = path.replace(/^\/+/, "");

    const parts = [];
    for (const raw of path.split("/")) {
      const part = raw.trim();
      if (!part || part === ".") continue;
      if (part === "..") {
        if (!parts.length) return null;
        parts.pop();
        continue;
      }
      parts.push(part);
    }

    const normalized = parts.join("/");
    if (!normalized || normalized.includes("\u0000")) return null;
    return normalized;
  }

  // Standalone spec pages: keep the spec reader-focused (TC39-style).
  if (kind === "docs") {
    const params = new URLSearchParams(globalThis.location.search);
    const raw = params.get("p");
    const normalized = raw ? normalizeRelPath(raw) : null;
    const match = normalized ? normalized.match(/^spec\/(\d{4})$/) : null;
    if (match) {
      const year = match[1];
      const hash = globalThis.location.hash || "";
      globalThis.location.replace(`../spec/${year}/${hash}`);
      return;
    }
  }

  function dirname(path) {
    const parts = path.split("/");
    parts.pop();
    return parts.join("/");
  }

  function resolveRelativeFile(currentFile, hrefPath) {
    const base = dirname(currentFile);
    const joined = base ? `${base}/${hrefPath}` : hrefPath;
    return normalizeRelPath(joined);
  }

  function fileToId(file) {
    if (!file) return null;
    if (file.endsWith(".md")) return file.slice(0, -3);
    if (file.endsWith(".txt")) return file.slice(0, -4);
    return file;
  }

  function classifyDocLikePath(path) {
    // Normalize paths that look like "docs/..." or "docs/wiki/..."
    let p = path;
    if (p.startsWith("docs/")) p = p.slice("docs/".length);
    if (p.startsWith("wiki/")) {
      return { targetKind: "wiki", file: p.slice("wiki/".length) };
    }
    return { targetKind: "docs", file: p };
  }

  function viewerHref(targetKind, targetId, hash = "") {
    const encoded = encodeURIComponent(targetId);
    if (targetKind === kind) return `?p=${encoded}${hash}`;
    if (kind === "docs" && targetKind === "wiki")
      return `../wiki/?p=${encoded}${hash}`;
    if (kind === "wiki" && targetKind === "docs")
      return `../docs/?p=${encoded}${hash}`;
    return `?p=${encoded}${hash}`;
  }

  function getCurrentId() {
    const params = new URLSearchParams(globalThis.location.search);
    const raw = params.get("p") || defaultId;
    const normalized = normalizeRelPath(raw);
    return normalized || defaultId;
  }

  function setCurrentId(id, { replace = false } = {}) {
    const params = new URLSearchParams(globalThis.location.search);
    params.set("p", id);
    const next = `${globalThis.location.pathname}?${params.toString()}${
      globalThis.location.hash || ""
    }`;
    if (replace) {
      globalThis.history.replaceState({ p: id }, "", next);
    } else {
      globalThis.history.pushState({ p: id }, "", next);
    }
  }

  function humanizeSectionName(name) {
    if (!name) return "Docs";
    if (name === "overview") return "Start";
    if (name === "ai") return "AI";
    if (name === "mcp") return "MCP";
    if (name === "api" || name === "apis") return "APIs";
    if (name === "std") return "Standard library";
    return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function sanitizeMarkdown(markdown) {
    const banned =
      /(STATUS\.md|PLAN\.md|llms\.txt|docs\/llms\.txt|docs\/wiki\/style-guide\.md|_template-[^`\\s]+|style-guide\.md|README\.md)/;
    const statusLine = /^(Status:|Implementation status:)\s*/i;
    const statusHeading = /^(#{1,6})\s+(Status|Implementation status)\b/i;

    function rewriteOutsideCode(text) {
      let out = text;

      // Headings
      out = out.replace(/^(\s*#{1,6}\s+)Relevant Tests\b/gi, "$1Tests");

      // Remove status-y "Works today" framing in prose.
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

      // Prefer direct, present-tense language over "current implementation" framing.
      out = out.replace(/\bIn the current implementation\b/gi, (m) =>
        m[0] === "I" ? "Currently" : "currently"
      );
      out = out.replace(/\bthe current implementation\b/gi, (m) =>
        m[0] === "T" ? "The implementation" : "the implementation"
      );
      out = out.replace(/\bcurrent implementation stage\b/gi, "initial bring-up");

      // Prefer present-tense, spec-like language over "current subset".
      out = out.replace(
        /^(\s*(?:[-*+]\s+)?)in the current (?:compiler\/backend|compiler|backend|scalar-slot backend)?\s*subset\b/gi,
        "$1In Silk"
      );
      out = out.replace(
        /\bin the current (?:compiler\/backend|compiler|backend|scalar-slot backend)?\s*subset\b/gi,
        "in Silk"
      );
      out = out.replace(/\bthe current compiler\/backend subset\b/gi, "the compiler");
      out = out.replace(/\bthe current compiler subset\b/gi, "the compiler");
      out = out.replace(/\bthe current scalar-slot backend subset\b/gi, "the scalar-slot backend");
      out = out.replace(/\bthe current backend subset\b/gi, "the backend");
      out = out.replace(/\bCurrent subset limitation\b/gi, "Limitation");
      out = out.replace(/\bcurrent\s+(?:subset|support)\b/gi, "");
      out = out.replace(/\s*\(\s*current\s+(?:subset|support)[^)]*\)/gi, "");

      // Strip parentheticals/headings that explicitly call out implementation status.
      if (/^\s*#{1,6}\s/.test(out)) {
        out = out.replace(
          /\s*\([^)]*(works today|implemented|planned|selected|current\s+(?:subset|compiler|backend|checker|implementation))[^)]*\)/gi,
          ""
        );
      }

      // Drop trailing status qualifiers on headings (e.g., "Syntax (Implemented Subset)").
      out = out.replace(
        /^(\s*#{1,6}\s+.+?)\s*\(([^)]+)\)\s*$/i,
        (m, head, meta) =>
          /(works today|implemented|planned|selected|current\s+(?:subset|compiler|backend|checker|implementation))/i.test(meta)
            ? head
            : m
      );

      // Replace status-only headings with neutral labels.
      out = out.replace(
        /^(\s*#{1,6}\s+)(?:Current\s+|Initial\s+)?Implemented\s+Subset\s*$/i,
        "$1Details"
      );
      out = out.replace(/^(\s*#{1,6}\s+)Implemented\s*$/i, "$1Details");
      out = out.replace(/^(\s*#{1,6}\s+)Implemented\s+API\b/i, "$1API");

      // Drop "Implemented:" label prefixes in prose/lists.
      out = out.replace(/^(\s*[-*+]\s+)Implemented\s*:\s*/i, "$1");
      out = out.replace(/^\s*Implemented\s*:\s*/i, "");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented subset notes:\s*/i, "$1Notes: ");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented initial subset:\s*/i, "$1Notes: ");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented subset:\s*/i, "$1Notes: ");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented runtime areas\b/i, "$1Runtime areas");
      out = out.replace(/^(\s*[-*+]\s+)?Implemented as\b/i, "$1Designed as");
      out = out.replace(/\s*\(\s*Implemented[^)]*\)/gi, "");

      // Avoid "currently not ..." framing.
      out = out.replace(/\bcurrently\s+not\b/gi, "not");
      out = out.replace(/\(\s*\)/g, "");

      // Tidy up extra whitespace introduced by rewrites.
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

    const lines = String(markdown).split("\n");
    const out = [];
    let inCode = false;
    let skipLevel = null;
    let codeLang = null;

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
        }
      }

      if (skipLevel !== null) continue;

      if (!inCode && (banned.test(line) || statusLine.test(line))) {
        continue;
      }

      if (!inCode) {
        // Preserve inline-code spans while rewriting prose.
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
        // Code fences are treated as examples; keep semantics intact, but rewrite tone-y
        // status language inside comment text (both whole-line and trailing comments).
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
        } else if (codeLang && ["silk", "slk", "c", "cpp", "cc", "c++", "js", "javascript", "ts", "typescript", "zig"].includes(codeLang)) {
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

  function addHeadingAnchors(container) {
    const headings = Array.from(container.querySelectorAll("h2, h3, h4"));
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

  function renderToc(container) {
    if (!tocRoot) return;
    const headings = Array.from(container.querySelectorAll("h2, h3"));
    if (!headings.length) {
      tocRoot.replaceChildren();
      tocRoot.hidden = true;
      return;
    }

    tocRoot.hidden = false;
    const frag = document.createDocumentFragment();

    const label = document.createElement("div");
    label.className = "docs-toc-title";
    label.textContent = "On this page";
    frag.appendChild(label);

    const list = document.createElement("ul");
    list.className = "docs-toc-list";
    for (const h of headings) {
      const id = h.getAttribute("id");
      if (!id) continue;
      const li = document.createElement("li");
      li.dataset.level = h.tagName.toLowerCase();
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = h.textContent.replace(/#$/, "").trim();
      li.appendChild(a);
      list.appendChild(li);
    }
    frag.appendChild(list);
    tocRoot.replaceChildren(frag);
  }

  function updateBreadcrumb(section, title) {
    if (!breadcrumb) return;
    breadcrumb.textContent = `${humanizeSectionName(section)} / ${title}`;
  }

  function renderPrevNext(flat, currentId) {
    if (!prevRoot && !nextRoot) return;

    const idx = flat.findIndex((i) => i.id === currentId);
    const prev = idx > 0 ? flat[idx - 1] : null;
    const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

    if (prevRoot) {
      prevRoot.innerHTML = prev
        ? `<a class="docs-prevnext-link" href="${viewerHref(
            kind,
            prev.id
          )}"><span class="docs-prevnext-label">Previous</span><span class="docs-prevnext-title">${escapeHtml(
            prev.title
          )}</span></a>`
        : "";
    }

    if (nextRoot) {
      nextRoot.innerHTML = next
        ? `<a class="docs-prevnext-link" href="${viewerHref(
            kind,
            next.id
          )}"><span class="docs-prevnext-label">Next</span><span class="docs-prevnext-title">${escapeHtml(
            next.title
          )}</span></a>`
        : "";
    }
  }

  function renderNav(index, currentId) {
    if (!navRoot) return;
    const frag = document.createDocumentFragment();

    for (const section of index.sections || []) {
      const sectionTitle = humanizeSectionName(section.name);

      const heading = document.createElement("div");
      heading.className = "docs-nav-section";
      heading.textContent = sectionTitle;
      frag.appendChild(heading);

      const list = document.createElement("ul");
      list.className = "docs-nav-list";

      for (const item of section.items || []) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = viewerHref(kind, item.id);
        a.textContent = item.title;
        a.dataset.docId = item.id;
        if (item.id === currentId) a.dataset.active = "true";
        li.appendChild(a);
        list.appendChild(li);
      }

      frag.appendChild(list);
    }

    navRoot.replaceChildren(frag);
  }

  function rewriteContentLinks({
    container,
    currentFile,
    idByFile,
    docsIdByFile,
    wikiIdByFile,
  }) {
    const anchors = Array.from(container.querySelectorAll("a[href]"));

    for (const a of anchors) {
      const hrefRaw = a.getAttribute("href") || "";
      if (!hrefRaw || hrefRaw.startsWith("#") || isExternalHref(hrefRaw)) continue;
      if (hrefRaw.startsWith("?p=") || hrefRaw.includes("&p=")) continue;

      const [hrefPathRaw, hashRaw] = hrefRaw.split("#", 2);
      const hash = hashRaw ? `#${hashRaw}` : "";

      // Only rewrite markdown/text links to other docs.
      const looksLikeDoc =
        hrefPathRaw.endsWith(".md") ||
        hrefPathRaw.endsWith(".txt") ||
        hrefPathRaw.startsWith("docs/") ||
        hrefPathRaw.startsWith("wiki/");

      if (!looksLikeDoc) continue;

      const resolved =
        hrefPathRaw.startsWith("docs/") || hrefPathRaw.startsWith("wiki/")
          ? normalizeRelPath(hrefPathRaw)
          : resolveRelativeFile(currentFile, hrefPathRaw) ||
            normalizeRelPath(hrefPathRaw);

      if (!resolved) continue;

      const classified = classifyDocLikePath(resolved);
      const targetKind = classified.targetKind;
      const file = normalizeRelPath(classified.file);
      if (!file) continue;

      const id =
        targetKind === "wiki"
          ? wikiIdByFile.get(file) || fileToId(file)
          : docsIdByFile.get(file) || fileToId(file);

      if (!id) continue;
      const next = viewerHref(targetKind, id, hash);
      a.setAttribute("href", next);
    }
  }

  function rewriteInlineDocRefs(container, currentFile, docsIdByFile, wikiIdByFile, titleById) {
    const codes = Array.from(container.querySelectorAll("code"));
    for (const code of codes) {
      if (code.closest("pre")) continue;
      const raw = (code.textContent || "").trim();
      if (!raw) continue;

      // Drop internal meta-doc references entirely.
      if (
        raw === "STATUS.md" ||
        raw === "PLAN.md" ||
        raw === "llms.txt" ||
        raw === "README.md"
      ) {
        code.replaceWith("");
        continue;
      }

      // Paths like docs/std/foo.md, wiki/language/bar.md, or local "interfaces.md".
      const normalized =
        normalizeRelPath(raw) || resolveRelativeFile(currentFile, raw);
      if (!normalized) continue;

      const classified = classifyDocLikePath(normalized);
      const targetKind = classified.targetKind;

      let file = classified.file;
      if (!raw.startsWith("docs/") && !raw.startsWith("wiki/") && !raw.includes("/")) {
        // A bare filename like "interfaces.md" should resolve relative to this doc file.
        file = resolveRelativeFile(currentFile, file) || file;
      }

      file = normalizeRelPath(file);
      if (!file) continue;

      const id =
        targetKind === "wiki"
          ? wikiIdByFile.get(file) || fileToId(file)
          : docsIdByFile.get(file) || fileToId(file);

      const title = titleById.get(id);
      if (!title) continue;

      const a = document.createElement("a");
      a.className = "docs-inline-ref";
      a.href = viewerHref(targetKind, id);
      a.textContent = title;
      code.replaceWith(a);
    }
  }

  function compileSearch(items) {
    return items.map((item) => {
      const haystack = `${item.title} ${item.summary || ""} ${item.text || ""}`
        .toLowerCase()
        .replace(/\s+/g, " ");
      return { ...item, haystack };
    });
  }

  function tokenize(query) {
    return String(query)
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 8);
  }

  function scoreMatch(doc, terms) {
    let score = 0;
    const title = (doc.title || "").toLowerCase();
    const summary = (doc.summary || "").toLowerCase();
    for (const t of terms) {
      if (title === t) score += 1000;
      else if (title.startsWith(t)) score += 450;
      else if (title.includes(t)) score += 220;
      if (summary.includes(t)) score += 60;
      if (doc.haystack.includes(t)) score += 10;
    }
    return score;
  }

  function searchDocs(searchIndex, query, limit = 20) {
    const terms = tokenize(query);
    if (!terms.length) return [];
    const out = [];
    for (const doc of searchIndex) {
      let ok = true;
      for (const t of terms) {
        if (!doc.haystack.includes(t)) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      out.push({ doc, score: scoreMatch(doc, terms) });
    }
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, limit).map((x) => x.doc);
  }

  function renderSearchResults(results, currentId) {
    if (!resultsRoot) return;
    if (!results.length) {
      resultsRoot.innerHTML = `<div class="docs-search-empty">No results.</div>`;
      return;
    }

    const list = document.createElement("div");
    list.className = "docs-search-results";

    for (const r of results) {
      const a = document.createElement("a");
      a.className = "docs-search-result";
      a.href = viewerHref(kind, r.id);
      a.dataset.docId = r.id;
      if (r.id === currentId) a.dataset.active = "true";

      const title = document.createElement("div");
      title.className = "docs-search-result-title";
      title.textContent = r.title;

      const meta = document.createElement("div");
      meta.className = "docs-search-result-meta";
      meta.textContent = humanizeSectionName(r.section);

      const summary = document.createElement("div");
      summary.className = "docs-search-result-summary";
      summary.textContent = r.summary || "";

      a.appendChild(title);
      a.appendChild(meta);
      if (r.summary) a.appendChild(summary);
      list.appendChild(a);
    }

    resultsRoot.replaceChildren(list);
  }

  async function renderDoc(state, id, { replaceState = false } = {}) {
    const currentId = state.itemById.has(id) ? id : defaultId;
    const item = state.itemById.get(currentId);
    if (!item) return;

    if (searchInput && (searchInput.value || "").trim()) {
      // Keep nav selection stable even when search is open.
    }

    renderNav(state.index, currentId);
    setCurrentId(currentId, { replace: replaceState });
    updateBreadcrumb(item.section, item.title);
    renderPrevNext(state.flat, currentId);

    if (!contentRoot) return;

    const url = `${baseUrl}${item.file}`;
    let raw = "";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      raw = await res.text();
    } catch {
      contentRoot.innerHTML = `<h1>Not found</h1><p>Unable to load this page.</p>`;
      if (tocRoot) tocRoot.hidden = true;
      return;
    }

    const text = sanitizeMarkdown(raw);

    let html = "";
    if (item.file.endsWith(".md") && marked?.parse) {
      html = marked.parse(text);
    } else {
      html = `<pre><code class="language-plaintext">${escapeHtml(text)}</code></pre>`;
    }

    contentRoot.innerHTML = html;
    rewriteContentLinks({
      container: contentRoot,
      currentFile: item.file,
      idByFile: state.idByFile,
      docsIdByFile: state.docsIdByFile,
      wikiIdByFile: state.wikiIdByFile,
    });
    rewriteInlineDocRefs(
      contentRoot,
      item.file,
      state.docsIdByFile,
      state.wikiIdByFile,
      state.titleById
    );
    addHeadingAnchors(contentRoot);
    renderToc(contentRoot);
    highlightContent(contentRoot);

    document.title = `${item.title} · ${titleSuffix} · Oro Computer`;

    if (globalThis.location.hash) {
      const targetId = globalThis.location.hash.slice(1);
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView();
    }
  }

  async function init() {
    if (!navRoot || !contentRoot) return;

    const [index, search] = await Promise.all([
      fetch(indexUrl).then((r) => (r.ok ? r.json() : null)),
      fetch(searchUrl).then((r) => (r.ok ? r.json() : null)),
    ]);

    if (!index || !index.sections) {
      contentRoot.innerHTML =
        "<h1>Docs unavailable</h1><p>Unable to load the docs index.</p>";
      if (tocRoot) tocRoot.hidden = true;
      return;
    }

    const flat = [];
    const itemById = new Map();
    const titleById = new Map();
    const docsIdByFile = new Map();
    const wikiIdByFile = new Map();

    for (const section of index.sections || []) {
      for (const item of section.items || []) {
        const merged = {
          id: item.id,
          title: item.title,
          file: item.file,
          section: section.name || "overview",
        };
        flat.push(merged);
        itemById.set(merged.id, merged);
        titleById.set(merged.id, merged.title);
        if (kind === "docs") docsIdByFile.set(merged.file, merged.id);
        if (kind === "wiki") wikiIdByFile.set(merged.file, merged.id);
      }
    }

    // Build file->id maps for both kinds from on-disk indexes when available.
    // These are used to rewrite "docs/..." and "wiki/..." references.
    try {
      if (kind === "docs") {
        const other = await fetch("../wiki/index.json").then((r) =>
          r.ok ? r.json() : null
        );
        for (const s of other?.sections || []) {
          for (const it of s.items || []) {
            wikiIdByFile.set(it.file, it.id);
            if (!titleById.has(it.id)) titleById.set(it.id, it.title);
          }
        }
      } else {
        const other = await fetch("../docs/index.json").then((r) =>
          r.ok ? r.json() : null
        );
        for (const s of other?.sections || []) {
          for (const it of s.items || []) {
            docsIdByFile.set(it.file, it.id);
            if (!titleById.has(it.id)) titleById.set(it.id, it.title);
          }
        }
      }
    } catch {}

    const searchIndex = compileSearch(search?.items || []);

    const state = {
      index,
      flat,
      itemById,
      titleById,
      idByFile: kind === "docs" ? docsIdByFile : wikiIdByFile,
      docsIdByFile,
      wikiIdByFile,
      searchIndex,
    };

    const initial = getCurrentId();
    await renderDoc(state, initial, { replaceState: true });

    function navigateToId(id) {
      renderDoc(state, id).catch(() => {});
    }

    navRoot.addEventListener("click", (event) => {
      const a = event.target?.closest?.("a[data-doc-id]");
      if (!a) return;
      const id = a.dataset.docId;
      if (!id) return;
      event.preventDefault();
      if (searchInput) searchInput.value = "";
      if (resultsRoot) resultsRoot.hidden = true;
      if (navRoot) navRoot.hidden = false;
      navigateToId(id);
    });

    if (resultsRoot) {
      resultsRoot.addEventListener("click", (event) => {
        const a = event.target?.closest?.("a[data-doc-id]");
        if (!a) return;
        const id = a.dataset.docId;
        if (!id) return;
        event.preventDefault();
        if (searchInput) searchInput.value = "";
        resultsRoot.hidden = true;
        navRoot.hidden = false;
        navigateToId(id);
      });
    }

    if (prevRoot) {
      prevRoot.addEventListener("click", (event) => {
        const a = event.target?.closest?.("a[href]");
        if (!a) return;
        const url = new URL(a.href);
        const p = url.searchParams.get("p");
        if (!p) return;
        event.preventDefault();
        navigateToId(p);
      });
    }

    if (nextRoot) {
      nextRoot.addEventListener("click", (event) => {
        const a = event.target?.closest?.("a[href]");
        if (!a) return;
        const url = new URL(a.href);
        const p = url.searchParams.get("p");
        if (!p) return;
        event.preventDefault();
        navigateToId(p);
      });
    }

    globalThis.addEventListener("popstate", () => {
      const id = getCurrentId();
      renderDoc(state, id, { replaceState: true }).catch(() => {});
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = (searchInput.value || "").trim();
        if (!q) {
          if (resultsRoot) resultsRoot.hidden = true;
          navRoot.hidden = false;
          return;
        }

        const currentId = getCurrentId();
        const results = searchDocs(state.searchIndex, q, 20);
        navRoot.hidden = true;
        if (resultsRoot) {
          resultsRoot.hidden = false;
          renderSearchResults(results, currentId);
        }
      });

      searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          searchInput.value = "";
          if (resultsRoot) resultsRoot.hidden = true;
          navRoot.hidden = false;
          searchInput.blur();
        }
      });
    }

    globalThis.addEventListener("keydown", (event) => {
      if (!searchInput) return;
      const key = String(event.key || "");

      if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
        return;
      }

      if (key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const active = document.activeElement;
        const tag = (active?.tagName || "").toLowerCase();
        const typing =
          tag === "input" ||
          tag === "textarea" ||
          active?.isContentEditable === true;
        if (typing) return;
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  init().catch(() => {});
})();

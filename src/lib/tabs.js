export function renderTabs(container) {
    if (!container) return;
    const doc = container.ownerDocument || document;

    const walker = doc.createTreeWalker(container, NodeFilter.SHOW_COMMENT);
    const starts = [];
    let node = null;
    while ((node = walker.nextNode())) {
      const text = String(node.data || "").trim();
      if (text.startsWith("tabs:start")) starts.push(node);
    }

    let counter = 0;

    for (const start of starts) {
      if (!start.isConnected) continue;
      const startText = String(start.data || "").trim();
      const m = startText.match(/^tabs:start(?:\s+(.+))?$/);
      const label = (m && m[1] ? m[1] : "").trim() || null;

      const parent = start.parentNode;
      if (!parent) continue;

      let end = null;
      let cur = start.nextSibling;
      while (cur) {
        if (cur.nodeType === Node.COMMENT_NODE && String(cur.data || "").trim().startsWith("tabs:end")) {
          end = cur;
          break;
        }
        cur = cur.nextSibling;
      }
      if (!end) continue;

      const between = [];
      cur = start.nextSibling;
      while (cur && cur !== end) {
        between.push(cur);
        cur = cur.nextSibling;
      }

      const headings = between.filter(
        (n) => n.nodeType === Node.ELEMENT_NODE && /^H[2-6]$/.test(n.tagName || "")
      );
      if (!headings.length) {
        start.remove();
        end.remove();
        continue;
      }

      const headingTag = headings[0].tagName;
      const tabHeadings = headings.filter((h) => h.tagName === headingTag);
      if (!tabHeadings.length) continue;

      counter += 1;
      const idPrefix = `tabs-doc-${counter}`;

      const set = doc.createElement("div");
      set.className = "tabs";
      set.dataset.tabs = "true";

      const list = doc.createElement("div");
      list.className = "tabs-list";
      list.setAttribute("role", "tablist");
      if (label) list.setAttribute("aria-label", label);
      set.appendChild(list);

      const panels = [];

      for (let i = 0; i < tabHeadings.length; i += 1) {
        const heading = tabHeadings[i];
        const title = String(heading.textContent || "").replace(/#$/, "").trim() || `Tab ${i + 1}`;

        const tab = doc.createElement("button");
        tab.type = "button";
        tab.className = "tabs-tab";
        tab.id = `${idPrefix}-tab-${i}`;
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
        tab.tabIndex = i === 0 ? 0 : -1;
        tab.textContent = title;
        list.appendChild(tab);

        const panel = doc.createElement("div");
        panel.className = "tabs-panel";
        panel.id = `${idPrefix}-panel-${i}`;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        panel.hidden = i !== 0;
        set.appendChild(panel);
        panels.push(panel);

        let child = heading.nextSibling;
        while (child && child !== end && !(child.nodeType === Node.ELEMENT_NODE && child.tagName === headingTag)) {
          const next = child.nextSibling;
          if (child.nodeType === Node.TEXT_NODE && !String(child.textContent || "").trim()) {
            child.remove();
          } else {
            panel.appendChild(child);
          }
          child = next;
        }

        if (heading.id) {
          const anchor = doc.createElement("span");
          anchor.id = heading.id;
          anchor.className = "docs-tab-anchor";
          panel.prepend(anchor);
        }
        heading.remove();
      }

      parent.insertBefore(set, start);

      // Any leftover nodes between the markers are treated as part of the first tab.
      let remainder = start.nextSibling;
      while (remainder && remainder !== end) {
        const next = remainder.nextSibling;
        if (remainder.nodeType === Node.TEXT_NODE && !String(remainder.textContent || "").trim()) {
          remainder.remove();
        } else {
          panels[0]?.appendChild(remainder);
        }
        remainder = next;
      }

      start.remove();
      end.remove();
    }
  }


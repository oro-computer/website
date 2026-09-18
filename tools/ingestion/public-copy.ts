// Public-copy normalization, moved from the legacy viewer. Import-time only.
export interface SanitizeMarkdownOptions {
  currentFile?: string;
  kind?: "docs" | "wiki";
}

export function sanitizeMarkdown(markdown: string, { currentFile = "", kind = "docs" }: SanitizeMarkdownOptions = {}): string {
    const banned =
      /(STATUS\.md|PLAN\.md|docs\/wiki\/style-guide\.md|_template-[^`\\s]+|style-guide\.md|README\.md)/;
    const statusLine = /^(Status:|Implementation status:)\s*/i;
    const isSpec = String(currentFile || "").startsWith("spec/");
    const isLanguageDoc = String(currentFile || "").startsWith("language/");
    const testsHeading = /^(#{1,6})\s+Tests\b/i;

    function rewriteStatusLine(line: string): string | null {
      const m = String(line).match(/^(\s*)(Status:|Implementation status:)\s*/i);
      if (!m) return null;
      const leading = m[1] || "";
      const rest = line.slice(m[0].length);

      // Keep any prose that follows the status marker, while dropping the marker itself.
      // Examples:
      //   Status: **Implemented subset**: foo
      //   Status: **Implemented**. `std::http` provides ...
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

    function rewriteOutsideCode(text: string): string {
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
        /^(\s*#{1,6}\s+)Status(?:\s+and\s+Future\s+Work)?(?:\s*\([^)]*\))?\s*$/i,
        "$1Notes"
      );
      out = out.replace(
        /^(\s*#{1,6}\s+)(?:Current\s+|Initial\s+)?Implemented\s+Subset\s*$/i,
        "$1Details"
      );
      out = out.replace(/^(\s*#{1,6}\s+)Implemented\s*$/i, "$1Details");
      out = out.replace(/^(\s*#{1,6}\s+)Current API(?:\s*\([^)]*\))?\s*$/i, "$1Exported API");
      out = out.replace(
        /^(\s*#{1,6}\s+)API\s*\((?:current|selected|implemented[^)]*|initial[^)]*)\)\s*$/i,
        "$1Exported API"
      );
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

      if (kind === "wiki") {
        out = out.replace(/^(\s*#{1,6}\s+)Status\s*$/i, "$1Notes");
        out = out.replace(
          /^(\s*)Canonical (?:doc|spec|design doc):\s*/i,
          "$1Full reference: "
        );
        out = out.replace(
          /^(\s*(?:[-*+]\s+)?)Canonical (?:doc|spec|design doc):\s*/i,
          "$1Full reference: "
        );
        out = out.replace(
          /^(\s*(?:[-*+]\s+)?)Details:\s*/i,
          "$1Full reference: "
        );
        out = out.replace(
          /^(\s*(?:[-*+]\s+)?)Implemented subset (?:is documented in detail|is documented|notes|details|rules|syntax notes|tests|diagnostics|restrictions):\s*/i,
          "$1Full reference: "
        );
        out = out.replace(
          /^(\s*(?:[-*+]\s+)?)Implemented subset \+ [^:]+:\s*/i,
          "$1Full reference: "
        );
        out = out.replace(
          /^(\s*(?:[-*+]\s+)?)Implemented-subset details(?: and current limitations)?:\s*/i,
          "$1Full reference: "
        );
        out = out.replace(
          /^(\s*(?:[-*+]\s+)?)Current supported(?: forms and restrictions| `ext` subset \+ ABI notes)?:\s*/i,
          "$1Full reference: "
        );
        out = out.replace(
          /^(\s*(?:[-*+]\s+)?)Syntax \+ conformance checking:\s*/i,
          "$1Full reference: "
        );
      }

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
    let codeLang: string | null = null;
    let skipLevel: number | null = null;
    let skipRepoFixtureList = false;
    let skipWikiFixtureBullets = false;

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

      if (isSpec && !inCode) {
        const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*$/);
        if (skipLevel !== null && headingMatch) {
          const level = headingMatch[1].length;
          if (level <= skipLevel) skipLevel = null;
        }

        if (skipLevel === null) {
          const testsMatch = line.match(testsHeading);
          if (testsMatch) {
            skipLevel = testsMatch[1].length;
            continue;
          }
        }
      }

      if (skipLevel !== null) continue;

      if (!inCode && kind === "wiki" && skipWikiFixtureBullets) {
        if (
          /^\s*$/.test(line) ||
          /^\s*[-*+]\s+`tests\/silk\/[^`]+`\s*$/.test(line)
        ) {
          continue;
        }
        skipWikiFixtureBullets = false;
      }

      if (!inCode && skipRepoFixtureList) {
        if (
          /^\s*$/.test(line) ||
          /^\s*[-*+]\s+`(?:tests|examples|c-tests|src|include|vendor|std)\/[^`]+`\s*$/.test(line)
        ) {
          continue;
        }
        skipRepoFixtureList = false;
      }

      if (!inCode && isLanguageDoc) {
        if (/^\s*Examples that exercise the implemented subset:\s*$/i.test(line)) {
          skipRepoFixtureList = true;
          continue;
        }
        line = line.replace(
          /^(\s*#{1,6}\s+)Implementation Status(?:\s*\([^)]*\))?\s*$/i,
          "$1Notes"
        );
        line = line.replace(
          /^(\s*#{1,6}\s+)Current behavior\s*$/i,
          "$1Supported forms"
        );
        line = line.replace(/^\s*Implemented end-to-end:\s*$/i, "Supported forms:");
        line = line.replace(/^\s*Not implemented yet:\s*$/i, "Limitations:");
      }

      if (!inCode && kind === "wiki") {
        if (/^\s*[-*+]\s+End-to-end fixtures:\s*$/i.test(line)) {
          skipWikiFixtureBullets = true;
          continue;
        }
        if (
          /^\s*[-*+]\s+(?:End-to-end fixture(?:s)?|Fixtures|Enum fixtures|Optional-related fixtures)(?:\s*\([^)]*\))?:\s*`tests\/silk\/[^`]+`\s*$/i.test(line)
        ) {
          continue;
        }
        line = line.replace(
          /^(\s*[-*+]\s+)Use `tests\/silk\/pass_\*\.slk` for runnable examples\.\s*$/i,
          "$1Use the canonical docs for runnable examples."
        );
      }

      if (
        !inCode &&
        /^\s*[-*+]\s+`tests\/silk\/[^`]+`(?:\s*\([^)]*\))?\s*$/i.test(line)
      ) {
        continue;
      }

      if (!inCode && statusLine.test(line)) {
        const rewritten = rewriteStatusLine(line);
        if (!rewritten || !rewritten.trim()) continue;
        line = rewritten;
      }

      if (!inCode && banned.test(line)) continue;

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
      }

      out.push(line);
    }

    return out.join("\n");
  }


  function dropProposalProcess(markdown: string): string {
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

export function sanitizeSpecMarkdown(markdown: string): string {
    // Keep the spec faithful, but remove repo-workflow prose and status framing
    // that does not belong in a standalone reader-facing specification.
    const banned =
      /(STATUS\.md|PLAN\.md|docs\/wiki\/style-guide\.md|_template-[^`\\s]+|style-guide\.md|README\.md)/;
    const statusLine = /^(Status:|Implementation status:)\s*/i;
    const statusHeading = /^(#{1,6})\s+(Status|Implementation status)\s*:?\s*$/i;
    const testsHeading = /^(#{1,6})\s+Tests\b/i;

    function rewriteStatusLine(line: string): string | null {
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

    function rewriteOutsideCode(text: string): string {
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
    let skipLevel: number | null = null;
    let codeLang: string | null = null;
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
        const rewriteComment = (comment: string): string => {
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


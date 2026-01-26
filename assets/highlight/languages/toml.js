/*
Language: TOML
Description: Minimal syntax highlighting for TOML configuration files.
Author: Oro Computer
*/

(function () {
  function defineToml(hljs) {
    const COMMENT = hljs.COMMENT("#", "$", { relevance: 0 });

    const BASIC_STRING = {
      className: "string",
      begin: /"/,
      end: /"/,
      contains: [hljs.BACKSLASH_ESCAPE],
      illegal: /\n/,
    };

    const LITERAL_STRING = {
      className: "string",
      begin: /'/,
      end: /'/,
      illegal: /\n/,
    };

    const MULTILINE_BASIC = {
      className: "string",
      begin: /"""/,
      end: /"""/,
      contains: [hljs.BACKSLASH_ESCAPE],
    };

    const MULTILINE_LITERAL = {
      className: "string",
      begin: /'''/,
      end: /'''/,
    };

    const NUMBER = {
      className: "number",
      variants: [
        { begin: /\b[+-]?\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?\b/ },
        { begin: /\b0x[0-9A-Fa-f](?:[0-9A-Fa-f_]*[0-9A-Fa-f])?\b/ },
        { begin: /\b0o[0-7](?:[0-7_]*[0-7])?\b/ },
        { begin: /\b0b[01](?:[01_]*[01])?\b/ },
      ],
      relevance: 0,
    };

    const LITERAL = {
      className: "literal",
      begin: /\b(?:true|false)\b/,
      relevance: 0,
    };

    const DATE_TIME = {
      className: "number",
      begin:
        /\b\d{4}-\d{2}-\d{2}(?:[Tt ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?\b/,
      relevance: 0,
    };

    const TABLE = {
      className: "section",
      begin: /^\s*\[\[?/,
      end: /\]\]?\s*$/,
      contains: [COMMENT],
    };

    const KEY = {
      className: "attr",
      variants: [
        { begin: /^[ \t]*[A-Za-z0-9_-]+(?=\s*=)/m },
        { begin: /^[ \t]*"(?:\\.|[^"\\])*"(?=\s*=)/m },
        { begin: /^[ \t]*'(?:\\.|[^'\\])*'(?=\s*=)/m },
      ],
      relevance: 0,
    };

    return {
      name: "TOML",
      aliases: ["toml"],
      contains: [
        COMMENT,
        TABLE,
        KEY,
        MULTILINE_BASIC,
        MULTILINE_LITERAL,
        BASIC_STRING,
        LITERAL_STRING,
        DATE_TIME,
        LITERAL,
        NUMBER,
      ],
    };
  }

  if (typeof hljs !== "undefined" && hljs && typeof hljs.registerLanguage === "function") {
    hljs.registerLanguage("toml", defineToml);
  } else {
    globalThis.hljsDefineToml = defineToml;
  }
})();


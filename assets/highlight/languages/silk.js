/*
Language: Silk
Description: Syntax highlighting for the Silk programming language.
Author: Silk contributors
Source: silk/highlight/silk.js (copied for website usage)
*/

(function () {
  function defineSilk(hljs) {
    const DOC_TAG = {
      className: "doctag",
      begin:
        /@(param|returns|throws|example|since|deprecated|remarks|see|misc|cli|synopsis|option|command)\b/,
      relevance: 0,
    };

    const DOC_LINE_COMMENT = {
      className: "comment",
      begin: "///",
      end: "$",
      contains: [DOC_TAG],
    };

    const DOC_BLOCK_COMMENT = {
      className: "comment",
      begin: /\/\*\*/,
      end: /\*\//,
      contains: [DOC_TAG],
    };

    const LINE_COMMENT = {
      className: "comment",
      begin: /\/\/(?!\/)/,
      end: "$",
    };

    const BLOCK_COMMENT = {
      className: "comment",
      begin: /\/\*(?!\*)/,
      end: /\*\//,
    };

    const ESCAPE = {
      className: "escape",
      begin: /\\(?:[nrt0\\\"']|x[0-9A-Fa-f]{2}|u\{[0-9A-Fa-f]{1,6}\}|.)/,
      relevance: 0,
    };

    const STRING = {
      className: "string",
      begin: /"/,
      end: /"/,
      illegal: /\n/,
      contains: [ESCAPE],
    };

    const RAW_STRING = {
      className: "string",
      begin: /`/,
      end: /`/,
    };

    const CHAR = {
      className: "string",
      begin: /'/,
      end: /'/,
      illegal: /\n/,
      contains: [ESCAPE],
    };

    const NUMBER = {
      className: "number",
      variants: [
        { begin: /\b[0-9]+(?:\.[0-9]+)?(?:ns|us|ms|s|min|h|d)\b/ },
        { begin: /\b[0-9]+\.[0-9]+\b/ },
        { begin: /\b[0-9]+\b/ },
      ],
      relevance: 0,
    };

    const VERIFIER = {
      className: "meta",
      begin: /#[ \t]*(?:const|require|assure|assert|invariant|variant|theory)\b/,
      relevance: 0,
    };

    const INTRINSIC = {
      className: "built_in",
      begin: /\b__silk_[A-Za-z0-9_]+\b/,
      relevance: 0,
    };

    const SPECIAL_FN = {
      className: "title",
      begin: /\b(?:constructor|drop)\b(?=\s*\()/,
      relevance: 0,
    };

    const STD_PACKAGE = {
      className: "namespace",
      begin: /\bstd::/,
      relevance: 0,
    };

    const MAP_TYPE = {
      className: "type",
      begin: /\bmap\b(?=\s*\()/,
      relevance: 0,
    };

    const RESULT_LIKE = {
      className: "literal",
      begin: /\b(?:Ok|Err)\b(?=\s*\()/,
      relevance: 0,
    };

    return {
      name: "Silk",
      aliases: ["silk", "slk"],
      keywords: {
        keyword:
          "package module import from export public private default const let var mut move fn test theory struct extends enum error interface impl using as raw type pure async task region with new sizeof alignof offsetof typename ext where if else match while for in loop return panic break continue assert await yield",
        type: "bool u8 i8 u16 i16 u32 i32 u64 i64 int usize isize f32 f64 char string regexp void Instant Duration Region Option Buffer Self Task Promise",
        literal: "true false None none null Some",
      },
      contains: [
        DOC_LINE_COMMENT,
        DOC_BLOCK_COMMENT,
        LINE_COMMENT,
        BLOCK_COMMENT,
        STRING,
        RAW_STRING,
        CHAR,
        NUMBER,
        VERIFIER,
        INTRINSIC,
        SPECIAL_FN,
        STD_PACKAGE,
        MAP_TYPE,
        RESULT_LIKE,
      ],
    };
  }

  if (typeof hljs !== "undefined" && hljs && typeof hljs.registerLanguage === "function") {
    hljs.registerLanguage("silk", defineSilk);
  } else {
    globalThis.hljsDefineSilk = defineSilk;
  }
})();


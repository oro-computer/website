/*
Language: Silk
Description: Syntax highlighting for the Silk programming language.
Author: Silk contributors
*/

module.exports = function (hljs) {
  const KEYWORDS = {
    keyword:
      "package module import from export public private default const let var mut move fn test theory struct extends enum error interface impl using as raw type pure async task region with new sizeof alignof offsetof typename ext where if else match while for in loop return panic break continue assert await yield",
    type: "bool u8 i8 u16 i16 u32 i32 u64 i64 int usize isize f32 f64 char string regexp void Instant Duration Region Option Buffer Self Task Promise",
    literal: "true false None none null Some",
  };

  const DOC_TAG = {
    className: "doctag",
    begin:
      /@(param|returns|throws|external|requires|assures|asserts|theory|example|since|deprecated|remarks|see|misc|cli|synopsis|option|command)\b/,
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

  const QUALIFIED_NAME = /(?:::)?[A-Za-z_]\w*(?:::[A-Za-z_]\w*)*/;

  const DECL_FN = {
    match: [/\bfn\b/, /\s+/, /[A-Za-z_]\w*/, /\s*(?=\()/],
    scope: {
      1: "keyword",
      3: "title.function",
    },
    relevance: 0,
  };

  const DECL_TYPE = {
    match: [/\b(struct|enum|error|interface)\b/, /\s+/, /[A-Za-z_]\w*/],
    scope: {
      1: "keyword",
      3: "title.class",
    },
    relevance: 0,
  };

  const DECL_IMPL = {
    variants: [
      {
        match: [/\bimpl\b/, /\s+/, QUALIFIED_NAME, /\s+/, /\bas\b/, /\s+/, QUALIFIED_NAME],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class",
        },
        relevance: 0,
      },
      {
        match: [/\bimpl\b/, /\s+/, QUALIFIED_NAME],
        scope: {
          1: "keyword",
          3: "title.class",
        },
        relevance: 0,
      },
    ],
    relevance: 0,
  };

  const DECL_PACKAGE = {
    match: [/\b(package|module)\b/, /\s+/, QUALIFIED_NAME],
    scope: {
      1: "keyword",
      3: "title.class",
    },
    relevance: 0,
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
    begin: /#[ \t]*(?:const|require|assure|assert|invariant|variant|monovariant|theory)\b/,
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

  const REGEXP_ESCAPE = {
    begin: /\\[\s\S]/,
    relevance: 0,
  };

  const REGEXP_LITERAL = {
    className: "regexp",
    begin: /\/(?![/*])(?=[^/\n]*\/)/,
    end: /\/[gimsyd]*/,
    contains: [
      REGEXP_ESCAPE,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [REGEXP_ESCAPE],
      },
    ],
  };

  const REGEXP_CONTEXT = {
    begin:
      "(" +
      hljs.RE_STARTERS_RE +
      "|\\b(return|panic|assert)\\b)\\s*",
    keywords: "return panic assert",
    relevance: 0,
    contains: [DOC_LINE_COMMENT, DOC_BLOCK_COMMENT, LINE_COMMENT, BLOCK_COMMENT, REGEXP_LITERAL],
  };

  return {
    name: "Silk",
    aliases: ["silk", "slk"],
    disableAutodetect: true,
    keywords: KEYWORDS,
    contains: [
      DOC_LINE_COMMENT,
      DOC_BLOCK_COMMENT,
      LINE_COMMENT,
      BLOCK_COMMENT,
      DECL_PACKAGE,
      DECL_TYPE,
      DECL_IMPL,
      DECL_FN,
      REGEXP_CONTEXT,
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
};

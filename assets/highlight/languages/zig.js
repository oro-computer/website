/*
Language: Zig
Description: Minimal syntax highlighting for Zig source files.
Author: Oro Computer (based on Zig language surface)
*/

(function () {
  function defineZig(hljs) {
    const KEYWORDS = {
      keyword:
        "addrspace align allowzero and anyframe anytype asm async await break catch comptime const continue defer else enum errdefer error export extern fn for if inline linksection noalias noinline nosuspend orelse packed pub resume return callconv struct suspend switch test threadlocal try union unreachable usingnamespace var volatile while",
      type:
        "anyopaque bool comptime_float comptime_int f16 f32 f64 f80 f128 i0 i8 i16 i32 i64 i128 isize u0 u8 u16 u32 u64 u128 usize noreturn void",
      literal: "true false null undefined",
      built_in:
        "@Type @TypeOf @This @import @cImport @cInclude @cDefine @cUndef @cEnum @cType @cShort @cUShort @cInt @cUInt @cLong @cULong @cLongLong @cULongLong @cLongDouble @intCast @floatCast @ptrCast @bitCast @as @enumFromInt @intFromEnum @intFromPtr @ptrFromInt @truncate @divTrunc @divFloor @mod @rem @panic @compileError @setRuntimeSafety @setEvalBranchQuota @sizeOf @alignOf @offsetOf @field @fieldParentPtr @tagName @errorName @errorReturnTrace @frameAddress @returnAddress @reduce @splat @shuffle @Vector @bitSizeOf @hasDecl @hasField @typeInfo @typeName @isComptime @errorCast @errorFromInt @intFromError @floatFromInt @intFromFloat @min @max",
    };

    const LINE_COMMENT = hljs.COMMENT("//", "$", { relevance: 0 });
    const BLOCK_COMMENT = hljs.COMMENT("/\\*", "\\*/", { relevance: 0 });

    const CHAR = {
      className: "string",
      begin: /'(?:\\.|[^'\\])'/,
      relevance: 0,
    };

    const STRING = {
      className: "string",
      variants: [
        // Zig uses normal double-quoted strings and also supports C string literals (`c"..."`).
        { begin: /c?\"/, end: /\"/, contains: [hljs.BACKSLASH_ESCAPE], illegal: /\n/ },
      ],
    };

    const NUMBER = {
      className: "number",
      begin:
        /\b(?:0b[01_]+|0o[0-7_]+|0x[0-9a-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?)\b/,
      relevance: 0,
    };

    return {
      name: "Zig",
      aliases: ["zig"],
      keywords: KEYWORDS,
      contains: [LINE_COMMENT, BLOCK_COMMENT, STRING, CHAR, NUMBER],
    };
  }

  if (typeof hljs !== "undefined" && hljs && typeof hljs.registerLanguage === "function") {
    hljs.registerLanguage("zig", defineZig);
  } else {
    globalThis.hljsDefineZig = defineZig;
  }
})();

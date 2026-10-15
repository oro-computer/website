---
layout: "docs"
description: "src/complexity.zig is the canonical cyclomatic-complexity implementation for Silk compiler tooling. silk check, silk-lsp, future reports, and repository tools consume this module rather than maintaini"
docsCollection: "silk"
section: "compiler"
order: 309
sourcePath: "compiler/complexity-analysis.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Complexity Analysis API

[`src/complexity.zig`](https://github.com/oro-computer/silk/blob/master/src/complexity.zig) is the canonical cyclomatic-complexity implementation for
Silk compiler tooling. `silk check`, `silk-lsp`, future reports, and repository
tools consume this module rather than maintaining separate counters.

Downstream Zig tools that import the installed `silk` module use
`silk.tooling.complexity`. The matching `silk.tooling.parser` and
`silk.tooling.ast` exports provide the parsed module accepted by the analyzer.
These exports point at the compiler's canonical modules; they are not parallel
wrapper types.

The analyzer operates on a parsed `ast.Module`. It does not require name
resolution or type checking, although target-aware callers should run attribute
filtering first so inactive declarations do not appear in the report.

## Public contract

The primary entry point is:

```zig
const silk = @import("silk");

var parser = try silk.tooling.parser.Parser.init(allocator, source);
const module = try parser.parseModule();
var analysis = try silk.tooling.complexity.analyzeModule(allocator, &module, .{
  .variant = .Classic,
  .collect_decisions = true,
});
defer analysis.deinit(allocator);
```

`Analysis` has schema version `1` and contains:

- the selected `Variant` (`Classic` or `Modified`),
- an `evidence_collected` flag that distinguishes omitted evidence from a body
 with no decisions,
- deterministic source-ordered `BodyReport` values,
- and an `AnalysisSummary` covering the module.

Each `BodyReport` provides:

- a stable `BodyId` made from body kind and source token offset,
- body kind (`Function`, `Method`, `AnonymousFunction`, `Test`, or
 `NestedTest`), borrowed name, nearest scope/owner name, and optional parent
 body identity,
- the exact declaration/body anchor token,
- `BodyMetrics`, including cyclomatic complexity, contributed decision points,
 deepest decision nesting, decision-event count, and saturation state,
- source-ordered `Decision` evidence when `collect_decisions` is enabled,
- category-count helpers, threshold comparison, and allocation-backed display
 name/detail/breakdown renderers shared by diagnostics.

Each `Decision` records its `DecisionKind`, category, contribution, one-based
control-flow nesting depth, source token, and `AnchorPrecision`. Each decision
kind also exposes a stable short label and a user-facing explanation of why the
syntax creates another selectable runtime path, allowing evidence views and
editor hovers to remain consistent. `Exact` means the token is the syntax that
introduced the decision. `Related` is used only when the AST has no distinct
token for the syntactic separator, such as a parameter default's `=` or a
chained `if let` clause from an older/synthetic AST producer; the related token
still identifies the relevant operand or parameter.

`AnalysisSummary` reports body count, total complexity, total decision points,
total decision events, maximum complexity, deepest nesting,
highest-complexity body index, and the number of saturated bodies. Empty
modules have zero totals and no highest-body index.

The report owns its body and decision slices. Names and tokens borrow storage
from the AST, so the parsed module must outlive the report. `Analysis.deinit`
releases only report-owned allocations. Callers using an arena may omit
individual cleanup and release the arena as one unit.

`Analysis.validate()` performs an allocation-free integrity check for tooling
and serialization boundaries. It verifies the schema, source ordering, unique
body IDs, identity/token agreement, parent metadata, summary, baseline
equation, category totals, and, when retained, decision ordering and
contribution evidence. `BodyId` is module-local; a workspace tool pairs it with
the module URI or canonical path. Analyzer-produced reports satisfy this
contract; the method is also useful after transport or adapter code has copied
the public data model.

`measureModule` remains as a compact compatibility helper for callers that need
only the former `name` / `token` / `value` findings. New tooling should use
`analyzeModule` so it does not discard evidence.

## Mathematical invariants

For every body that does not saturate:

```text
cyclomatic_complexity = 1 + decision_points
decision_points       = sum(decision.contribution) when evidence is collected
```

Every runtime body starts at `1`. Arithmetic saturates instead of wrapping;
`saturated = true` makes that state explicit to callers. Module totals use
saturating `u64` arithmetic and expose a summary saturation flag.

Bodies and their decision evidence are sorted by byte offset with stable
kind-based tie breaking. This makes reports deterministic across allocator
choices and traversal details. Nested anonymous functions and nested tests are
independent bodies: their decisions never inflate the enclosing body.

## Decision taxonomy

The analyzer groups concrete decision kinds into categories so callers can show
both exact evidence and compact summaries.

| Category | Decision kinds |
| --- | --- |
| Conditional | `if`, `if let`, `let ... else`, and `if` expressions |
| Loop | [`while`](/silk/wiki/language/flow-while/), `while let`, `for`, C-style `for`, [`loop`](/silk/wiki/language/flow-loop/), `async loop`, and `task loop` |
| Pattern | additional `if let` / `while let` chain clauses and the refutable filter in `for let` |
| Match | classic non-catch-all arms or one modified-mode [`match`](/silk/wiki/language/flow-match/) event |
| Logical | short-circuit `&&`, `||`, and `??` |
| Optional/error | optional access `?.`, error propagation `?`, and terminal coalescing control |
| Parameter | a defaulted runtime parameter |

`for let` contributes one loop decision and one pattern-filter decision. A
typed match binder such as `value: SomeType` is selective and contributes in
classic mode. Only `_` and an untyped whole-value statement binder are
catch-all patterns.

For `Classic`, every non-catch-all match arm contributes one decision. For
`Modified`, the entire match contributes one decision regardless of its arms.
The evidence token is the pattern token in classic mode and the [`match`](/silk/wiki/language/flow-match/) token
in modified mode.

Formal Silk specifications and expressions evaluated only for compile-time
metadata (`sizeof`, `alignof`, `typename`, struct defaults, and specification
statements) do not add runtime decisions. Executable anonymous functions found
inside such expressions are still reported as independent bodies.

## Consumer guidance

- Threshold rules compare `BodyMetrics.cyclomatic_complexity` strictly greater
 than the configured maximum.
- Diagnostics should anchor the body token and use the shared display/detail
 helpers. Decision evidence is supporting data, not a replacement for the
 stable `L5001` body-level diagnostic.
- Editor tools may use `BodyId` and decision tokens for code lenses, hovers,
 heat maps, or navigation without parsing human-readable diagnostic text.
- Machine consumers should key serialized data by `schema_version`, enum name,
 body ID, and byte offsets. Human-rendered strings are intentionally polished
 but are not a machine protocol.

The package rule and CLI/LSP behavior are specified in
[package manifests](/silk/docs/compiler/package-manifests/), [cli silk](/silk/docs/compiler/cli-silk/), and
[lsp silk](/silk/docs/compiler/lsp-silk/). Stable user diagnostics are specified in
[diagnostics](/silk/docs/compiler/diagnostics/).

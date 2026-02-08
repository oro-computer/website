# Formal Grammar Spec

This document contains the formal grammar and lexical specification for Silk as used by the compiler implementation.

## Lexical Structure (Overview)

The lexer operates over:

- Whitespace and comments (trivia):
  - spaces, tabs, newlines;
  - line comments starting with `//` and continuing to the end of the line;
    doc line comments start with `///` and follow the same lexical rules;
  - block comments starting with `/*` and ending with the next `*/` (non‑nesting);
    doc block comments start with `/**` and also end at the next `*/`.

    Both doc-comment forms are still **trivia** for the parser (they do not
    affect the syntax tree), but tooling may preserve and parse their text for
    documentation generation as specified in `docs/language/doc-comments.md`.
- Identifiers:
  - sequences of Unicode letters, digits, and `_`, with language-specific rules for leading characters.
  - Keywords:
  - packages and imports: `package`, `module`, `import`,
    file imports: `from`,
  - control flow: `if`, `else`, `loop`, `while`, `for`, `in`, `match`, `return`, `panic`, `break`, `continue`, `assert`, `await`, `yield`,
  - declarations and mutability: `export`, `public`, `private`, `default`, `const`, `let`, `var`, `mut`, `fn`, `test`, `theory`, `type`,
  - types and declarations: `struct`, `enum`, `error`, `interface`, `impl`, `as`, `raw`, `extends`, `pure`, `task`, `async`,
  - memory and regions: `move`, `region`, `with`, `new`,
  - other operators: `sizeof`, `alignof`, `offsetof`, `typename`,
  - optionals and literals: `None`/`none`, `Some`, `true`, `false`, `null`,
  - verification and external declarations: `ext`, and Formal Silk directives `#const`, `#require`, `#assure`, `#assert`, `#invariant`, `#variant`, `#monovariant`, `#theory`,
  - other keywords as listed in the spec.

  Keywords are lexed as distinct tokens, but in name positions (for example
  qualified-name segments like `std::test`, function/method names, and member
  access like `value.test`) the parser accepts keywords anywhere an
  identifier is expected.

  The `#require` / `#assure` / `#assert` / `#invariant` / `#variant` / `#monovariant` / `#const` / `#theory` forms are
  **not** comments; they are first-class lexical tokens that participate in the
  normal expression grammar and are handled by the verifier. A directive token
  begins with `#` followed by optional horizontal whitespace and the directive
  name (so `#require` and `#  require` are equivalent spellings). When these
  sequences appear inside a `//` line comment or anywhere inside a `/* ... */`
  block comment, the surrounding comment is treated as trivia and the directive
  spellings are ignored by the lexer.
- Literals:
  - numeric, duration, boolean, character, string, regexp, aggregate (see `*literals-*.md`).
  - String literals have two surface forms:
    - `"..."` (escape sequences),
    - `` `...` `` (raw/no-escape).
  - Regular expression literals have a JavaScript-style surface form:
    - `/pattern/flags` (see `docs/language/literals-regexp.md`).
    - Disambiguation is context-sensitive (like JavaScript): the parser only
      recognizes a regex literal in expression-start positions where a
      `Primary` expression may begin; otherwise `/` is parsed as the division
      operator.
    - Because `//` starts a line comment, an empty regex literal `//` is not a
      valid token sequence; use `/(?:)/` for an explicit empty pattern.
- Operators and delimiters:
  - as listed in `docs/language/operators.md` (assignment, arithmetic, logical, bitwise, ranges, `?.`, `??`, `::`, `->`, `=>`, etc.).

The lexer must implement longest-token rules for ambiguous prefixes (e.g. `...` vs `..=` vs `..`).

### Lexical Grammar for Whitespace and Comments

For the purposes of the grammar, whitespace and comments are treated as **trivia**
that may appear between any two tokens and are ignored by the parser:

- `Trivia       ::= (Whitespace | LineComment | BlockComment)+`
- `Whitespace   ::= ' ' | '\t' | '\r' | '\n'`
- `LineComment  ::= '//' LineCommentChar* Newline?`
- `LineCommentChar ::= any character except '\n'`
- `Newline      ::= '\n'`
- `BlockComment ::= '/*' BlockCommentChar* '*/'`
- `BlockCommentChar ::= any character except the end of input`

Block comments are **not nesting**: a `/*` sequence inside an existing
`BlockComment` has no special meaning and is treated as part of the comment
text until the first following `*/`. Doc-style comments such as `/** ... */`
are just syntactic sugar for `BlockComment` at the lexical level.

## High-Level Grammar Skeleton

At a high level, the language can be structured as:

- Compilation unit:

  - `Module ::= (PackageDecl | ModuleDecl)? ImportDecl* TopLevelDecl*`

- Top-level declarations:

  - `TopLevelDecl ::= PackageDecl | ModuleDecl | ImportDecl | InlineModuleDecl | UsingDecl | ReExportDecl | DefaultExportDecl | ExportableDecl | TestDecl`
  - `ExportableDecl ::= FnDecl | LetDecl | TypeDecl | StructDecl | EnumDecl | InterfaceDecl | ImplDecl | ExtDecl | ...`

- Packages and imports:

  The surface syntax for packages, imports, and exports is specified in detail in
  `docs/language/packages-imports-exports.md`. The grammar in this file mirrors
  the currently implemented subset:

  - `PackageDecl ::= 'package' PackagePath ';'`
  - `ModuleDecl ::= 'module' PackagePath ModuleAsOpt ';'`
  - `InlineModuleDecl ::= ExportModifier 'module' NameToken '{' InlineModuleItem* '}'`
  - `InlineModuleItem ::= InlineModuleDecl | UsingDecl | ExportableDecl`
  - `NameToken ::= Identifier | Keyword`
  - `PackagePath ::= NameToken ('::' NameToken)*`
  - `ModuleAsOpt ::= ('as' QualifiedName TypeArgListOpt) | ε`

  - `ImportDecl ::= 'import' ImportSpec ';'`
  - `ImportSpec ::= ImportPath | FileImportSpec | FileDefaultImportSpec | AmbientFileImportSpec`
  - `ImportPath ::= ('::')? NameToken ('::' NameToken)*`
  - `ImportFrom ::= StringLiteral | PackagePath`
  - `AmbientFileImportSpec ::= StringLiteral`
  - `FileImportSpec ::= '{' ImportBindingListOpt '}' 'from' ImportFrom`
  - `FileDefaultImportSpec ::= NameToken 'from' ImportFrom`
  - `ImportBindingListOpt ::= ImportBindingList | ε`
  - `ImportBindingList ::= ImportBinding (',' ImportBinding)* ','?`
  - `ImportBinding ::= NameToken ('as' NameToken)?`

  - `ReExportDecl ::= 'export' '{' ReExportBindingListOpt '}' ';'`
  - `ReExportBindingListOpt ::= ReExportBindingList | ε`
  - `ReExportBindingList ::= ReExportBinding (',' ReExportBinding)* ','?`
  - `ReExportBinding ::= NameToken ('as' NameToken)?`

  - `DefaultExportDecl ::= 'export' 'default' NameToken ';'`

  - `UsingDecl ::= 'using' Identifier '=' QualifiedName ';' | 'using' QualifiedName UsingAsOpt ';'`
  - `UsingAsOpt ::= ('as' Identifier) | ε`

  - `ExportModifier ::= 'export'?`
  - `FnExportModifier ::= ('export' ('default')?)?`

  For top-level declarations that can be exported, the `ExportModifier`
  appears before the declaration keyword (currently `fn`, `let`, `ext`, `type`,
  `struct`, `enum`, `theory`, `error`, and `interface`):

  - `FnDecl ::= FnSpecs FnExportModifier FnModifierOpt 'fn' FnGenericParamListOpt FnNameOpt FnSignature FnBody`
  - `FnBody ::= Block | ';'`
  - `FnModifierOpt ::= FnModifier*`
  - `FnModifier ::= 'const' | 'pure' | 'task' | 'async'`
  - `FnGenericParamListOpt ::= GenericParamList | ε`
  - `FnNameOpt ::= NameToken | ε`
  - `FnSpecs ::= (FnPrecondition | FnPostcondition | FnContractTheory)*`
  - `FnPrecondition ::= '#require' Expr ';'`
  - `FnPostcondition ::= '#assure' Expr ';'`
  - `FnContractTheory ::= '#theory' Identifier '(' ArgListOpt ')' ';'`

  Formal Silk theories may be declared either at top level (exportable) or
  inline inside blocks (non-exportable):

  - `TheoryDecl ::= TheorySpecs ExportModifier 'theory' Identifier '(' TheoryParamsOpt ')' '{' TheoryBodyItem* '}'`
  - `TheorySpecs ::= (TheoryPrecondition | TheoryPostcondition)*`
  - `TheoryPrecondition ::= '#require' Expr ';'`
  - `TheoryPostcondition ::= '#assure' Expr ';'`
  - `TheoryParamsOpt ::= TheoryParams | ε`
  - `TheoryParams ::= TheoryParam (',' TheoryParam)* ','?`
  - `TheoryParam ::= Identifier ':' Type`
  - `TheoryBodyItem ::= SpecConstStmt | SpecTheoryStmt | TheoryRequires | TheoryInvariant | TheoryEnsures | TheoryVariant`
  - `TheoryRequires ::= '#require' Expr ';'`
  - `TheoryInvariant ::= '#invariant' Expr ';'`
  - `TheoryEnsures ::= '#assure' Expr ';'`
  - `TheoryVariant ::= '#variant' Expr ';'`

  - `FnSignature ::= '(' FnParamsOpt ')' ResultTypeOpt`
  - `FnParamsOpt ::= FnParams | ε`
  - `FnParams ::= GenericParamSectionOpt ';' ParamListOpt | ParamList`
  - `GenericParamSectionOpt ::= GenericParamSection | ε`
  - `GenericParamSection ::= GenericParam (',' GenericParam)* ','?`
  - `ParamListOpt ::= ParamList | ε`
  - `ParamList ::= Param (',' Param)*`
  - `Param ::= VarArgsOpt MutOpt Identifier TypeAnnotationOpt DefaultArgOpt`
  - `VarArgsOpt ::= '...' | ε`
  - `DefaultArgOpt ::= ('=' Expr) | ε`
  - `ResultTypeOpt ::= ('->' TypeNoPipe TypedErrorTypesOpt)?`
  - `TypedErrorTypesOpt ::= ('|' TypeNoPipe)+ | ε`

  Notes:

  - When a top-level `;` appears inside the function parameter list, it splits
    **compile-time** parameters (type/const parameters) from **run-time** value
    parameters.
  - The compile-time side uses `GenericParam` syntax (`T` and `N: int`) and does
    not permit `mut`.
  - `FnNameOpt` is currently permitted only for default-exported functions
    (`export default fn (...) { ... }`). For non-default functions, the `fn`
    identifier is required.
  - Default export statements (`export default Name;`) always name an existing
    symbol; they do not permit anonymous exports.
  - The run-time side uses ordinary `Param` syntax (`mut x: T` or `x: T`, with
    the type annotation optional in the current subset).
  - If there is no `;`, the entire list is treated as run-time parameters.
  - Default arguments are supported in function parameter lists:
    - any parameter may provide a default expression (`x: int = 1`),
    - defaulted parameters must be **trailing** (once a parameter has a
      default, all subsequent parameters must also have defaults) because
      call syntax is positional-only in the current language subset,
    - and in the initial subset, default expressions are restricted to
      a constant/literal expression subset (no name references), so they can be
      inlined at call sites during lowering.
    - a parameter declared as `T?` with a default has two effective behaviors
      in the initial subset:
      - if the default expression has type `T`, the parameter has effective
        type `T` (the argument may be omitted at call sites, but the callee
        sees a non‑optional value),
      - if the default expression is `None`/`Null`, the parameter remains `T?`
        (the argument may be omitted, and callers may still pass optional
        values explicitly).

  - Varargs parameters are supported:
    - a varargs parameter is declared by prefixing the final parameter with
      `...` (for example `fn f(x: int, ...rest: int) { ... }`),
    - only one varargs parameter is permitted per function and it must be
      **final**,
    - in the current subset, varargs parameters:
      - must have an explicit type annotation,
      - may not be `mut`,
      - and may not have a default expression.

  - The `from` string literal is a *module specifier* (either `"..."` or `` `...` ``):
    - strings starting with `./`, `../`, or an absolute path are treated as
      file specifiers and resolve to a module by file path,
    - strings starting with `std/` are treated as std-root file specifiers and
      resolve to a module by file path under the configured stdlib root,
    - other strings are treated as package specifiers and resolve to a package
      by name (see `docs/language/packages-imports-exports.md`).

  - `BindingDecl ::= ('const' | 'let' MutOpt | 'var') Identifier TypeAnnotationOpt InitializerOpt ';'`
  - `LetDecl ::= ExportModifier BindingDecl`
  - `TypeAnnotationOpt ::= (':' Type)?`
  - `InitializerOpt ::= ('=' Expr)?`

  Type aliases are supported:

  - `TypeDecl ::= ExportModifier 'type' TypeDeclKindOpt Identifier '=' Type ';'`
  - `TypeDeclKindOpt ::= TypeDeclKind | ε`
  - `TypeDeclKind ::= 'struct' | 'enum' | 'error' | 'interface' | 'fn' | 'pure' 'fn'`

  `test` declarations are supported as Zig-inspired top-level test blocks:

  - `TestDecl ::= 'test' StringLiteral? Block`

  FFI declarations are also part of the language grammar:

  - `ExtDecl ::= ExportModifier 'ext' NameToken ExtExternNameOpt '=' Type ';'`
  - `ExtExternNameOpt ::= StringLiteral | ε`

  When `ExtExternNameOpt` is present, it sets the linked external symbol name.
  This allows Silk code to bind a local name that differs from the C/FFI symbol
  name (for example to avoid name collisions in wrapper modules).

  The current compiler implementation supports external declarations (`ext`) whose type
  is either:

  - a `FunctionType` (external functions, callable from Silk), or
  - a supported scalar type (external variables, readable as values in Silk).

  The current compiler subset **requires an initializer** for runtime bindings
  (`let`/`var`) and for compile-time constant bindings (`const`). Uninitialized
  declarations like `let x: int;` / `const x: int;` are parsed but rejected by
  the checker (see `docs/compiler/diagnostics.md`, `E2015`).

  Additionally, `const` initializers must be compile-time evaluable; otherwise
  the compiler reports an error (see `docs/compiler/diagnostics.md`, `E2041`).

  In practice, prefer:

  - `let x: int = 0;` for a zero value, or
  - `let x: T? = None;` for an “empty” optional.

  Struct declarations are also accepted by the current parser:

  - `StructDecl ::= ExportModifier 'struct' Identifier GenericParamListOpt StructExtendsOpt ';' | ExportModifier 'struct' Identifier GenericParamListOpt StructExtendsOpt '{' StructFieldListOpt '}'`
  - `StructExtendsOpt ::= ('extends' QualifiedName) | ε`
  - `GenericParamListOpt ::= GenericParamList | ε`
  - `GenericParamList ::= '(' GenericParamListInnerOpt ')'`
  - `GenericParamListInnerOpt ::= GenericParamListInner | ε`
  - `GenericParamListInner ::= GenericParam (',' GenericParam)* ','?`
  - `GenericParam ::= Identifier (':' Type)? ('=' Type)?`
  - `StructFieldListOpt ::= StructFieldList | ε`
  - `StructFieldList ::= StructField (',' StructField)* ','?`
  - `StructField ::= Identifier ':' Type StructFieldDefaultOpt`
  - `StructFieldDefaultOpt ::= ('=' Expr) | ε`

  Enum declarations are part of the core language design. They are specified in
  `docs/language/enums.md`.

  - `EnumDecl ::= ExportModifier 'enum' Identifier GenericParamListOpt '{' EnumVariantListOpt '}'`
  - `EnumVariantListOpt ::= EnumVariantList | ε`
  - `EnumVariantList ::= EnumVariant (',' EnumVariant)* ','?`
  - `EnumVariant ::= Identifier EnumVariantPayloadOpt`
  - `EnumVariantPayloadOpt ::= ('(' TypeListOpt ')') | ε`

  Interface and impl declarations are part of the language design and are
  parsed by the front-end as the syntax is implemented:

  - `InterfaceDecl ::= ExportModifier 'interface' Identifier GenericParamListOpt InterfaceExtendsOpt '{' InterfaceItem* '}'`
  - `InterfaceExtendsOpt ::= ('extends' QualifiedName) | ε`
  - `InterfaceMethodDecl ::= 'fn' NameToken FnSignature ';'`
  - `InterfaceItem ::= InterfaceMethodDecl | UsingDecl`

  - `ImplDecl ::= 'impl' QualifiedName GenericParamListOpt ImplAsOpt '{' ImplMemberDecl* '}'`
  - `ImplAsOpt ::= ('as' QualifiedName TypeArgListOpt) | ε`
  - `ImplMemberDecl ::= FnDecl | UsingDecl` (within an `impl` block, `export` is
    reserved for static members with no `self` receiver; instance method
    visibility uses `public`/`private`)

  Note: const-parameter-style generics (`N: int` parameters and integer literal
  type arguments like `Foo(u8, 1024)`) remain tracked work; the front-end parses
  these surface forms but the compiler currently focuses on type parameters
  and monomorphization for type arguments.

  Exception: the nominal optional form `Option(T)` is recognized as sugar for
  `T?` and is accepted in the current subset.

- Types (implemented subset):

  - `Type ::= UnionType`
  - `UnionType ::= TypeNoPipe ('|' TypeNoPipe)*`
  - `TypeNoPipe ::= BaseType TypeSuffix`
  - `TypeSuffix ::= TypeSuffixElem TypeSuffix | ε`
  - `TypeSuffixElem ::= OptionalTypeSuffix | ArrayTypeSuffix`
  - `OptionalTypeSuffix ::= '?' | '??'`
  - `ArrayTypeSuffix ::= '[' ']' | '[' ArrayLen ']'`
  - `ArrayLen ::= IntLiteral | Identifier`
  - `BaseType ::= ReferenceType | FunctionType | '(' Type ')' | SimpleType`
  - `ReferenceType ::= '&' BaseType`
  - `FunctionType ::= 'fn' '(' TypeListOpt ')' ResultTypeOpt`
  - `TypeListOpt ::= TypeList | ε`
  - `TypeList ::= Type (',' Type)*`
  - `SimpleType ::= PrimitiveType | NamedType`
  - `PrimitiveType ::= 'bool' | 'i8' | 'u8' | 'i16' | 'u16' | 'i32' | 'u32' | 'i64' | 'u64' | 'i128' | 'u128' | 'int' | 'f32' | 'f64' | 'f128' | 'char' | 'string' | 'void' | 'Instant' | 'Duration'`
  - `NamedType ::= QualifiedName TypeArgListOpt`
  - `TypeArgListOpt ::= ('(' TypeArgListInnerOpt ')') | ε`
  - `TypeArgListInnerOpt ::= TypeArgListInner | ε`
  - `TypeArgListInner ::= TypeArg (',' TypeArg)* ','?`
  - `TypeArg ::= Type | IntLiteral`

  This means that type annotations such as `string?` or `int??` are parsed
  into nested optional types. For simple nominal optionals, the parser also
  recognizes `Option(T)` and desugars it to the same internal representation
  as `T?`. Borrowed reference types (`&T`) are now parsed in type annotations.
  Array/slice types (`T[]`, `T[N]`) are
  parsed and type-checked in the current subset (with element-type
  restrictions), and are part of the implemented expression grammar via array
  literals (`[a, b, c]`) and indexing (`xs[i]`). Function types
  (`fn (T, ...) -> R`) are parsed as part of the `Type` grammar, and function
  values are supported in the current lowering subset (including capturing
  closures as a restricted scalar-only subset; see `docs/language/types.md` and
  `docs/language/memory-model.md`).

- Statements (implemented subset):

  - `Stmt ::= LetStmt | SpecConstStmt | SpecAssertStmt | SpecTheoryDeclStmt | SpecTheoryStmt | AsyncBlockStmt | TaskBlockStmt | ExprStmt | IfStmt | LoopStmt | WhileStmt | ForStmt | MatchStmt | ReturnStmt | PanicStmt | AssertStmt | BreakStmt | ContinueStmt`

  - `LetStmt ::= ('const' | 'let' MutOpt | 'var') LetBinder TypeAnnotationOpt InitializerOpt ';'`
  - `LetBinder ::= Identifier | '_' | LetTupleBinder | LetStructBinder | LetArrayBinder | LetEnumBinder`
  - `LetTupleBinder ::= '(' LetTupleBinderItemsOpt ')'`
  - `LetTupleBinderItemsOpt ::= LetTupleBinderItem (',' LetTupleBinderItem)* ','? | ε`
  - `LetTupleBinderItem ::= Identifier | '_'`
  - `LetStructBinder ::= '{' LetStructBinderItemsOpt '}'`
  - `LetStructBinderItemsOpt ::= LetStructBinderItem (',' LetStructBinderItem)* ','? | ε`
  - `LetStructBinderItem ::= Identifier ('as' (Identifier | '_'))?`
  - `LetArrayBinder ::= '[' LetArrayBinderItemsOpt ']'`
  - `LetArrayBinderItemsOpt ::= LetArrayBinderItem (',' LetArrayBinderItem)* ','? | ε`
  - `LetArrayBinderItem ::= Identifier | '_'`
  - `LetEnumBinder ::= QualifiedName '(' LetEnumBinderItemsOpt ')'`
  - `LetEnumBinderItemsOpt ::= LetEnumBinderItem (',' LetEnumBinderItem)* ','? | ε`
  - `LetEnumBinderItem ::= Identifier | '_'`
  - `SpecConstStmt ::= '#const' Identifier '=' Expr ';'`
  - `SpecAssertStmt ::= '#assert' Expr ';'`
  - `SpecTheoryDeclStmt ::= '#theory' Identifier '(' TheoryParamsOpt ')' '{' TheoryBodyItem* '}'`
  - `SpecTheoryStmt ::= '#theory' Identifier '(' ArgListOpt ')' ';'`
  - `AsyncBlockStmt ::= 'async' Block`
  - `TaskBlockStmt ::= 'task' Block`
  - `MutOpt ::= 'mut' | ε`
  - `ExprStmt ::= Expr ';'`
  - `IfStmt ::= 'if' Expr Block ('else' (IfStmt | Block))?`
  - `LoopStmt ::= LoopPrefixOpt 'loop' Block`
  - `LoopPrefixOpt ::= 'async' | 'task' | ε`
  - `WhileStmt ::= WhileSpecs 'while' Expr Block`
  - `WhileSpecs ::= (LoopInvariant | LoopVariant | LoopMonovariant)*`
  - `LoopInvariant ::= '#invariant' Expr ';'`
  - `LoopVariant ::= '#variant' Expr ';'`
  - `LoopMonovariant ::= '#monovariant' Expr ';'`
  - `ForStmt ::= ForInStmt | ForCStmt`
  - `ForInStmt ::= 'for' ForBinder 'in' Expr (RangeOp Expr)? Block`
  - `ForCStmt ::= 'for' '(' ForInit ';' Expr ';' Expr ')' Block`
  - `ForInit ::= ('const' | 'let' MutOpt | 'var') Identifier TypeAnnotationOpt '=' Expr`
  - `ForBinder ::= Identifier | '_'`
  - `RangeOp ::= '..' | '..='`
  - `BlockStmt ::= Block`
  - `Block ::= '{' Stmt* '}'`
  - `ReturnStmt ::= 'return' ExprOpt ';'`
  - `ExprOpt ::= Expr?`
  - `PanicStmt ::= 'panic' QualifiedName StructLiteralSuffixOpt ';'`
  - `AssertStmt ::= 'assert' Expr ';' | 'assert' '(' Expr (',' Expr)? ')' ';'`
  - `BreakStmt ::= 'break' ';'`
  - `ContinueStmt ::= 'continue' ';'`
  - `WithStmt ::= 'with' Identifier Block
                | 'with' WithBytes Block
                | 'with' WithBytes 'from' Identifier WithFromSliceOpt Block`
  - `WithBytes ::= IntLiteral | '(' IntLiteral ')'`
  - `WithFromSliceOpt ::= '[' IntLiteral '..' IntLiteralOpt ']' | ε`
  - `IntLiteralOpt ::= IntLiteral | ε`
  - `MatchStmt ::= 'match' Expr '{' MatchStmtArmListOpt '}'`
  - `MatchStmtArmListOpt ::= MatchStmtArmList | ε`
  - `MatchStmtArmList ::= MatchStmtArm (',' MatchStmtArm)* ','?`
  - `MatchStmtArm ::= MatchStmtPattern '=>' Block`
  - `OptionalPattern ::= 'None'
                      | 'Some' '(' (Identifier | '_') ')'`

  - `MatchStmtPattern ::= OptionalPattern
                        | '_'
                        | Identifier
                        | (Identifier | '_') ':' QualifiedName`
  - `StructLiteralSuffixOpt ::= StructLiteralSuffix | ε`

  Region declarations and `with` blocks are specified in `docs/language/regions.md`.

  `match` is implemented in two separate forms:

  - `match` as an expression (arms are expressions; see `MatchExpr` below),
  - `match` as a statement (arms are blocks), used for typed errors as
    specified in `docs/language/typed-errors.md`.

  In the implemented subset, the `match` statement form is restricted to a
  call-expression scrutinee and the patterns listed above.

- Expressions (implemented subset):

  Expressions follow a conventional precedence hierarchy, as implemented in
  `src/parser.zig`:

  - `Expr ::= Assign`
  - `Assign ::= Coalesce (AssignOp Assign)?`
  - `AssignOp ::= '=' | '+=' | '-=' | '*=' | '/='`
  - `Coalesce ::= LogicalOr ('??' Coalesce)?`
  - `LogicalOr ::= LogicalAnd ('||' LogicalAnd)*`
  - `LogicalAnd ::= BitOr ('&&' BitOr)*`
  - `BitOr ::= BitXor ('|' BitXor)*`
  - `BitXor ::= BitAnd ('^' BitAnd)*`
  - `BitAnd ::= Equality ('&' Equality)*`
  - `Equality ::= TypeTest (('==' | '!=') TypeTest)*`
  - `TypeTest ::= Relational ('is' Type)?`
  - `Relational ::= Shift (('<' | '<=' | '>' | '>=') Shift)*`
  - `Shift ::= AddSub (('<<' | '>>') AddSub)*`
  - `AddSub ::= MulDiv (('+' | '-') MulDiv)*`
  - `MulDiv ::= Unary (('*' | '/' | '%') Unary)*`
  - `Unary ::= ('!' | '~' | '-' | 'mut' | 'move' | 'new' | 'await' | 'yield' | 'sizeof' | 'alignof' | 'offsetof' | 'typename' | '&' | '*' | '++' | '--') Unary | Postfix`
  - `Postfix ::= Primary PostfixSuffix*`
  - `PostfixSuffix ::= CallSuffix | FieldSuffix | OptionalFieldSuffix | StructLiteralSuffix | IndexSuffix | SliceSuffix | CastSuffix | TrySuffix | IncDecSuffix`
  - `CallSuffix ::= '(' CallArgsOpt ')'`
  - `FieldSuffix ::= '.' NameToken`
  - `OptionalFieldSuffix ::= '?.' NameToken`
  - `StructLiteralSuffix ::= '{' StructInitListOpt '}'`
  - `IndexSuffix ::= '[' Expr ']'`
  - `SliceSuffix ::= '[' SliceBoundOpt '..' SliceBoundOpt ']'`
  - `SliceBoundOpt ::= Expr | ε`
  - `CastSuffix ::= 'as' RawOpt Type CastSliceLenOpt`
  - `CastSliceLenOpt ::= '(' Expr ')' | ε`
  - `RawOpt ::= 'raw' | ε`
  - `TrySuffix ::= '?'`
  - `IncDecSuffix ::= '++' | '--'`
  - `StructInitListOpt ::= StructInitList | ε`
  - `StructInitList ::= StructInit (',' StructInit)* ','?`
  - `StructInit ::= NameToken (':' Expr)?`

  - `CallArgsOpt ::= CallArgs | ε`
  - `CallArgs ::= GenericArgListOpt ';' ArgListOpt | ArgList`
  - `GenericArgListOpt ::= GenericArgList | ε`
  - `GenericArgList ::= GenericArg (',' GenericArg)* ','?`
  - `GenericArg ::= Type | IntLiteral`

  - `ArgListOpt ::= ArgList | ε`
  - `ArgList ::= Expr (',' Expr)*`

  Note: the parser treats `mut <expr>`, `new <expr>`, `await <expr>`, `await * <expr>`,
  `yield <expr>`, `yield * <expr>`, `sizeof <expr>`, `alignof <expr>`, `offsetof(Type, field_path)`,
  `typename <expr>`, and prefix `++<expr>` / `--<expr>` as unary expressions.

  Note: `CastSliceLenOpt` is permitted only when `Type` is a slice type (`T[]`)
  and `RawOpt` is `ε` (it is used by unsafe pointer→slice casts like
  `ptr as u8[](len)`).

  - The type checker currently permits `mut <expr>` only in call arguments (and
    method receivers) when the corresponding parameter is declared `mut` and is:
    - a borrowed reference type (`mut r: &T`), or
    - a slice type (`mut s: T[]`).
  - The `move <expr>` unary form is used for explicit ownership transfer; in the
    current subset it is restricted to `move <name>` where `<name>` is a local
    binding.
  - The type checker currently permits `new <expr>` only when it can determine a
    concrete reference result type of the form `&Struct`. In the compiler, this
    happens either:
    - from an expected `&Struct` type context (for example `let x: &Packet = new
      Packet{ ... };` or as a call argument whose parameter type is `&Struct`)
    - from the operand itself when it names the struct type (for example `let x
      = new Packet{ ... };` or `let x = new Packet(...);`)
    `new` is supported only in function bodies (not in top-level `let`
    initializers).

  - `Primary ::= IntegerLiteral
               | DurationLiteral
               | FloatLiteral
               | StringLiteral
               | RegexpLiteral
               | CharLiteral
               | 'true'
               | 'false'
               | 'None'
               | 'null'
               | 'Some' '(' Expr ')'
               | ArrayLiteral
               | IfExpr
               | MatchExpr
               | FnExpr
               | '(' Expr ')'
               | InferredStructLiteral
               | QualifiedName`

  - `RegexpLiteral ::= '/' RegexpBody '/' RegexpFlagsOpt`
  - `RegexpFlagsOpt ::= Identifier | ε`

  Notes:
  - `RegexpBody` is scanned by the parser (not the lexer): it is the byte span
    between the opening and closing `/`, where the closing delimiter is the
    first unescaped `/` that is not inside a character class (`[...]`).

  - `ArrayLiteral ::= '[' ExprListOpt ']'`
  - `ExprListOpt ::= ExprList | ε`
  - `ExprList ::= Expr (',' Expr)* ','?`

  - `QualifiedName ::= GlobalPrefixOpt NameToken ('::' NameToken)*`
  - `GlobalPrefixOpt ::= '::' | ε`

  - `InferredStructLiteral ::= '{' StructInitListOpt '}'`

  - `FnExpr ::= 'fn' '(' LambdaParamListOpt ')' '->' LambdaBody`
  - `LambdaParamListOpt ::= LambdaParamList | ε`
  - `LambdaParamList ::= LambdaParam (',' LambdaParam)* ','?`
  - `LambdaParam ::= Identifier ':' Type`
  - `LambdaBody ::= Type Block | Expr`

  Disambiguation rule (current parser):

  - `fn (...) -> Type Block` is treated as the block-body form only when the
    return type is followed immediately by `{` (starting the block).
  - Otherwise, `fn (...) -> Expr` is treated as an expression-body function
    expression and its result type is inferred by the checker.

  Notes:

  - `InferredStructLiteral` has the same token-level shape as
    `StructLiteralSuffix` (used for `Type{ ... }`), but appears as a `Primary`
    expression with **no explicit type name**. The type checker requires an
    expected struct type context to resolve the literal’s target type.
  - To avoid ambiguity with statement blocks, the parser only recognizes
    `InferredStructLiteral` when the `{ ... }` contents look like a struct
    initializer list (or are `{}`): either the first token after `{` is `}` or
    it is an `Identifier` followed by `:` (explicit initializer) or followed by
    `,` / `}` (shorthand initializer).

  - `MatchExpr ::= 'match' Expr '{' MatchArmListOpt '}'`
  - `MatchArmListOpt ::= MatchArmList | ε`
  - `MatchArmList ::= MatchArm (',' MatchArm)* ','?`
  - `MatchArm ::= MatchExprPattern '=>' Expr`
  - `MatchExprPattern ::= OptionalPattern | EnumVariantPattern | ResultPattern`

  - `IfExpr ::= 'if' Expr IfExprBlock 'else' (IfExpr | IfExprBlock)`
  - `IfExprBlock ::= '{' Expr '}'`

  - `ResultPattern ::= ('Ok' | 'Err') '(' (Identifier | '_') ')'`

  - `EnumVariantPattern ::= EnumVariantName EnumVariantBinderListOpt`
  - `EnumVariantName ::= ('::')? Identifier '::' Identifier ('::' Identifier)*`
  - `EnumVariantBinderListOpt ::= ('(' EnumVariantBinderListInnerOpt ')') | ε`
  - `EnumVariantBinderListInnerOpt ::= EnumVariantBinderList | ε`
  - `EnumVariantBinderList ::= EnumVariantBinder (',' EnumVariantBinder)* ','?`
  - `EnumVariantBinder ::= Identifier | '_'`

- Declarations (implemented subset additions):

  - `Decl ::= ... | ErrorDecl`
  - `ErrorDecl ::= ExportModifier 'error' Identifier '{' StructFieldListOpt '}'`

  This matches the current AST and checker:

  - `Primary` constructs `Literal` or `Name` expressions (or a parenthesized `Expr`),
  - unary expressions are represented as `UnaryExpr` with a token kind indicating the
    operator,
  - binary expressions are represented as `BinaryExpr` with a token kind indicating
    the operator,
  - identifiers and qualified names are stored as `NameExpr` with the full
    slice of source text (e.g. `util::answer`),
  - simple function calls such as `helper()` or `util::helper(1, 2)` are
    parsed as call expressions using the `Postfix`/`CallSuffix` productions;
    the compiler supports calls to named functions, but the type checker
    and back-end currently restrict which value types can appear at call boundaries;
    see `docs/compiler/cli-silk.md` for the exact supported subset.

Further expression forms (ranges, etc.) are described in other
language concept documents and in `docs/language/operators.md`. The current
parser now accepts `?.` optional field access (`opt?.field`) and the initial
`match` expression form as part of the implemented optional subset, but other
expression forms will be added here as they are implemented.

## Role of This File

This document serves as the reference for:

- lexer implementation (token categories and reserved words),
- parser implementation (production rules and precedence),
- pretty-printer or formatter behavior.

As the parser and lexer are implemented, this file must be updated with:

- the exact grammar that the compiler accepts (including any temporary limitations),
- clarifications or corrections discovered during implementation (recorded here so this file remains canonical),
- notes about desugaring and how surface constructs map into the internal AST,
- clear indication of which productions are implemented today vs. planned
  future work, so that downstream users can see both the full language
  design and the currently supported subset.

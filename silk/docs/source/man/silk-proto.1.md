# [`silk-proto(1)`](?p=man/silk-proto.1) — compile proto3 schemas to Silk

> NOTE: This is the Markdown source for the eventual man 1 page for `silk proto`. The roff-formatted manpage should be generated from this content.

## Name

`silk proto` — compile Protocol Buffers v3 schemas to Silk modules.

## Synopsis

- `silk proto [options] <schema.proto> [<schema.proto> ...]`

## Description

`silk proto` parses `.proto` files directly and emits Silk source. It is
dependency-free: it does not invoke `protoc`, does not require generated C/C++,
and does not link a third-party protobuf runtime.

Generated modules use `std::protobuf` for binary wire-format encoding,
decoding, field skipping, and unknown-field preservation.

## Options

- `--help`, `-h` — show command help.
- `-I <dir>`, `-I<dir>` — add a proto import root.
- `--proto-path <dir>` — add a proto import root.
- `--include <dir>` — alias of `--proto-path`.
- `--include-imports` — accepted for explicit import-closure output. Imported
 schema dependencies are emitted automatically so generated Silk imports
 resolve.
- `-o <dir>`, `--out-dir <dir>` — output root. Defaults to `.`.
- `--module <name>` — override the generated module name. Valid only with one
 input schema.
- `--descriptor-out <path>` — write a deterministic JSON schema summary for
 tooling.
- `--` — stop option parsing; remaining arguments are schema paths.

## Schema Coverage

The compiler accepts proto3 schemas with `syntax = "proto3";` and covers
packages, normal imports, `import public` re-exports, missing `import weak`
declarations when unused, adjacent string literals in string-valued schema
positions, protobuf decimal/hexadecimal/octal/signed integer literals,
file/message/field/enum/service options, messages, nested messages, enums,
optional fields, repeated fields, oneofs, maps, reserved declarations,
services/rpcs with generated descriptors, and field options including
`[packed = false]`.

Validation rejects invalid field numbers, invalid reserved declaration ranges,
reserved field/name conflicts,
duplicate message field names or numbers, generated Silk name collisions,
generated storage-field name collisions such as `unknown_fields_ptr`, invalid
map key types or labelled map fields, reversed reserved ranges, enum aliases
without `option allow_alias = true;`, enum values outside the protobuf int32
range, proto3 enums whose first value is not zero, unresolved type references,
cross-file type references that are not visible through normal or public
imports, cyclic imports, and unsupported `extend`, `extensions`, or `group`
forms.

## Output

Output paths mirror module names. For example:

```sh
silk proto -I schemas -o generated schemas/chat/person.proto
```

A schema with `package acme.chat;` in `person.proto` writes:

```text
generated/acme/chat/person.slk
```

If `person.proto` imports `common.proto`, the generated module for
`common.proto` is emitted under the same output root by default. Generated
cross-file references use deterministic named imports; unaliased names are used
when they are unique, and collision-safe aliases are generated when necessary.

Generated message modules include structs, known-value enums, raw-preserving
enum field wrappers, enum conversion helpers, repeated field vector aliases,
`T?` storage for singular message and explicit `optional` field presence,
service RPC descriptors, `empty()`, recursive `drop()`, `encode()`, `decode()`,
`merge_from()`, and preserved unknown-field byte access.

Generated encoders use proto3 packed encoding for repeated scalar and enum
fields by default. `[packed = false]` emits unpacked records, and generated
decoders accept both packed and unpacked forms for packable fields.

`--descriptor-out` writes `version: 1` JSON with complete file, import, option,
message, field, oneof, enum, service, and RPC descriptors, including generated
Silk module/type names, resolved protobuf type names, reserved declarations,
packed field status, map key/value metadata, and streaming RPC flags.

Generated modules type-check as Silk source, build as object code, and can be
imported by Silk programs that construct messages, encode them, decode them,
and inspect decoded fields.

## Exit Status

- `0` on success.
- Non-zero when arguments are invalid, imports are missing, parsing fails,
 validation fails, or output cannot be written.

## See Also

- [`silk(1)`](?p=man/silk.1)
- [`std::protobuf(3)`](?p=std/protobuf)

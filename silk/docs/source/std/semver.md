# `std::semver`

`std::semver` provides a SemVer 2.0.0 parser and
precedence comparison.

This module is intentionally strict and focused:

- Parses **exact** Semantic Versioning 2.0.0 strings:
 `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`.
- Provides SemVer **precedence comparison** (`cmp`) per the SemVer 2.0.0 rules:
 - `major/minor/patch` are compared numerically.
 - prerelease identifiers are compared per SemVer rules.
 - build metadata is **ignored** for precedence.
- Avoids hidden allocation: `parse` returns a `Version` that borrows `string`
 slices from the input.

## Exported API
### Parsing

- `parse(input: string) -> ParseResult`
 - Returns `Ok(Version)` on success.
 - Returns `Err(ParseError)` on error.
- `Version.parse(input: string) -> ParseResult`
 - Receiverless static-protocol form of the same parser via
 `std::interfaces::Parse(ParseError)`.
- `Version.try_serialize() -> Result(std::strings::String, std::memory::OutOfMemory)`
 - Canonical fallible owned-string rendering via
 `std::interfaces::TrySerialize(std::memory::OutOfMemory)`.
- `Version.to_string() -> Result(std::strings::String, std::memory::OutOfMemory)`
 - Legacy/explicit formatting helper; returns the same canonical output as
 `try_serialize()`.

`ParseResult` is `Result(Version, ParseError)`.

`ParseError.offset` is a **byte offset** into the original `input`.
`ParseError.kind()` reports a stable error kind.

Allocation and lifetimes:

- `parse` does **not** allocate.
- `Version.prerelease` and `Version.build` are `string?` slices into `input`.
 The caller must ensure `input` remains alive for as long as the returned
 `Version` is used.
- formatting does allocate, so the canonical output-side generic path is
 `v.try_serialize()`.

### Version values

`Version` has these fields:

- `major: u64`
- `minor: u64`
- `patch: u64`
- `prerelease: string?` — the substring after `-` (without the `-`).
- `build: string?` — the substring after `+` (without the `+`).

### Comparison

- `Version.cmp(other: &Version) -> int`
 - Returns `-1` if `self` has lower precedence than `other`.
 - Returns `0` if `self` and `other` have equal precedence.
 - Returns `1` if `self` has higher precedence than `other`.

Formal contract surface:

- `Version.cmp` carries verified postconditions that:
 - the result is always in `[-1, 1]`,
 - when the `major.minor.patch` core triplet already proves `self > other`,
 the result is positive,
 - and when the core triplet already proves `self < other`, the result is
 negative.
- Helper comparators inside `std::semver` (`cmp_u64`, `cmp_lex`, `cmp_ident`,
 `cmp_prerelease`) also carry result-range postconditions, so downstream
 verified code can rely on the public comparison path rather than duplicating
 ad hoc ordering lemmas.
- `std::semver` also exports reusable Formal Silk theories for the
 `major.minor.patch` core triplet:
 - `semver_core_eq(...)`
 - `semver_core_ge(...)`
 - `semver_core_gt(...)`
 - `semver_core_lt(...)`
 - `semver_core_le(...)`
 These are the right vocabulary when a proof cares about stable-release core
 ordering but intentionally ignores prerelease/build suffix semantics.
- The current formal surface intentionally stops short of fully encoding the
 prerelease identifier ordering rules as a reusable theory. Those rules are
 implemented and tested at runtime, but the shipped proof vocabulary focuses
 on the SemVer core triplet where the current verifier subset is strongest.

Notes:

- Build metadata does not affect precedence, so:
 - `1.0.0+1` and `1.0.0+2` compare equal (`cmp == 0`),
 - but they are not exactly equal (`eq` is false).

## Example

```silk
import semver from "std/semver";

fn main () -> int {
  match (std::semver::parse("1.2.3-alpha.1+build.5")) {
    Ok(v) => {
      if v.major != 1 { return 2; }
      if v.prerelease == None { return 3; }
    },
    Err(_) => {
      return 1;
    },
  }

  match (std::semver::parse("1.0.0-alpha")) {
    Ok(a) => {
      match (std::semver::parse("1.0.0")) {
        Ok(b) => {
          if a.cmp(b) >= 0 { return 6; }
          match (std::semver::Version.parse("1.0.0+build.7")) {
            Ok(_) => { return 0; },
            Err(_) => { return 7; },
          }
        },
        Err(_) => {
          return 5;
        },
      }
    },
    Err(_) => {
      return 4;
    },
  }
}
```

# `std::semver`

Status: **implemented (core)**. `std::semver` provides a SemVer 2.0.0 parser and
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

## Public API

### Parsing

- `parse(input: string) -> ParseResult`
  - Returns `Ok(Version)` on success.
  - Returns `Err(ParseError)` on error.

`ParseResult` is `std::result::Result(Version, ParseError)`.

`ParseError.offset` is a **byte offset** into the original `input`.
`ParseError.kind()` reports a stable error kind.

Allocation and lifetimes:

- `parse` does **not** allocate.
- `Version.prerelease` and `Version.build` are `string?` slices into `input`.
  The caller must ensure `input` remains alive for as long as the returned
  `Version` is used.

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

Notes:

- Build metadata does not affect precedence, so:
  - `1.0.0+1` and `1.0.0+2` compare equal (`cmp == 0`),
  - but they are not exactly equal (`eq` is false).

## Example

```silk
import std::semver;

fn main () -> int {
  let v = match std::semver::parse("1.2.3-alpha.1+build.5") {
    Ok(v) => v,
    Err(_) => return 1,
  };

  if v.major != 1 { return 2; }
  if v.prerelease == None { return 3; }

  let a = match std::semver::parse("1.0.0-alpha") {
    Ok(v) => v,
    Err(_) => return 4,
  };
  let b = match std::semver::parse("1.0.0") {
    Ok(v) => v,
    Err(_) => return 5,
  };
  if a.cmp(b) >= 0 { return 6; }

  return 0;
}
```

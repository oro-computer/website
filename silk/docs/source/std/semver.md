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
  let r = std::semver::parse("1.2.3-alpha.1+build.5");
  if r.is_err() { return 1; }
  let v: std::semver::Version = match (r) {
    Ok(v) => v,
    Err(_) => std::semver::Version{ major: 0, minor: 0, patch: 0, prerelease: None, build: None },
  };

  if v.major != 1 { return 2; }
  if v.prerelease == None { return 3; }

  let ar = std::semver::parse("1.0.0-alpha");
  let br = std::semver::parse("1.0.0");
  if ar.is_err() { return 4; }
  if br.is_err() { return 5; }
  let a: std::semver::Version = match (ar) { Ok(v) => v, Err(_) => std::semver::Version{ major: 0, minor: 0, patch: 0, prerelease: None, build: None } };
  let b: std::semver::Version = match (br) { Ok(v) => v, Err(_) => std::semver::Version{ major: 0, minor: 0, patch: 0, prerelease: None, build: None } };
  if a.cmp(b) >= 0 { return 6; }

  return 0;
}
```

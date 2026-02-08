# `std::semver`

`std::semver` implements Semantic Versioning (SemVer 2.0.0):

- strict parsing of `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`
- SemVer precedence comparison (build metadata is ignored)

Canonical doc: `docs/std/semver.md`.

## Quick example

```silk
import std::semver;

fn main () -> int {
 let r = std::semver::parse("1.2.3-alpha.1+build.5");
 if r.is_err() { return 1; }
 let v: std::semver::Version = match (r) {
 Ok(v) => v,
 Err(_) => std::semver::Version{ major: 0, minor: 0, patch: 0, prerelease: None, build: None },
 };

 // Precedence comparison ignores build metadata.
 let ar = std::semver::parse("1.0.0-alpha");
 let br = std::semver::parse("1.0.0");
 if ar.is_err() { return 2; }
 if br.is_err() { return 3; }
 let a: std::semver::Version = match (ar) { Ok(v) => v, Err(_) => std::semver::Version{ major: 0, minor: 0, patch: 0, prerelease: None, build: None } };
 let b: std::semver::Version = match (br) { Ok(v) => v, Err(_) => std::semver::Version{ major: 0, minor: 0, patch: 0, prerelease: None, build: None } };
 if a.cmp(b) >= 0 { return 4; }

 return 0;
}
```

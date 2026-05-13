# `std::semver`

`semver` implements Semantic Versioning (SemVer 2.0.0):

- strict parsing of `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`
- SemVer precedence comparison (build metadata is ignored)

Canonical doc: [semver](?p=std/semver).

## Quick example

```silk
import semver from "std/semver";

fn main () -> int {
  match (semver::parse("1.2.3-alpha.1+build.5")) {
    Ok(_) => {
      // Precedence comparison ignores build metadata.
      match (semver::parse("1.0.0-alpha")) {
        Ok(a) => {
          match (semver::parse("1.0.0")) {
            Ok(b) => {
              if a.cmp(b) >= 0 { return 4; }
              return 0;
            },
            Err(_) => {
              return 3;
            },
          }
        },
        Err(_) => {
          return 2;
        },
      }
    },
    Err(_) => {
      return 1;
    },
  }
}
```

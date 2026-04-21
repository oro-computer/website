# `std::uuid`

`std::uuid` provides UUID primitives (parsing, formatting, and variants).

Canonical doc: [uuid](?p=std/uuid).

## Notes

- Implemented (v1/v3/v4/v5/v6/v7/v8 parsing + formatting + constructors).
- Details: [uuid](?p=std/uuid)

## Importing

```silk
import std::uuid;
import std::strings;
```

## Examples

### Example: parse + name-based UUID (v5)
```silk
import std::uuid;
import std::strings;
import std::result;
import std::memory;

type StringAllocResult = std::result::Result(std::strings::String, std::memory::OutOfMemory);

fn uuid_string_eq (u: UUID, expected: string) -> bool {
  let r: StringAllocResult = u.to_string_lower();
  match (r) {
    Ok(value) => {
      let mut s: std::strings::String = value;
      let ok: bool = s.as_string() == expected;
      s.drop();
      return ok;
    },
    Err(_) => {
      return false;
    },
  }
}

fn main () -> int {
  let s0: string = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  match (std::uuid::parse(s0)) {
    Ok(u0) => {
      if !uuid_string_eq(u0, s0) { return 2; }

      let dns: UUID = std::uuid::namespace_dns();
      match (std::uuid::v5(dns, "www.widgets.com")) {
        Ok(v5_dns) => {
          if !uuid_string_eq(v5_dns, "21f7f8de-8051-5b89-8680-0195ef798b6a") { return 4; }

          if v5_dns.version() != 5 { return 5; }
          if !v5_dns.is_rfc4122() { return 6; }
          return 0;
        },
        Err(_) => {
          return 3;
        },
      }
    },
    Err(_) => {
      return 1;
    },
  }
}
```

## See also

- Canonical doc: [uuid](?p=std/uuid)
- End-to-end fixture: `tests/silk/pass_std_uuid_basic.slk`

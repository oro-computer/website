# `silk_abi_get_version` (3) — Query the `libsilk` ABI Version

> NOTE: This is the Markdown source for the eventual man 3 page for `silk_abi_get_version`. The roff-formatted manpage should be generated from this content.

## Name

`silk_abi_get_version` — query the runtime embedding ABI version of `libsilk.a`.

## Synopsis

```c
#include "silk.h"

void silk_abi_get_version(int *out_major,
                          int *out_minor,
                          int *out_patch);
```

## Description

`silk_abi_get_version` reports the semantic version of the `libsilk` embedding ABI as `MAJOR.MINOR.PATCH`.

Embedders should compare the runtime version returned by this function with the compile-time ABI version macros in `include/silk.h`:

```c
#define SILK_ABI_VERSION_MAJOR ...
#define SILK_ABI_VERSION_MINOR ...
#define SILK_ABI_VERSION_PATCH ...
```

## Parameters

- `out_major`, `out_minor`, `out_patch` — output pointers written on success. This API tolerates `NULL` pointers and skips writing those components.

## Return value

None.

## Example

```c
int runtime_major = 0;
int runtime_minor = 0;
int runtime_patch = 0;

silk_abi_get_version(&runtime_major, &runtime_minor, &runtime_patch);

if (runtime_major != SILK_ABI_VERSION_MAJOR) {
  fprintf(stderr, "libsilk ABI major mismatch\n");
  return 1;
}
```

The usual policy is:

- require an exact major match,
- optionally warn when minor/patch differ,
- and refuse to run when your embedding layer depends on newer ABI features.

## See Also

- [`libsilk` (7)](?p=man/libsilk.7)
- [C ABI (`libsilk`)](?p=compiler/abi-libsilk)

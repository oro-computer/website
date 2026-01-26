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

- `out_major`, `out_minor`, `out_patch` — output pointers written on success. The current implementation tolerates `NULL` pointers and skips writing those components.

## Return value

None.

## See Also

- `libsilk` (7)
- `docs/compiler/abi-libsilk.md`

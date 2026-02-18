# `oroc versions`

Print Oro CLI/runtime and dependency versions.

## Usage

```bash
oroc versions [options] [<dependency>]
```

## Options

```text
-f, --format=<format>   text | json (default: text)
-V, --verbose           verbose output
--log-file=<path>       mirror logs to a JSON file
```

## Examples

```bash
oroc versions
oroc versions -f json
oroc versions sqlite
```


# `oroc setup`

Setup build tools for the host or a target platform.

## Usage

```bash
oroc setup [options] [--platform=<platform>] [-y|--yes]
```

## Options

```text
--platform=<platform>   android | ios | linux | windows (default: host)
-q, --quiet             hint for less log output
-y, --yes               answer yes to prompts
```

## Notes

Without `--platform`, setup defaults to the host. Verify with `oroc env`.


---
layout: "runtime-docs"
title: "oroc update extract"
description: "Extract a tar archive produced by oroc update bundle into a destination directory."
docsCollection: "runtime"
section: "cli"
order: 44
sourcePath: "cli/update/extract.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc update extract`](/runtime/docs/cli/update/extract/)

Extract a tar archive produced by [`oroc update bundle`](/runtime/docs/cli/update/bundle/) into a destination directory.

## Usage

```bash
oroc update extract --bundle=<bundle.tar> --dest=<dir> [options]
```

## Options

| Option | Description |
| --- | --- |
| `--bundle=<bundle.tar>` | path to the tar archive to extract |
| `--dest=<dir>` | destination directory to extract files into (created if missing) |
| `--log-file=<path>` | mirror logs to a JSON file |

## Examples

```bash
oroc update extract --bundle app-1.0.0.tar --dest ./update-staging
# extract the contents of app-1.0.0.tar into ./update-staging
```

## Considerations

- The extractor rejects absolute paths and any paths containing `..` or `:` to avoid directory traversal.
- Special tar entries such as symlinks and device nodes are ignored.
- Only regular files and directories are restored.

## See also

- [`oroc update`](/runtime/docs/cli/update/)
- [`oroc update bundle`](/runtime/docs/cli/update/bundle/)

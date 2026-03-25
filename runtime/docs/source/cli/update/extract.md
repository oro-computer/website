# `oroc update extract`

Extract a tar archive produced by `oroc update bundle` into a destination directory.

## Usage

```bash
oroc update extract --bundle=<bundle.tar> --dest=<dir> [options]
```

## Options

```text
--bundle=<bundle.tar>  path to the tar archive to extract
--dest=<dir>           destination directory to extract files into (created if missing)
--log-file=<path>      mirror logs to a JSON file
```

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

- [`oroc update`](?p=cli/update)
- [`oroc update bundle`](?p=cli/update/bundle)

---
layout: "docs"
description: "Check, test, and build a program, then find the command for your next task."
docsCollection: "silk"
section: "guides"
order: 8
sourcePath: "guides/cli.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# CLI and toolchain

Use the [order calculator](/silk/learn/getting-started/) to see the normal development loop. From its `first-silk` directory:

```bash
silk check src/main.slk
silk test src/main.slk
silk build src/main.slk -o build/orders
./build/orders
```

`check` validates the module set, `test` runs assertions and emits TAP, and `build` writes the executable. A module set is the files compiled together; [a package manifest](/silk/learn/modules-and-packages/) can select them for you.

## Choose the next command

| Task | Command and details |
| --- | --- |
| Explore expressions | [`silk repl`](/silk/docs/man/silk-repl.1/) |
| Select a build target | [`silk build`](/silk/docs/man/silk-build.1/) |
| Inspect a package | [`silk package`](/silk/docs/man/silk-package.1/) |
| Inspect module dependencies | [`silk graph`](/silk/docs/man/silk-graph.1/) |
| Inspect artifact size | [`silk size`](/silk/docs/man/silk-size.1/) |
| Work with devices | [`silk devices`](/silk/docs/man/silk-devices.1/) |
| Sign artifacts | [`silk codesign`](/silk/docs/man/silk-codesign.1/) |
| Format source | [`silk format`](/silk/docs/man/silk-format.1/) |
| Embed the compiler | [`libsilk` quickstart](/silk/docs/compiler/libsilk-quickstart/) |

If a command fails, use its error code to find the [diagnostic](/silk/docs/compiler/diagnostics/). The [CLI reference](/silk/docs/compiler/cli-silk/) lists all flags, inputs, and output kinds.

<!-- Preserve existing section links; details now live in the linked references. -->
<span id="the-key-idea-the-module-set"></span>
<span id="silk-repl-interactive-exploration"></span>
<span id="silk-check-fast-feedback"></span>
<span id="silk-test-language-level-tests-with-tap"></span>
<span id="silk-build-artifacts-targets-and-non-silk-inputs"></span>
<span id="build-inputs"></span>
<span id="target-selection"></span>
<span id="inspection-commands-for-tools-and-ci"></span>
<span id="package-workflow-silktoml-silk-package-installuninstall"></span>
<span id="platform-devices-and-signing"></span>
<span id="features-and-conditional-compilation"></span>
<span id="documentation-man-pages-environment-and-formatting"></span>
<span id="embedding-and-silk-cc"></span>
<span id="diagnostics"></span>
<span id="next"></span>

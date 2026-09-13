---
layout: "docs"
title: "All module specifiers"
description: "Public, stable module specifiers:"
docsCollection: "sage"
section: "javascript"
order: 15
sourcePath: "javascript/all-modules.md"
githubRepo: "oro-computer/sage"
githubRef: "master"
---

# All module specifiers

Public, stable module specifiers:

```text
sage:fs
sage:path
sage:process
sage:env
sage:navigator
sage:performance
sage:crypto
sage:uuid
sage:url
sage:core/dom
sage:core/web
sage:fetch
```

Present in the runtime but not part of the stable downstream surface:

```text
sage:core/global
sage:internal/host
```

Use the stable list for plugin code you expect to keep working across releases.

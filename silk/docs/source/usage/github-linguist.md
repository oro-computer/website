# GitHub Linguist Support

This repository includes a `.gitattributes` file that tags `*.slk` files as Silk sources for GitHub Linguist.

## What This Does

- Ensures `*.slk` files are classified as Silk in GitHub’s language breakdown.
- Helps GitHub apply the correct syntax highlighting when a TextMate grammar is available.

## Reuse in Other Repositories

If you maintain downstream Silk projects, copy the `.gitattributes` entry:

```
*.slk linguist-language=Silk
*.slk linguist-detectable=true
```

Adjust or extend the entries if you use additional Silk-related file extensions.

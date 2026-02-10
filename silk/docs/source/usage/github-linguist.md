# GitHub Linguist Support

The Silk compiler repository includes a `.gitattributes` entry that tags `*.slk` files as Silk sources for GitHub
Linguist.

## What This Does

- Ensures `*.slk` files are classified as Silk in GitHub’s language breakdown.
- Helps GitHub apply the correct syntax highlighting when a TextMate grammar is available.

## Reuse in Other Repositories

If you maintain downstream Silk projects, copy these lines into your project’s `.gitattributes`:

```
*.slk linguist-language=Silk
*.slk linguist-detectable=true
```

Adjust or extend the entries if you use additional Silk-related file extensions.

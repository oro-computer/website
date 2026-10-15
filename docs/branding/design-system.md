## CSS Design System
```css
:root {
  --color-gold: #F6C945;
  --color-purple: #5B3BA2;
  --color-green: #3E9B65;
  --color-orange: #F47A28;
  --color-dark: #1F1F1F;
  --color-ivory: #FAF8F4;
  --font-display: 'Aeonik', 'Satoshi', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 12px;
  --shadow: 0 4px 16px rgba(0,0,0,0.06);
}
```


Website tokens are defined in `src/globals/global.css`. All layouts share the dark
canvas, ivory text, solid raised surfaces, and gold action palette. Syntax colors
are defined in `src/globals/highlight.css`; nested inline-code rules must never
recolor fenced code or override syntax tokens. Primary actions use solid gold
with graphite text in both default and hover states. Respect reduced-motion
preferences and preserve visible focus rings.

Documentation side navigation uses flat, unfilled rows. Mark the current page or
section with gold text and a short, square 2px rail; keep keyboard focus clearly
visible. Avoid rounded selection boxes, inset shadows, and outlines for the
current-page state. Allow long titles to wrap within the sidebar.

Site search uses a solid dark modal with a restrained border, generous row
spacing, and a gold rail for the keyboard-selected result. Keep the search
field visually focused, show each result's collection, and support Command+K
on Apple platforms and Control+K elsewhere. Preserve native dialog focus
containment, Escape dismissal, and focus restoration.

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


Website tokens are defined in `src/globals/global.css`. All layouts share the
selected light or dark palette, solid raised surfaces, and gold actions. Syntax colors
are defined in `src/globals/highlight.css`; nested inline-code rules must never
recolor fenced code or override syntax tokens. Primary actions use solid gold
with graphite text in both default and hover states. Respect reduced-motion
preferences and preserve visible focus rings.

Documentation side navigation uses flat, unfilled rows. Mark the current page or
section with gold text and a short, square 2px rail; keep keyboard focus clearly
visible. Avoid rounded selection boxes, inset shadows, and outlines for the
current-page state. Allow long titles to wrap within the sidebar. In light mode,
use the accessible gold-toned accent token for text, rails, and focus rings.

Site search uses a solid themed modal with a restrained border, generous row
spacing, and a gold rail for the keyboard-selected result. Keep the search
field visually focused, show each result's collection, and support Command+K
on Apple platforms and Control+K elsewhere. Preserve native dialog focus
containment, Escape dismissal, and focus restoration.

The shared header offers a 44px icon button that switches directly between light
and dark. Show a moon to switch to dark and a sun to switch to light; provide an
accessible action label and matching tooltip. Follow live OS changes until the
visitor makes an explicit choice, then save that choice locally.
Use CSS system preferences even without JavaScript, hide the inactive button,
and apply saved overrides in the document head before styles paint. Themes change
colors rather than layout, type scale, logo artwork, or information hierarchy.

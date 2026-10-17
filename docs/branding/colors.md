## Colors
| Name              | HEX       | Role       | Description                                                                                              |
| ----------------- | --------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| **Oro Gold**      | `#F6C945` | Primary    | Represents brilliance, energy, and refined performance. Used for highlights, icons, and active elements. |
| **Deep Purple**   | `#5B3BA2` | Secondary  | Symbol of logic, depth, and computation. Used for headers, backgrounds, and hero gradients.              |
| **Verdant Green** | `#3E9B65` | Accent     | Signifies growth and flow; ideal for call-to-actions or success states.                                  |
| **Solar Orange**  | `#F47A28` | Accent     | Represents vitality and creativity. Works well for buttons, hover states, and dynamic accents.           |
| **Dark Graphite** | `#1F1F1F` | Neutral    | Body text, headers, and dark backgrounds.                                                                |
| **Soft Ivory**    | `#FAF8F4` | Neutral    | Primary text on dark surfaces; creates warmth and elegance.                                                         |
| **Slate Gray**    | `#7A7A7A` | Supporting | Secondary text, icons, and UI dividers.                                                                  |

## Gradient Systems
- `linear-gradient(135deg, #F6C945 0%, #F47A28 50%, #5B3BA2 100%)`
- `radial-gradient(circle at center, #F6C945 0%, #3E9B65 70%)`

## Dark website surfaces

The website supports dark and light presentations throughout, including documentation and code samples.
Use warm near-black `#11100F` for the canvas, `#1F1F1F` for raised surfaces,
Soft Ivory for primary text, and `#B8B4AD` for supporting text. Oro Gold marks
links, current navigation, focus rings, and primary actions. Gold buttons use
Dark Graphite text. Deep Purple is decorative; use `#C9B4FF` for readable purple
text. Never use Slate Gray for small text on raised surfaces.

Text must meet WCAG AA contrast (4.5:1, or 3:1 for large text). Controls need
visible boundaries and keyboard focus. Code comments are supporting text, not
decoration, and must meet the same 4.5:1 requirement. Do not reduce text opacity
on hover or inside nested surfaces.

## Light website surfaces

Use Soft Ivory `#FAF8F4` for the canvas and Dark Graphite `#1F1F1F` for primary
text. Warm surfaces `#F1EEE8` and `#E9E4DC` distinguish controls and code without
introducing cool white panels. Supporting text uses `#5D5850`; control boundaries
use `#8C8171`. Gold remains `#F6C945` for primary button fills and logo artwork,
with graphite button labels and a dark boundary. For readable gold-toned text,
links, selection rails, and focus rings use `#785300`. Never put gold or ivory
body text on light backgrounds. Purple text uses the original `#5B3BA2`.

Both presentations use semantic tokens for surfaces, text, controls, and syntax.
Code samples follow the selected theme, including comments, punctuation, and
copy controls. Preserve the original logo colors; adapt decorative geometry's
neutral strokes to the canvas. Follow the system preference by default and offer
an icon button to switch between light and dark. Apply saved choices before paint; content must
remain readable with JavaScript or storage unavailable.

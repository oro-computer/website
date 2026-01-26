Oro Website Agent Guidelines
================================

This repository powers the static web presence for the Oro Runtime, a native application runtime built on web technologies. Follow these guardrails whenever you add or update content.

Branding Source of Truth
------------------------

- Always consult the documents under `docs/branding/` **before** touching design, layout, color, iconography, or copy tone.
- Key references:
  - `docs/branding/style-principles.md` – high-level voice & tone.
  - `docs/branding/colors.md` – approved palette and usage rules.
  - `docs/branding/typography.md` – type stack, weights, pairing.
  - `docs/branding/layout.md` – spacing grid, structure, and responsive behavior.
  - `docs/branding/logo.md` – logo usage, exclusion zones, and assets in `docs/branding/assets/`.
  - `docs/branding/design-system.md` and `docs/branding/motifs.md` – reusable components and visual motifs.
- If a proposed change diverges from these docs, sync with brand stakeholders and update the docs first so the repository stays canonical.

Content & Site Architecture
---------------------------

- The site is intentionally static; default to generating plain `html`, `css`, and Markdown content that can be built without a backend.
- Long-form content—blog posts, docs, guides, API references—should live as Markdown so it can plug into the static site generator of choice later.
- When adding new pages, keep assets optimized (SVG preferred) and named consistently with the branding guidelines.

Collaboration Tips
------------------

- Document rationale for significant changes in PR descriptions so downstream contributors can trace decisions.
- When unsure about brand alignment, reference the docs above and surface questions early rather than guessing.
- Use the public repos at `https://github.com/oro-computer` and `https://github.com/oro-computer/oro-runtime` to track issues and share work.
- Reach out via `info@oro.computer` for general inquiries, `contributors@oro.computer` for community coordination, and `runtime@oro.computer` for runtime-specific conversations.

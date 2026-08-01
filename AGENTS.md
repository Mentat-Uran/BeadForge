# AGENTS.md

BeadForge is a dependency-free, single-file browser application.

## Development rules

- Keep the core editor usable offline and without an account or backend.
- Preserve import/export compatibility for the documented JSON grid format.
- Keep user artwork in browser memory or explicit local downloads; do not add silent uploads, analytics, or telemetry.
- Escape or validate imported values before rendering them into the document.
- Avoid adding a build step or runtime dependency unless the README and offline workflow are updated together.
- Do not commit personal artwork, generated exports, credentials, or local editor configuration.

## Validation

- Open `BeadForge.html` in a current browser.
- Exercise a new canvas, drawing, undo, import, export, image conversion, and print flow when those areas change.
- Check that the example JSON fixtures still import or fail as documented.

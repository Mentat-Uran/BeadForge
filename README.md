# BeadForge

BeadForge is a single-file, browser-based pixel bead pattern editor. It runs locally without a build system or backend and is intended for designing, previewing, importing, exporting, and printing bead-art patterns.

## Features

- Canvas drawing, erasing, fill, color picking, undo, zoom, pan, symmetry, rotation, and flipping.
- Multi-brand color palettes with search and color-family filters.
- Image-to-pattern conversion and color matching.
- JSON import/export, PNG export, CSV material lists, and printable pattern sheets.
- Optional text-to-pattern assistance through a user-provided external tool; the repository does not contain API keys or a hosted AI service.

## Run locally

Open [`BeadForge.html`](BeadForge.html) in a modern browser. No installation, account, backend, or network connection is required for the core editor.

For a local static server:

```powershell
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/BeadForge.html`.

## Files

```text
BeadForge.html       # Application source: HTML, CSS, and JavaScript
test_import.json     # Example import fixture
test_raw_grid.json   # Small example grid fixture
test_invalid_colors.json  # Validation fixture
BeadForge-Post.md    # Project background and product notes
```

## Privacy and contributions

Designs are processed in the browser. Do not commit private artwork, personal files, credentials, or generated exports. Keep changes dependency-free where possible and test the editor in at least one current Chromium- or Firefox-based browser.

This repository intentionally contains no GitHub Actions workflows. Validation is local and manual.

## License

The project is released under the [MIT License](LICENSE).

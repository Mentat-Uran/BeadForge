# Contributing

## Scope

BeadForge is intentionally a dependency-free, single-file browser application.
Keep the core editor usable offline, without an account, backend, telemetry, or
silent upload. Preserve the documented JSON import/export format.

Do not commit private artwork, generated exports, credentials, personal files, or
local editor configuration. Validate imported values before rendering them.

## Local validation

Before opening a pull request:

1. Open `BeadForge.html` in a current Chromium- or Firefox-based browser.
2. Exercise the areas affected by the change, such as canvas editing, undo,
   import, export, image conversion, or print.
3. Check that the example JSON fixtures still import or fail as documented.
4. Run the repository's lightweight static check when available. The remote
   workflow is intentionally brief; broader browser testing belongs on the
   contributor's machine.

## Pull requests

Keep pull requests narrowly scoped. Explain the user-visible impact, list the
local checks you ran, and identify any browser or manual checks that remain.
Avoid adding a build step or runtime dependency unless the offline workflow and
documentation are updated together.

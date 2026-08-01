# Security Policy

## Scope

BeadForge is a local, browser-only application. It does not provide a hosted
backend or intentionally upload designs. Reports about credential exposure,
unexpected network access, unsafe import rendering, or other behavior that could
harm a user's files are in scope.

## Reporting a vulnerability

Do not open a public issue for a security vulnerability. Use GitHub's private
security-advisory feature when available, or contact the repository maintainer
through an existing trusted private channel. Include the affected commit or
version, a minimal reproduction, impact, and a safe remediation idea.

Do not attach real credentials, private artwork, personal files, or sensitive
browser data to a report.

## Safety boundaries

- Keep designs and imported files under the user's explicit control.
- Do not add silent uploads, analytics, telemetry, or third-party API keys.
- Treat imported JSON, image metadata, and generated HTML values as untrusted
  input and validate or escape them before rendering.

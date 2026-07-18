# Security Policy

## Reporting a vulnerability

If you discover a security issue in Wayfare, please report it privately rather
than opening a public issue. Email the maintainers or open a
[GitHub security advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/about-coordinated-disclosure-of-security-vulnerabilities)
for this repository. We aim to acknowledge reports within a few business days
and to ship a fix or mitigation as quickly as the severity warrants.

Please include:

- a description of the issue and its impact,
- steps to reproduce (a minimal proof of concept if possible),
- any relevant logs or payloads (with secrets redacted).

## Supported versions

The `main` branch receives security fixes. There are no long-term support
branches for this project.

## How Wayfare reduces risk by design

- **No secrets in the repository.** Only `.env.example` is committed; a secret
  scan (gitleaks) runs in CI on every push.
- **All external input is validated** at the boundary with strict schemas that
  reject unknown fields before data reaches the routing engine.
- **The language model cannot influence a decision.** Every routing choice is
  made by deterministic, typed code; model output is treated as untrusted text,
  sanitised, and only ever displayed.
- **Hardened responses.** A per-request nonce-based Content-Security-Policy and
  the standard security headers are applied by middleware; API errors return a
  sanitised envelope and never leak a stack trace.
- **Abuse resistance.** API routes are rate limited per client with a
  `Retry-After` hint.
- **Dependency hygiene.** Production dependencies are audited in CI and static
  analysis (CodeQL, `security-and-quality`) runs on every change.

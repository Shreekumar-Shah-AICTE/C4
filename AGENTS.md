# Engineering Guidelines

These are the standards every change to Wayfare must meet. They exist to keep
the codebase correct, secure, accessible, and easy to reason about. All of them
are enforced automatically by the CI quality gate — nothing here is aspirational.

## Architecture

Wayfare separates **decisions** from **phrasing**:

- **Deterministic core (`src/core/`).** Pure, fully-typed, I/O-free functions
  hold all business logic: the stadium graph model, Dijkstra routing, the crowd
  index, step generation, and input validation. The core imports nothing from
  React, Next.js, or the network.
- **AI layer (`src/ai/`).** A single, isolated integration that only rephrases
  facts the core already computed. It never decides a route. Any failure falls
  back to deterministic narration.
- **Server layer (`src/server/`).** Request handlers, the in-memory store,
  security headers, rate limiting, and response envelopes. Handlers are
  transport-neutral and unit-tested; the Next.js route files are thin adapters.
- **UI (`src/app/`, `src/components/`).** Presentational React components driven
  by props. No business logic lives in the UI.

New logic belongs in the core behind a typed function with tests — not in a
route handler or a component.

## Coding standards

- **Functions ≤ 60 lines, files ≤ 300 lines, nesting depth ≤ 3, ≤ 4 parameters.**
  Group related arguments into a typed object rather than adding parameters.
- **Cyclomatic complexity ≤ 10 per function** and low cognitive complexity.
  Prefer guard clauses, early returns, and lookup maps over long branches.
- **No type escapes.** `any`, `as any`, `@ts-ignore`, and `@ts-nocheck` are
  forbidden. `!` non-null assertions are forbidden; use a checked access or a
  narrow `as T` after a runtime guard, with a comment stating the invariant.
- **Every exported symbol has a doc comment** describing intent, and any
  non-trivial algorithm documents its Big-O in the docstring.
- **No dead code, commented-out code, `TODO`/`FIXME`, or magic numbers.** Name
  constants and enumerate options.
- **Intention-revealing names.** No `tmp`, `data2`, or `handleClick2`.
- **Formatting is not a matter of taste** — Prettier output is committed and
  checked in CI.

## Validation and errors

- Validate **all** external input (uploads, request bodies) with strict schemas
  that reject unknown fields.
- Throw typed domain errors, never bare strings. Handlers map them to sanitised
  HTTP envelopes; internal failures become a generic 500 with no stack trace.
- Fail closed: any AI or network failure returns a safe fallback, never a crash
  or a blank screen.

## Testing

- **100% line and branch coverage** on the core, AI, and server layers, enforced
  in CI. Write the test that exercises each guard and `catch`.
- Keep an explicitly named `edge-cases` suite and a `branches` suite so
  robustness is easy to read.
- **Mutation testing** guards the algorithmic core; the score must stay at or
  above the configured threshold.
- Mock all network access. Inject clocks and sleeps so time-based code is
  deterministic under test.
- Components carry render tests and automated accessibility (axe) assertions; a
  Playwright smoke test covers the happy path end to end.

## Security

- Never commit secrets. Only `.env.example` is tracked; a secret scan runs in CI.
- Apply a nonce-based Content-Security-Policy and standard hardening headers to
  every response.
- Treat model output as untrusted: sanitise before display and never insert raw
  HTML.
- Rate limit API routes and return `Retry-After` on rejection.

## Accessibility

- Semantic landmarks, exactly one `h1`, a skip link, and labelled controls.
- Announce dynamic updates with `aria-live`; never convey meaning by colour
  alone (pair colour with text or an icon).
- Maintain visible focus, sufficient contrast, `prefers-reduced-motion`
  support, correct `lang`, and full right-to-left rendering for RTL locales.

## The quality gate

Every push runs, and must pass: type check, lint (zero warnings), format check,
duplication check, dead-code/unused-dependency check, circular-dependency check,
unit tests with full coverage, mutation testing, a production dependency audit,
static analysis (CodeQL), a production build, and Playwright end-to-end plus
accessibility checks. A change is not done until the gate is green.

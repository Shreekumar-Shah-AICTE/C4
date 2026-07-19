# Contributing to Wayfare

Thanks for taking the time to improve Wayfare. This guide covers how to set up
the project, the standards every change must meet, and how the quality gate
decides whether a change is done. It is deliberately short; the authoritative
rules live in [`AGENTS.md`](./AGENTS.md), the review priorities in
[`.gemini/styleguide.md`](./.gemini/styleguide.md), and the design rationale in
[`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Prerequisites

- Node.js `>= 20.11.0` (see `engines` in `package.json`).
- npm (the repo pins exact versions via `package-lock.json`).

## Getting started

```bash
npm ci             # install exact, locked dependencies
npm run dev        # start the app on http://localhost:3000
```

The app is fully functional with no configuration. To enable live model
narration, copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`; without
it, Wayfare narrates with its deterministic fallback.

## The quality gate

Run the whole gate locally before opening a pull request — CI runs the same
commands, so a green local run should mean a green pipeline.

```bash
npm run verify     # typecheck + lint + format:check + duplication + circular + coverage
npm run mutation   # mutation testing on the routing core (breaks below 90%)
npm run e2e        # Playwright smoke test + axe accessibility scan
```

Individual steps are available as scripts (`typecheck`, `lint`, `format:check`,
`dup`, `knip`, `madge`, `test:cov`). A change is not done until every one of them
passes.

## What every change must satisfy

These are enforced by CI; the full rationale is in `AGENTS.md`.

- **Put logic in the core.** New routing/crowd/step logic belongs in `src/core`
  behind a typed, documented function with tests — not in a route handler or a
  component.
- **No type escapes.** `any`, `as any`, `@ts-ignore`, `@ts-nocheck`, and `!`
  non-null assertions are forbidden. Guard, then narrow.
- **Stay within the size and complexity limits.** Functions ≤ 60 lines, files
  ≤ 300 lines, nesting depth ≤ 3, ≤ 4 parameters, cyclomatic complexity ≤ 10.
- **Document exported symbols** with a doc comment, and note the Big-O of any
  non-trivial algorithm.
- **Prove behaviour with tests.** Keep 100% line and branch coverage on
  `src/core`, `src/ai`, and `src/server`, including each guard and `catch`. Add
  assertions a mutant would fail, not just lines a test executes.
- **Validate untrusted input** at the boundary with a strict schema, and throw a
  typed domain error rather than a bare string.
- **Keep it accessible.** Preserve one `h1`, landmarks, the skip link, labelled
  controls, `aria-live` for dynamic content, visible focus, and correct
  right-to-left rendering. Never signal meaning by colour alone.

## Accessibility and security are not optional

UI changes must pass the `axe` checks in the component tests and the end-to-end
scan. If you touch the CSP/nonce wiring (`src/middleware.ts`) or the validation
(422) path, **verify the change in a real browser** — both are load-bearing and
have regressed silently past green unit tests before.

## Commits and pull requests

- Keep commits focused and write imperative, descriptive messages that explain
  the _why_, not just the _what_.
- Keep the repository to a single `main` branch and regularly push progress.
- A pull request should describe the change, link any relevant context, and show
  the quality gate passing. If a check is red, fix the root cause rather than
  weakening the gate.

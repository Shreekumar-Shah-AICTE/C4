# Review Style Guide

This guide tells automated and human reviewers what to prioritise when
reviewing Wayfare. It complements the contributor standards in `AGENTS.md`;
here the emphasis is on what to flag in a pull request.

## Review priorities (in order)

1. **Correctness of the deterministic core.** Routing, the crowd index, and step
   generation must be pure and total. Flag any hidden I/O, global mutation, or a
   branch that lacks a test.
2. **Decisions never come from the model.** Reject any change that lets AI output
   choose a route, pass validation, or bypass the typed core. The model may only
   phrase already-computed facts.
3. **Boundary validation.** Every new input path must parse through a strict
   schema that rejects unknown fields and yields a typed error.
4. **Tests prove behaviour.** New logic needs assertions on values and on each
   guard/`catch`, not just execution. Missing branch coverage or weak assertions
   (that a mutant would survive) should block the change.

## What to flag

- A function over the size or complexity limits, or with more than four loose
  parameters instead of a grouped object.
- Any `any`, `as any`, `!`, or suppression comment.
- An exported symbol without a doc comment, or a non-trivial algorithm without a
  complexity note.
- Magic numbers, dead code, or leftover `TODO`/`FIXME`.
- Colour used as the only signal, a missing label, an unlabelled dynamic region,
  or anything that breaks right-to-left layout.
- A raw error or stack trace reaching the client; a response without the shared
  sanitised envelope.
- Secrets, tokens, or `.env` contents in the diff.

## Accessibility checklist for UI changes

- One `h1`, semantic landmarks, and a working skip link remain intact.
- Interactive elements are keyboard reachable with visible focus.
- Dynamic content is announced via `aria-live`.
- Motion respects `prefers-reduced-motion`.

## Definition of an approvable change

The change keeps the CI gate green (types, lint, format, duplication, dead-code,
coverage, mutation, audit, build, E2E/axe) and adds tests for the behaviour it
introduces. If any of those are missing, request changes.

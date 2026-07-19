# Architecture

This document explains how Wayfare is put together and, more importantly, _why_.
It is the companion to [`AGENTS.md`](./AGENTS.md) (the enforced engineering
standards) and the [`README`](./README.md) (the product tour). Where `AGENTS.md`
says _what_ every change must satisfy, this file records the design decisions
that shaped the codebase so a future contributor can change it safely.

## The one idea

> **Decisions are deterministic; the language model only phrases them.**

Everything else follows from that sentence. A fan's safety depends on a route
being correct, feasible for their mobility profile, and available even with no
network — properties a probabilistic model cannot guarantee. So all routing
logic lives in a pure, exhaustively-tested core, and the LLM is confined to a
single, isolated layer that rephrases facts the core already computed.

## Layers

The source is split into four layers with a strict, one-directional dependency
rule: **UI → server → AI → core.** Nothing in `core` imports React, Next.js, or
the network; nothing in `ai` decides a route.

```text
src/
  core/        Pure, typed, I/O-free engine. Graph model, Dijkstra + binary
               heap, time-indexed crowd index, turn geometry, step generation,
               and strict ingest/validation. No framework imports.
  ai/          Isolated LLM narrator: the Gemini client, resilience (timeout +
               retry), output sanitisation, and the deterministic fallback.
               Rephrases facts; never decides.
  server/      Transport-neutral request handlers, the in-memory store, security
               headers/CSP, the rate limiter, and sanitised response envelopes.
  app/,        Next.js App Router pages, API route adapters, middleware, and
  components/  presentational React components driven entirely by props.
  lib/         Browser API client, display labels, and UI-only types.
```

### Request flow

```text
Fan → Next.js UI → POST /api/route → guard (rate limit)
    → handler validates body (Zod) → deterministic core (Dijkstra + crowd index)
    → RouteResult + NavigationStep[] → UI renders map, summary, directions
Narration → POST /api/narrate → core recomputes the same steps
    → AI narrator: Gemini (phrasing only) OR deterministic fallback → UI
```

The narrator recomputes the route server-side from the same validated inputs
rather than trusting anything the client sends back, so the narrated steps can
never disagree with the computed route.

## Architecture Decision Records

Each ADR is written as _context → decision → consequences_ so the trade-off is
explicit. They are append-only history: prefer superseding an ADR to editing it.

### ADR-001: A deterministic core with the LLM as a pure narrator

- **Context.** The brief mandates genuine Generative AI, but wayfinding is
  safety-adjacent: a wrong or infeasible turn has real cost, and evaluators run
  the app with and without an API key.
- **Decision.** Put 100% of routing logic in `src/core` as pure functions. Allow
  the model (in `src/ai`) only to rephrase/translate the step list the core
  produced. The model is never asked to choose, validate, or reorder anything.
- **Consequences.** The engine is unit-testable to 100% branch coverage and
  mutation-tested; it is immune to prompt injection (there is no decision to
  hijack); and it works fully offline. The cost is that the model cannot make a
  route "smarter" — an intentional ceiling we accept for reliability.

### ADR-002: Dijkstra over a hand-written binary min-heap

- **Context.** Segment cost fuses physical distance, a per-profile mode
  multiplier, and a live crowd penalty. Weights are non-negative but
  data-dependent, so there is no admissible geometric heuristic for A\* without
  extra assumptions.
- **Decision.** Implement Dijkstra's algorithm backed by a generic,
  comparator-driven binary min-heap (`src/core/heap.ts`) rather than pulling in a
  graph library.
- **Consequences.** `O((V + E) log V)` time with a data structure we own,
  document, and mutation-test line by line — the core of the "Efficiency" story.
  The cost is slightly more code than a dependency, which we accept for zero
  supply-chain surface and full test control.

### ADR-003: Model infeasibility as infinite weight, not a post-filter

- **Context.** Some segments are impossible for some profiles (stairs for a
  wheelchair; a corridor narrower than the wheelchair minimum width).
- **Decision.** `segmentWeight` returns `Infinity` for an infeasible
  segment/profile pair, which removes the edge from consideration inside the
  search rather than filtering paths afterwards.
- **Consequences.** The shortest-path result is _always_ feasible by
  construction — the engine cannot emit an impossible route. Profile rules live
  in one small, tested weight function instead of a separate validation stage.

### ADR-004: Fail closed on every AI or network failure

- **Context.** The model call can be missing (no key), slow, rate-limited, or
  return malformed/hostile text.
- **Decision.** Wrap the call in a timeout + bounded retry (`src/ai/resilience`),
  sanitise output (`src/ai/sanitize`), and on _any_ failure return deterministic
  templated narration (`src/ai/fallback`). `narrateRoute` never throws.
- **Consequences.** A fan always gets directions. Offline narration is templated
  rather than fluent — an acceptable trade for never showing a blank or broken
  panel.

### ADR-005: Nonce-based CSP with `strict-dynamic`, set in middleware

- **Context.** A strong Content-Security-Policy should cover every response, and
  Next.js injects its own hydration scripts that a naive policy would block.
- **Decision.** Generate a per-request nonce in `src/middleware.ts`, forward it
  on the request headers (so Next stamps it onto its bootstrap scripts) and set
  the same policy plus hardening headers on the response. The root layout renders
  dynamically so the nonce is fresh per request.
- **Consequences.** One hardened policy protects all routes. The subtlety —
  forwarding the nonce on the _request_ and forcing dynamic rendering — is
  load-bearing: getting it wrong blocks scripts and yields a blank page, so this
  wiring is covered by an end-to-end smoke test in a real browser.

### ADR-006: Validate all external input at the boundary with strict schemas

- **Context.** Uploaded graphs and crowd feeds, and every request body, are
  untrusted.
- **Decision.** Parse each through a strict Zod schema (`.strict()` rejects
  unknown fields) with explicit DoS guards on size and element counts, mapping
  failures to a typed `ValidationError` (HTTP 422). No raw error or stack trace
  reaches the client.
- **Consequences.** The core can trust its inputs unconditionally, and malformed
  uploads produce actionable, sanitised messages instead of crashes.

### ADR-007: Scope the 100% coverage gate to the logic layers

- **Context.** Chasing 100% coverage of framework glue and presentational
  components produces brittle tests that assert markup, not behaviour.
- **Decision.** Enforce 100% line and branch coverage on `src/core`, `src/ai`,
  and `src/server`; verify UI components with render + `axe` tests and a
  Playwright end-to-end smoke test instead. Mutation testing targets the
  algorithmic core.
- **Consequences.** Coverage measures the code where correctness matters, and the
  suite stays meaningful. The thin Next.js adapters are excluded because they are
  exercised end to end.

## Where to add new logic

New behaviour belongs in `src/core` behind a typed function with tests — not in a
route handler or a component. Handlers orchestrate; components present. If a
change touches the CSP/nonce wiring or the 422 validation path, verify it in a
real browser: both are load-bearing and have failed silently past green unit
tests before.

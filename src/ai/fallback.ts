/**
 * Deterministic, offline-safe narration.
 *
 * This module is the safety net that lets the app fail closed: it turns the
 * computed {@link NavigationStep}s into a plain-English paragraph using pure
 * string templates, with no network, no model, and no source of failure. The
 * narrator ({@link narrateRoute}) prefers the language model but always has this
 * to fall back to, so a missing API key, a timeout, or a hostile response can
 * never leave a fan without directions.
 *
 * It is deliberately separate from the model-orchestration logic so the "what we
 * say" (here) is decoupled from the "who says it" (the narrator).
 */

import type { NavigationStep } from '@/core/types';

/**
 * Renders a single step as one English sentence. Shared with the prompt builder
 * so the model is asked to rephrase exactly the sentences the fallback would
 * otherwise show — the two narration paths always describe the same facts.
 */
export function describeStep(step: NavigationStep): string {
  const distance = `${step.distanceMeters} m`;
  if (step.kind === 'depart') {
    return `Start at ${step.fromLabel} and head toward ${step.toLabel} (${distance}).`;
  }
  if (step.kind === 'continue') {
    return `Continue to ${step.toLabel} (${distance}).`;
  }
  if (step.kind === 'turn') {
    return `Turn ${step.turn} toward ${step.toLabel} (${distance}).`;
  }
  if (step.kind === 'transition') {
    return `Take the ${step.mode} to ${step.toLabel} (${distance}).`;
  }
  return `Arrive at ${step.toLabel}.`;
}

/** Deterministic, offline-safe narration built purely from the step list. */
export function fallbackNarration(steps: readonly NavigationStep[]): string {
  if (steps.length === 0) {
    return 'You are already at your destination.';
  }
  return steps.map(describeStep).join(' ');
}

import type { ReactElement } from 'react';

import type { NavigationStep } from '@/core/types';
import { CROWD_ICONS, CROWD_LABELS } from '@/lib/labels';

function stepText(step: NavigationStep): string {
  if (step.kind === 'depart') {
    return `Leave ${step.fromLabel}, head toward ${step.toLabel}`;
  }
  if (step.kind === 'continue') {
    return `Continue to ${step.toLabel}`;
  }
  if (step.kind === 'turn') {
    return `Turn ${step.turn} to ${step.toLabel}`;
  }
  if (step.kind === 'transition') {
    return `Take the ${step.mode} to ${step.toLabel}`;
  }
  return `Arrive at ${step.toLabel}`;
}

/** Ordered, screen-reader-friendly list of navigation steps. */
export function DirectionsList({
  steps,
}: {
  readonly steps: readonly NavigationStep[];
}): ReactElement {
  return (
    <ol className="steps" aria-label="Turn-by-turn directions">
      {steps.map((step) => (
        <li className="step" key={step.index}>
          <span className="index" aria-hidden="true">
            {step.index + 1}
          </span>
          <span>
            {stepText(step)}
            {step.distanceMeters > 0 ? ` (${step.distanceMeters} m)` : ''}
            {' — '}
            <span className="badge" data-crowd={step.crowdLevel}>
              <span aria-hidden="true">{CROWD_ICONS[step.crowdLevel]}</span>
              {CROWD_LABELS[step.crowdLevel]}
            </span>
            {step.note !== null ? <span className="hint"> {step.note}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

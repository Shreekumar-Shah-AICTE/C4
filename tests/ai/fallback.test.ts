import { describe, expect, it } from 'vitest';

import { describeStep, fallbackNarration } from '@/ai/fallback';
import type { NavigationStep } from '@/core/types';

const steps: readonly NavigationStep[] = [
  {
    index: 0,
    kind: 'depart',
    fromLabel: 'Gate',
    toLabel: 'Hall',
    mode: 'level',
    distanceMeters: 10,
    crowdLevel: 'calm',
    turn: 'straight',
    note: null,
  },
  {
    index: 1,
    kind: 'continue',
    fromLabel: 'Hall',
    toLabel: 'Bend',
    mode: 'level',
    distanceMeters: 5,
    crowdLevel: 'calm',
    turn: 'straight',
    note: null,
  },
  {
    index: 2,
    kind: 'turn',
    fromLabel: 'Bend',
    toLabel: 'Ramp',
    mode: 'level',
    distanceMeters: 6,
    crowdLevel: 'busy',
    turn: 'left',
    note: 'Busy corridor',
  },
  {
    index: 3,
    kind: 'transition',
    fromLabel: 'Ramp',
    toLabel: 'Upper',
    mode: 'elevator',
    distanceMeters: 8,
    crowdLevel: 'calm',
    turn: 'straight',
    note: 'Step-free',
  },
  {
    index: 4,
    kind: 'arrive',
    fromLabel: 'Seat',
    toLabel: 'Seat',
    mode: 'level',
    distanceMeters: 0,
    crowdLevel: 'calm',
    turn: 'straight',
    note: null,
  },
];

describe('describeStep', () => {
  it('phrases every step kind as a single sentence', () => {
    expect(describeStep(steps[0] as NavigationStep)).toBe(
      'Start at Gate and head toward Hall (10 m).',
    );
    expect(describeStep(steps[1] as NavigationStep)).toBe('Continue to Bend (5 m).');
    expect(describeStep(steps[2] as NavigationStep)).toBe('Turn left toward Ramp (6 m).');
    expect(describeStep(steps[3] as NavigationStep)).toBe('Take the elevator to Upper (8 m).');
    expect(describeStep(steps[4] as NavigationStep)).toBe('Arrive at Seat.');
  });
});

describe('fallbackNarration', () => {
  it('describes every step kind deterministically', () => {
    const text = fallbackNarration(steps);
    expect(text).toContain('Start at Gate');
    expect(text).toContain('Continue to Bend');
    expect(text).toContain('Turn left toward Ramp');
    expect(text).toContain('Take the elevator to Upper');
    expect(text).toContain('Arrive at Seat');
  });

  it('handles an empty step list', () => {
    expect(fallbackNarration([])).toContain('already at your destination');
  });
});

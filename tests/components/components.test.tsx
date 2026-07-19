import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ControlPanel } from '@/components/ControlPanel';
import { DirectionsList } from '@/components/DirectionsList';
import { JourneySummary } from '@/components/JourneySummary';
import { NarrationPanel } from '@/components/NarrationPanel';
import { StadiumMap } from '@/components/StadiumMap';
import type {
  MobilityProfile,
  NavigationStep,
  RouteResult,
  StadiumEdge,
  StadiumNode,
} from '@/core/types';
import type { RouteForm } from '@/lib/types';

const steps: readonly NavigationStep[] = [
  {
    index: 0,
    kind: 'depart',
    fromLabel: 'North Gate',
    toLabel: 'Concourse',
    mode: 'level',
    distanceMeters: 12,
    crowdLevel: 'calm',
    turn: 'straight',
    note: null,
  },
  {
    index: 1,
    kind: 'turn',
    fromLabel: 'Concourse',
    toLabel: 'Section 101',
    mode: 'level',
    distanceMeters: 20,
    crowdLevel: 'busy',
    turn: 'left',
    note: 'Busy corridor; keep to one side.',
  },
  {
    index: 2,
    kind: 'arrive',
    fromLabel: 'Section 101',
    toLabel: 'Section 101',
    mode: 'level',
    distanceMeters: 0,
    crowdLevel: 'calm',
    turn: 'straight',
    note: null,
  },
];

const route: RouteResult = {
  nodeIds: ['gate-n', 'lc-n', 'seat-101'],
  segments: [],
  totalDistanceMeters: 32,
  totalCost: 40,
  estimatedMinutes: 3.2,
  maxDensity: 0.6,
  profile: 'standard',
};

const nodes: readonly StadiumNode[] = [
  { id: 'gate-n', label: 'North Gate', kind: 'gate', x: 50, y: 8 },
  { id: 'seat-101', label: 'Section 101', kind: 'seat', x: 80, y: 40 },
];
const edges: readonly StadiumEdge[] = [
  {
    from: 'gate-n',
    to: 'seat-101',
    distanceMeters: 30,
    mode: 'level',
    widthMeters: 3,
    bidirectional: true,
  },
];
const profiles: readonly MobilityProfile[] = ['standard', 'wheelchair'];
const form: RouteForm = {
  originId: 'gate-n',
  destinationId: 'seat-101',
  minuteOfDay: 600,
  profile: 'standard',
  locale: 'en',
  datasetId: 'seed',
};

describe('presentational components', () => {
  // The suite runs with `globals: false`, so RTL's automatic per-test cleanup is
  // not registered; unmount explicitly to keep the shared DOM isolated.
  afterEach(cleanup);

  it('renders directions with crowd labels and no a11y violations', async () => {
    const { container } = render(<DirectionsList steps={steps} />);
    expect(screen.getByRole('list', { name: /directions/i })).toBeInTheDocument();
    expect(screen.getByText(/keep to one side/i)).toBeInTheDocument();
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('renders the journey summary statistics', () => {
    render(<JourneySummary route={route} />);
    expect(screen.getByText('32 m')).toBeInTheDocument();
    expect(screen.getByText('3.2 min')).toBeInTheDocument();
  });

  it('labels the stadium map for assistive technology', () => {
    render(
      <StadiumMap
        nodes={nodes}
        edges={edges}
        heat={[]}
        routeNodeIds={route.nodeIds}
        originId="gate-n"
        destinationId="seat-101"
        animate={false}
      />,
    );
    expect(screen.getByRole('img', { name: /stadium map/i })).toBeInTheDocument();
  });

  it('tags model narration with its true language and direction', () => {
    const { container } = render(
      <NarrationPanel
        narration={{ text: 'اذهب مباشرة ثم تصل.', source: 'model', locale: 'ar' }}
        rtl
        pending={false}
      />,
    );
    const paragraph = screen.getByText('اذهب مباشرة ثم تصل.');
    expect(paragraph).toHaveAttribute('lang', 'ar');
    // The whole region flips to RTL only for genuine right-to-left model output.
    expect(container.querySelector('.narration')).toHaveAttribute('dir', 'rtl');
  });

  it('keeps the English fallback left-to-right even for an RTL locale', () => {
    const { container } = render(
      <NarrationPanel
        narration={{
          text: 'Start at Gate and head toward Hall.',
          source: 'fallback',
          locale: 'ar',
        }}
        rtl
        pending={false}
      />,
    );
    const paragraph = screen.getByText(/Start at Gate/);
    expect(paragraph).toHaveAttribute('lang', 'en');
    expect(container.querySelector('.narration')).toHaveAttribute('dir', 'ltr');
  });

  it('exposes the arrival time as a human clock value on the slider', () => {
    render(
      <ControlPanel
        nodes={nodes}
        profiles={profiles}
        locales={['en']}
        datasets={[{ id: 'seed', label: 'Seed', sampleCount: 3 }]}
        form={{ ...form, minuteOfDay: 600 }}
        pending={false}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onNarrate={vi.fn()}
      />,
    );
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '10:00');
  });

  it('names the stadium map with human labels, not raw ids', () => {
    render(
      <StadiumMap
        nodes={nodes}
        edges={edges}
        heat={[]}
        routeNodeIds={route.nodeIds}
        originId="gate-n"
        destinationId="seat-101"
        animate={false}
      />,
    );
    expect(
      screen.getByRole('img', { name: /from North Gate to Section 101/i }),
    ).toBeInTheDocument();
  });

  it('emits form changes through the control panel', async () => {
    const onChange = vi.fn();
    render(
      <ControlPanel
        nodes={nodes}
        profiles={profiles}
        locales={['en', 'ar']}
        datasets={[{ id: 'seed', label: 'Seed', sampleCount: 3 }]}
        form={form}
        pending={false}
        onChange={onChange}
        onSubmit={vi.fn()}
        onNarrate={vi.fn()}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Destination'), 'gate-n');
    expect(onChange).toHaveBeenCalledWith({ destinationId: 'gate-n' });
  });
});

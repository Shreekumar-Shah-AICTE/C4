import type { ReactElement } from 'react';

import { ControlPanel } from '@/components/ControlPanel';
import { DirectionsList } from '@/components/DirectionsList';
import { JourneySummary } from '@/components/JourneySummary';
import { NarrationPanel } from '@/components/NarrationPanel';
import { StadiumMap } from '@/components/StadiumMap';
import { UploadPanel } from '@/components/UploadPanel';
import {
  type DatasetSummary,
  type MetadataPayload,
  type NarrationPayload,
  type RoutePayload,
} from '@/lib/api';
import { CROWD_LABELS } from '@/lib/labels';
import type { RouteForm, Status } from '@/lib/types';

const CROWD_LEGEND = ['calm', 'moderate', 'busy', 'congested'] as const;

interface PlannerLayoutProps {
  readonly metadata: MetadataPayload;
  readonly datasets: readonly DatasetSummary[];
  readonly form: RouteForm;
  readonly routeData: RoutePayload | null;
  readonly narration: NarrationPayload | null;
  readonly pending: boolean;
  readonly narrating: boolean;
  readonly status: Status | null;
  readonly onChange: (patch: Partial<RouteForm>) => void;
  readonly onSubmit: () => void;
  readonly onNarrate: () => void;
  readonly onUploaded: (summary: DatasetSummary) => void;
}

interface MapSectionProps {
  readonly metadata: MetadataPayload;
  readonly form: RouteForm;
  readonly routeData: RoutePayload | null;
  readonly pending: boolean;
  readonly status: Status | null;
}

interface JourneySectionProps {
  readonly routeData: RoutePayload | null;
  readonly narration: NarrationPayload | null;
  readonly narrating: boolean;
}

function MapSection({ metadata, form, routeData, pending, status }: MapSectionProps): ReactElement {
  return (
    <section className="panel" aria-labelledby="map-heading">
      <h2 id="map-heading">Concourse map</h2>
      <div className="map-wrap">
        <StadiumMap
          nodes={metadata.graph.nodes}
          edges={metadata.graph.edges}
          heat={routeData?.heat ?? []}
          routeNodeIds={routeData?.route.nodeIds ?? []}
          originId={form.originId}
          destinationId={form.destinationId}
          animate={!pending}
        />
      </div>
      <ul className="legend" aria-label="Crowd density legend">
        {CROWD_LEGEND.map((level) => (
          <li key={level}>
            <span className="swatch" style={{ background: `var(--${level})` }} aria-hidden="true" />
            {CROWD_LABELS[level]}
          </li>
        ))}
      </ul>
      {status !== null ? (
        <p className="status" data-tone={status.tone} role="alert">
          {status.message}
        </p>
      ) : null}
    </section>
  );
}

function JourneySection({ routeData, narration, narrating }: JourneySectionProps): ReactElement {
  return (
    <section className="panel" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Your journey</h2>
      {routeData !== null ? (
        <>
          <JourneySummary route={routeData.route} />
          <NarrationPanel
            narration={narration?.narration ?? null}
            rtl={narration?.rtl ?? false}
            pending={narrating}
          />
          <DirectionsList steps={routeData.steps} />
        </>
      ) : (
        <p>Plan a route to see step-by-step directions.</p>
      )}
    </section>
  );
}

/** The full authenticated planner view once metadata and a form are ready. */
export function PlannerLayout(props: PlannerLayoutProps): ReactElement {
  const { metadata, datasets, form, pending, onChange, onSubmit, onNarrate, onUploaded } = props;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to route planner
      </a>
      <header className="app-header">
        <h1>
          <span className="brand-badge">Wayfare</span>
          Calm, step-free stadium routing
        </h1>
        <p className="tagline">
          Enter your gate and seat, choose how you move, and Wayfare finds the least-crowded
          accessible path through the concourse — then narrates it in your language.
        </p>
      </header>

      <main id="main" className="layout">
        <div>
          <ControlPanel
            nodes={metadata.graph.nodes}
            profiles={metadata.profiles}
            locales={metadata.locales}
            datasets={datasets}
            form={form}
            pending={pending}
            onChange={onChange}
            onSubmit={onSubmit}
            onNarrate={onNarrate}
          />
          <UploadPanel onUploaded={onUploaded} />
        </div>

        <div>
          <MapSection
            metadata={metadata}
            form={form}
            routeData={props.routeData}
            pending={pending}
            status={props.status}
          />
          <JourneySection
            routeData={props.routeData}
            narration={props.narration}
            narrating={props.narrating}
          />
        </div>
      </main>

      <footer className="app-footer">
        Wayfare computes every route with a deterministic, fully-tested engine; the language model
        only phrases the result. No route decision depends on the model.
      </footer>
    </>
  );
}

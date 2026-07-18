import type { ReactElement } from 'react';

import type { MobilityProfile, StadiumNode } from '@/core/types';
import type { DatasetSummary } from '@/lib/api';
import { localeName, minuteToClock, PROFILE_LABELS } from '@/lib/labels';
import type { RouteForm } from '@/lib/types';

const TIME_MIN = 480;
const TIME_MAX = 780;
const TIME_STEP = 15;

interface ControlPanelProps {
  readonly nodes: readonly StadiumNode[];
  readonly profiles: readonly MobilityProfile[];
  readonly locales: readonly string[];
  readonly datasets: readonly DatasetSummary[];
  readonly form: RouteForm;
  readonly pending: boolean;
  readonly onChange: (patch: Partial<RouteForm>) => void;
  readonly onSubmit: () => void;
  readonly onNarrate: () => void;
}

/** The primary route-query form: origin, destination, profile, time, locale. */
export function ControlPanel({
  nodes,
  profiles,
  locales,
  datasets,
  form,
  pending,
  onChange,
  onSubmit,
  onNarrate,
}: ControlPanelProps): ReactElement {
  return (
    <form
      className="panel"
      aria-labelledby="controls-heading"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2 id="controls-heading">Plan a journey</h2>

      <div className="field">
        <label htmlFor="origin">Start point</label>
        <select
          id="origin"
          value={form.originId}
          onChange={(event) => {
            onChange({ originId: event.target.value });
          }}
        >
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="destination">Destination</label>
        <select
          id="destination"
          value={form.destinationId}
          onChange={(event) => {
            onChange({ destinationId: event.target.value });
          }}
        >
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="field">
        <legend>Mobility profile</legend>
        <select
          id="profile"
          aria-label="Mobility profile"
          value={form.profile}
          onChange={(event) => {
            onChange({ profile: event.target.value as MobilityProfile });
          }}
        >
          {profiles.map((profile) => (
            <option key={profile} value={profile}>
              {PROFILE_LABELS[profile]}
            </option>
          ))}
        </select>
      </fieldset>

      <div className="field">
        <label htmlFor="time">Arrival time — {minuteToClock(form.minuteOfDay)}</label>
        <input
          id="time"
          type="range"
          min={TIME_MIN}
          max={TIME_MAX}
          step={TIME_STEP}
          value={form.minuteOfDay}
          onChange={(event) => {
            onChange({ minuteOfDay: Number(event.target.value) });
          }}
        />
        <span className="hint">Crowd density is sampled for this kickoff time.</span>
      </div>

      <div className="field">
        <label htmlFor="locale">Narration language</label>
        <select
          id="locale"
          value={form.locale}
          onChange={(event) => {
            onChange({ locale: event.target.value });
          }}
        >
          {locales.map((locale) => (
            <option key={locale} value={locale}>
              {localeName(locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="dataset">Crowd dataset</label>
        <select
          id="dataset"
          value={form.datasetId}
          onChange={(event) => {
            onChange({ datasetId: event.target.value });
          }}
        >
          {datasets.map((dataset) => (
            <option key={dataset.id} value={dataset.id}>
              {dataset.label} ({dataset.sampleCount})
            </option>
          ))}
        </select>
      </div>

      <div className="btn-row">
        <button className="btn" type="submit" disabled={pending}>
          Find the calm route
        </button>
        <button className="btn secondary" type="button" disabled={pending} onClick={onNarrate}>
          Narrate in my language
        </button>
      </div>
    </form>
  );
}

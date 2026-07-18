import type { ReactElement } from 'react';

import type { RouteResult } from '@/core/types';
import { crowdLevelFor } from '@/core/crowd';
import { CROWD_LABELS, PROFILE_LABELS } from '@/lib/labels';

/** At-a-glance journey statistics for a computed route. */
export function JourneySummary({ route }: { readonly route: RouteResult }): ReactElement {
  const busiest = CROWD_LABELS[crowdLevelFor(route.maxDensity)];
  return (
    <ul className="summary-grid" aria-label="Journey summary">
      <li className="stat">
        <div className="value">{route.totalDistanceMeters} m</div>
        <div className="label">Walking distance</div>
      </li>
      <li className="stat">
        <div className="value">{route.estimatedMinutes} min</div>
        <div className="label">Estimated time</div>
      </li>
      <li className="stat">
        <div className="value">{busiest}</div>
        <div className="label">Busiest segment</div>
      </li>
      <li className="stat">
        <div className="value">{PROFILE_LABELS[route.profile]}</div>
        <div className="label">Mobility profile</div>
      </li>
    </ul>
  );
}

import type { ReactElement } from 'react';

import type { NarrationPayload } from '@/lib/api';

interface NarrationPanelProps {
  readonly narration: NarrationPayload['narration'] | null;
  readonly rtl: boolean;
  readonly pending: boolean;
}

function sourceLabel(narration: NarrationPayload['narration'] | null): string {
  if (narration === null) {
    return '';
  }
  return narration.source === 'model'
    ? 'Narrated by the Gemini model'
    : 'Deterministic offline narration';
}

function NarrationBody({
  pending,
  narration,
}: {
  readonly pending: boolean;
  readonly narration: NarrationPayload['narration'] | null;
}): ReactElement {
  if (pending) {
    return <p>Preparing your directions…</p>;
  }
  if (narration !== null) {
    return <p>{narration.text}</p>;
  }
  return <p className="hint">Plan a route, then request narration in your language.</p>;
}

/** Live region rendering the AI (or fallback) narration in the chosen locale. */
export function NarrationPanel({ narration, rtl, pending }: NarrationPanelProps): ReactElement {
  const showSource = narration !== null && !pending;
  return (
    <div className="narration" aria-live="polite" aria-busy={pending} dir={rtl ? 'rtl' : 'ltr'}>
      <NarrationBody pending={pending} narration={narration} />
      {showSource ? <span className="source">{sourceLabel(narration)}</span> : null}
    </div>
  );
}

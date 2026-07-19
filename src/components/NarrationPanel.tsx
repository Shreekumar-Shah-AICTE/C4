import type { ReactElement } from 'react';

import type { NarrationPayload } from '@/lib/api';

type Narration = NarrationPayload['narration'] | null;

interface NarrationPanelProps {
  readonly narration: Narration;
  readonly rtl: boolean;
  readonly pending: boolean;
}

/**
 * The BCP-47 language tag of the *rendered* narration text. Only model output is
 * actually in the requested locale; the deterministic fallback is always English
 * (see {@link fallbackNarration}), so tagging it with the requested locale would
 * mislabel English prose. Returns `'en'` for the fallback and placeholder text.
 */
function textLanguage(narration: Narration): string {
  return narration !== null && narration.source === 'model' ? narration.locale : 'en';
}

function sourceLabel(narration: Narration): string {
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
  readonly narration: Narration;
}): ReactElement {
  if (pending) {
    return <p>Preparing your directions…</p>;
  }
  if (narration !== null) {
    // Mark the language of this part (WCAG 3.1.2 Language of Parts) so assistive
    // tech switches voice/pronunciation to the narration's true language. The
    // enclosing region already sets text direction.
    return <p lang={textLanguage(narration)}>{narration.text}</p>;
  }
  return <p className="hint">Plan a route, then request narration in your language.</p>;
}

/** Live region rendering the AI (or fallback) narration in the chosen locale. */
export function NarrationPanel({ narration, rtl, pending }: NarrationPanelProps): ReactElement {
  const showSource = narration !== null && !pending;
  // Right-to-left layout applies only to genuine model output in an RTL locale;
  // the English fallback must stay left-to-right even for an RTL selection.
  const isRtlText = rtl && narration !== null && narration.source === 'model';
  return (
    <div
      className="narration"
      aria-live="polite"
      aria-busy={pending}
      dir={isRtlText ? 'rtl' : 'ltr'}
    >
      <NarrationBody pending={pending} narration={narration} />
      {showSource ? (
        <span className="source" lang="en">
          {sourceLabel(narration)}
        </span>
      ) : null}
    </div>
  );
}

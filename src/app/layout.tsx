import type { Metadata, Viewport } from 'next';
import type { ReactElement, ReactNode } from 'react';

import './globals.css';

// A per-request CSP nonce requires dynamic rendering so Next.js can stamp the
// nonce onto its (external and inline) hydration scripts.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Wayfare — calm, step-free stadium routing',
  description:
    'Accessible, crowd-aware indoor wayfinding that guides football fans to their seat by the calmest, step-free route — and narrates it in their language.',
};

export const viewport: Viewport = {
  themeColor: '#07140d',
  width: 'device-width',
  initialScale: 1,
};

/** Root document shell. Locale direction is applied client-side per selection. */
export default function RootLayout({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import { metadataHandler } from '@/server/handlers';
import { guard, toResponse } from '@/server/next-adapter';
import { runHandler } from '@/server/respond';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/metadata — graph, datasets, and locale metadata for the UI. */
export async function GET(request: Request): Promise<Response> {
  const result = await runHandler(() => {
    guard(request);
    return metadataHandler();
  });
  return toResponse(result);
}

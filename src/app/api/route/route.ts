import { planRouteHandler } from '@/server/handlers';
import { guard, toResponse } from '@/server/next-adapter';
import { readJson, runHandler } from '@/server/respond';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/route — computes a crowd- and accessibility-aware route. */
export async function POST(request: Request): Promise<Response> {
  const result = await runHandler(async () => {
    guard(request);
    return planRouteHandler(await readJson(request));
  });
  return toResponse(result);
}

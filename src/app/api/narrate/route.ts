import { narrateHandler } from '@/server/handlers';
import { guard, toResponse } from '@/server/next-adapter';
import { readJson, runHandler } from '@/server/respond';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/narrate — recomputes a route and narrates it in a locale. */
export async function POST(request: Request): Promise<Response> {
  const result = await runHandler(async () => {
    guard(request);
    return narrateHandler(await readJson(request));
  });
  return toResponse(result);
}

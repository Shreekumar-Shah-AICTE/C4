import { ingestCsvHandler, ingestJsonHandler } from '@/server/handlers';
import { guard, toResponse } from '@/server/next-adapter';
import { readJson, runHandler } from '@/server/respond';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JSON_CONTENT_TYPE = 'application/json';

/** POST /api/ingest — registers an uploaded crowd dataset (CSV or JSON). */
export async function POST(request: Request): Promise<Response> {
  const result = await runHandler(async () => {
    guard(request);
    const label = new URL(request.url).searchParams.get('label') ?? '';
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes(JSON_CONTENT_TYPE)) {
      return ingestJsonHandler(await readJson(request), label);
    }
    return ingestCsvHandler(await request.text(), label);
  });
  return toResponse(result);
}

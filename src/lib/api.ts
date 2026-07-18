/**
 * Typed browser-side API client.
 *
 * Every call returns typed data or throws an {@link ApiError} carrying the
 * server's stable error code and message, so the UI can render honest, specific
 * feedback instead of a generic failure.
 */

import type {
  MobilityProfile,
  NavigationStep,
  RouteResult,
  StadiumEdge,
  StadiumNode,
} from '@/core/types';

/** One graph edge annotated with its crowd density at a chosen time. */
export interface EdgeHeat {
  readonly from: string;
  readonly to: string;
  readonly density: number;
}

/** Response of the route-planning endpoint. */
export interface RoutePayload {
  readonly datasetId: string;
  readonly route: RouteResult;
  readonly steps: readonly NavigationStep[];
  readonly heat: readonly EdgeHeat[];
}

/** A stored crowd dataset summary. */
export interface DatasetSummary {
  readonly id: string;
  readonly label: string;
  readonly sampleCount: number;
}

/** Bootstrapping metadata for the UI. */
export interface MetadataPayload {
  readonly graph: {
    readonly nodes: readonly StadiumNode[];
    readonly edges: readonly StadiumEdge[];
  };
  readonly datasets: readonly DatasetSummary[];
  readonly profiles: readonly MobilityProfile[];
  readonly locales: readonly string[];
  readonly rtlLocales: readonly string[];
  readonly demo: {
    readonly originId: string;
    readonly destinationId: string;
    readonly minuteOfDay: number;
  };
}

/** Narration outcome plus provenance. */
export interface NarrationPayload {
  readonly narration: {
    readonly text: string;
    readonly source: 'model' | 'fallback';
    readonly locale: string;
  };
  readonly rtl: boolean;
  readonly route: RouteResult;
  readonly steps: readonly NavigationStep[];
}

/** A parsed API error with the server's stable code. */
export class ApiError extends Error {
  public constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorEnvelope {
  readonly error?: { readonly code?: string; readonly message?: string };
}

async function parseError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => ({}))) as ErrorEnvelope;
  const code = body.error?.code ?? 'request_failed';
  const message = body.error?.message ?? `Request failed with status ${response.status}.`;
  return new ApiError(code, message);
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as T;
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Loads bootstrapping metadata. */
export function fetchMetadata(): Promise<MetadataPayload> {
  return request<MetadataPayload>('/api/metadata');
}

/** Requests a planned route for the given query. */
export function planRoute(query: {
  originId: string;
  destinationId: string;
  profile: MobilityProfile;
  minuteOfDay: number;
  datasetId?: string;
}): Promise<RoutePayload> {
  return postJson<RoutePayload>('/api/route', {
    originId: query.originId,
    destinationId: query.destinationId,
    profile: query.profile,
    minuteOfDay: query.minuteOfDay,
    datasetId: query.datasetId,
  });
}

/** Requests localized narration for a route query. */
export function narrateRouteRequest(query: {
  originId: string;
  destinationId: string;
  profile: MobilityProfile;
  minuteOfDay: number;
  datasetId?: string;
  locale: string;
}): Promise<NarrationPayload> {
  return postJson<NarrationPayload>('/api/narrate', {
    originId: query.originId,
    destinationId: query.destinationId,
    profile: query.profile,
    minuteOfDay: query.minuteOfDay,
    datasetId: query.datasetId,
    locale: query.locale,
  });
}

/** Uploads a crowd dataset (CSV text or JSON) and returns its summary. */
export function uploadDataset(
  content: string,
  format: 'csv' | 'json',
  label: string,
): Promise<DatasetSummary> {
  const contentType = format === 'json' ? 'application/json' : 'text/csv';
  return request<DatasetSummary>(`/api/ingest?label=${encodeURIComponent(label)}`, {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: content,
  });
}

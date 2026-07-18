import type { MobilityProfile } from '@/core/types';

/** Editable route query bound to the control form. */
export interface RouteForm {
  originId: string;
  destinationId: string;
  profile: MobilityProfile;
  minuteOfDay: number;
  locale: string;
  datasetId: string;
}

/** A user-facing status message with a semantic tone. */
export interface Status {
  readonly tone: 'success' | 'error';
  readonly message: string;
}

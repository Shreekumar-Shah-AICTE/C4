/**
 * Display labels and small formatting helpers shared across UI components.
 */

import type { CrowdLevel, MobilityProfile } from '@/core/types';

const MINUTES_PER_HOUR = 60;
const PAD_WIDTH = 2;

/** Human-friendly names for each mobility profile. */
export const PROFILE_LABELS: Record<MobilityProfile, string> = {
  standard: 'Standard',
  stepFree: 'Step-free',
  wheelchair: 'Wheelchair',
  lowSensory: 'Low-sensory',
};

/** Human-friendly names for each supported locale code. */
const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  hi: 'हिन्दी',
  ar: 'العربية',
  he: 'עברית',
};

/** Human-friendly crowd-level names (paired with an icon, never colour alone). */
export const CROWD_LABELS: Record<CrowdLevel, string> = {
  calm: 'Calm',
  moderate: 'Moderate',
  busy: 'Busy',
  congested: 'Congested',
};

/** Text glyph accompanying each crowd level so meaning is not colour-only. */
export const CROWD_ICONS: Record<CrowdLevel, string> = {
  calm: '●',
  moderate: '◐',
  busy: '◑',
  congested: '◕',
};

/** Formats a minute-of-day as a zero-padded 24-hour clock string. */
export function minuteToClock(minute: number): string {
  const hours = Math.floor(minute / MINUTES_PER_HOUR);
  const minutes = minute % MINUTES_PER_HOUR;
  return `${String(hours).padStart(PAD_WIDTH, '0')}:${String(minutes).padStart(PAD_WIDTH, '0')}`;
}

/** Readable locale name, falling back to the raw code when unknown. */
export function localeName(code: string): string {
  return LOCALE_LABELS[code] ?? code;
}

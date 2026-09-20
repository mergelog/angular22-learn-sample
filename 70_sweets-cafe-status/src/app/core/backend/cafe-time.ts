const JST_OFFSET_MS = 9 * 60 * 60 * 1_000;

/**
 * Converts an instant to the ISO 8601 representation used by the cafe backend.
 * Japan Standard Time has a fixed UTC+09:00 offset and does not observe daylight saving time.
 */
export function toJstIso(timestamp: number): string {
  return new Date(timestamp + JST_OFFSET_MS).toISOString().replace('Z', '+09:00');
}

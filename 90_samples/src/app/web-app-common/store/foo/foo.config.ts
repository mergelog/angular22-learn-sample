import { InjectionToken } from '@angular/core';

export const FOO_POLLING_INTERVAL_MS = new InjectionToken<number>('FOO_POLLING_INTERVAL_MS', {
  factory: () => 3_000,
});

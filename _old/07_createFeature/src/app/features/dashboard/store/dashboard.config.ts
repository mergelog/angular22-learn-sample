import { InjectionToken } from '@angular/core';

export const DASHBOARD_POLLING_INTERVAL_MS = new InjectionToken<number>(
  'DASHBOARD_POLLING_INTERVAL_MS',
  {
    factory: () => 5_000,
  },
);

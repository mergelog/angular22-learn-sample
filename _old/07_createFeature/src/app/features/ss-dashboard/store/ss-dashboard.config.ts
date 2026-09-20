import { InjectionToken } from '@angular/core';

export const SS_DASHBOARD_POLLING_INTERVAL_MS = new InjectionToken<number>(
  'SS_DASHBOARD_POLLING_INTERVAL_MS',
  {
    factory: () => 5_000,
  },
);

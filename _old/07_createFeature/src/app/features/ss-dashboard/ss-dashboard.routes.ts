import { Routes } from '@angular/router';

import { SsDashboardApi } from './data-access/ss-dashboard.api';
import { SsDashboardStore } from './store/ss-dashboard.store';

export const SS_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [SsDashboardApi, SsDashboardStore],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/main-board/ss-main-board').then((m) => m.SsMainBoard),
      },
      {
        path: 'sub-board',
        loadComponent: () => import('./pages/sub-board/ss-sub-board').then((m) => m.SsSubBoard),
      },
    ],
  },
];

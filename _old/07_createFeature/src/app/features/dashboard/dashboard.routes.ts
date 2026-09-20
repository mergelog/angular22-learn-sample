import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { DashboardApi } from './data-access/dashboard.api';
import { DashboardService } from './data-access/dashboard.service';
import { DashboardEffects } from './store/dashboard.effects';
import { dashboardFeature } from './store/dashboard.reducer';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [
      DashboardApi,
      DashboardService,
      provideState(dashboardFeature),
      provideEffects(DashboardEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/main-board/main-board').then((m) => m.MainBoard),
      },
      {
        path: 'sub-board',
        loadComponent: () => import('./pages/sub-board/sub-board').then((m) => m.SubBoard),
      },
    ],
  },
];

import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { CafeStatusEffects } from './feature/cafe-status/state/cafe-status.effects';
import {
  CAFE_STATUS_FEATURE_KEY,
  cafeStatusReducer,
} from './feature/cafe-status/state/cafe-status.reducer';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./feature/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard',
  },
  {
    path: 'view-json',
    loadComponent: () => import('./feature/view-json/view-json').then((m) => m.ViewJson),
    title: 'Sweets Cafe Status',
  },
  {
    path: 'cafe-status',
    loadComponent: () =>
      import('./webapp-common/cafe-tables/cafe-tables').then((m) => m.CafeTables),
    providers: [
      provideState(CAFE_STATUS_FEATURE_KEY, cafeStatusReducer),
      provideEffects(CafeStatusEffects),
    ],
    title: 'Cafe Tables',
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

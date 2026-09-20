import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'ss-dashboard',
    loadChildren: () =>
      import('./features/ss-dashboard/ss-dashboard.routes').then((m) => m.SS_DASHBOARD_ROUTES),
  },
  {
    path: 'details',
    loadChildren: () => import('./features/details/details.routes').then((m) => m.DETAILS_ROUTES),
  },
  {
    path: 'samples',
    loadChildren: () => import('./features/samples/samples.routes').then((m) => m.SAMPLES_ROUTES),
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

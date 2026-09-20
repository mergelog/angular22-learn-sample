import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./feature/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'p00-ngrx',
    loadChildren: () => import('./feature/p00-ngrx/p00-ngrx.routes').then((m) => m.P00_NGRX_ROUTES),
  },
  {
    path: 'p01-signals',
    loadChildren: () =>
      import('./feature/p01-signals/p01-signals.routes').then((m) => m.P01_SIGNALS_ROUTES),
  },
  {
    path: 'p02-ngrx-http',
    loadChildren: () =>
      import('./feature/p02-ngrx-http/p02-ngrx-http.routes').then((m) => m.P02_NGRX_HTTP_ROUTES),
  },
  {
    path: 'p03-compo',
    loadChildren: () =>
      import('./feature/p03-compo/p03-compo.routes').then((m) => m.P03_COMPO_ROUTES),
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

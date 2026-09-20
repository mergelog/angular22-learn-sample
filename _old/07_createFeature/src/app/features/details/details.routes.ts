import { Routes } from '@angular/router';

export const DETAILS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history').then((m) => m.History),
  },
];

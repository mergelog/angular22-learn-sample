import { Routes } from '@angular/router';

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

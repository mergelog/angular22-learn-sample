import { Routes } from '@angular/router';

export const P04_STORE_ROUTES: Routes = [
  {
    path: 'learn-01-cva',
    loadComponent: () => import('./learn-01-cva/learn-01-cva').then((m) => m.Learn01Cva),
  },
  {
    path: 'learn-02-with-latest-from',
    loadComponent: () =>
      import('./learn-02-with-latest-from/learn-02-with-latest-from').then(
        (m) => m.Learn02WithLatestFrom,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'learn-01-cva',
  },
];

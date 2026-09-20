import { Routes } from '@angular/router';
import { aSampleFeature } from './a-sample.store';
import { provideState } from '@ngrx/store';

export const SAMPLES_ROUTES: Routes = [
  {
    path: 'a-sample',
    providers: [provideState(aSampleFeature)],
    loadComponent: () => import('./a-sample/a-sample').then((m) => m.ASample),
    children: [
      
    ]
  },
  {
    path: 'b-sample',
    loadComponent: () => import('./b-sample/b-sample').then((m) => m.BSample),
  },
];

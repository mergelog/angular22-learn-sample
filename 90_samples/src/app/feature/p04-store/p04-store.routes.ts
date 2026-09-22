import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import {
  DispatchFalseTracker,
  trackDispatchFalseRun,
} from './learn-04-dispatch-false/dispatch-false.effect';
import { signalComparisonFeature } from './learn-03-store-select-signal-to-signal/comparison.store';

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
    path: 'learn-03-store-select-signal-to-signal',
    providers: [provideState(signalComparisonFeature)],
    loadComponent: () =>
      import('./learn-03-store-select-signal-to-signal/learn-03-store-select-signal-to-signal').then(
        (m) => m.Learn03StoreSelectSignalToSignal,
      ),
  },
  {
    path: 'learn-04-dispatch-false',
    providers: [DispatchFalseTracker, provideEffects({ trackDispatchFalseRun })],
    loadComponent: () =>
      import('./learn-04-dispatch-false/learn-04-dispatch-false').then(
        (m) => m.Learn04DispatchFalse,
      ),
  },
  {
    path: 'learn-05-new-subscription',
    loadComponent: () =>
      import('./learn-05-new-subscription/learn-05-new-subscription').then(
        (m) => m.Learn05NewSubscription,
      ),
  },
  {
    path: 'learn-06-debounce-time-debounce',
    loadComponent: () =>
      import('./learn-06-debounce-time-debounce/learn-06-debounce-time-debounce').then(
        (m) => m.Learn06DebounceTimeDebounce,
      ),
  },
  {
    path: 'learn-07-signal-debounce',
    loadComponent: () =>
      import('./learn-07-signal-debounce/learn-07-signal-debounce').then(
        (m) => m.Learn07SignalDebounce,
      ),
  },
  {
    path: 'learn-08-distinct-until-changed',
    loadComponent: () =>
      import('./learn-08-distinct-until-changed/learn-08-distinct-until-changed').then(
        (m) => m.Learn08DistinctUntilChanged,
      ),
  },
  {
    path: 'learn-09-distinct-until-key-changed',
    loadComponent: () =>
      import('./learn-09-distinct-until-key-changed/learn-09-distinct-until-key-changed').then(
        (m) => m.Learn09DistinctUntilKeyChanged,
      ),
  },
  {
    path: 'learn-10-computed',
    loadComponent: () =>
      import('./learn-10-computed/learn-10-computed').then((m) => m.Learn10Computed),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'learn-01-cva',
  },
];

import { Routes } from '@angular/router';

export const P01_SIGNALS_ROUTES: Routes = [
  {
    path: 'sample-02-computed',
    loadComponent: () =>
      import('./sample-02-computed/sample-02-computed').then((m) => m.Sample02Computed),
  },
  {
    path: 'sample-03-effect',
    loadComponent: () =>
      import('./sample-03-effect/sample-03-effect').then((m) => m.Sample03Effect),
  },
  {
    path: 'sample-04-input',
    loadComponent: () => import('./sample-04-input/sample-04-input').then((m) => m.Sample04Input),
  },
  {
    path: 'sample-05-input-transform',
    loadComponent: () =>
      import('./sample-05-input-transform/sample-05-input-transform').then(
        (m) => m.Sample05InputTransform,
      ),
  },
  {
    path: 'sample-06-output',
    loadComponent: () =>
      import('./sample-06-output/sample-06-output').then((m) => m.Sample06Output),
  },
  {
    path: 'sample-07-model',
    loadComponent: () => import('./sample-07-model/sample-07-model').then((m) => m.Sample07Model),
  },
  {
    path: 'sample-08-query',
    loadComponent: () => import('./sample-08-query/sample-08-query').then((m) => m.Sample08Query),
  },
  {
    path: 'sample-09-rxjs-interop',
    loadComponent: () =>
      import('./sample-09-rxjs-interop/sample-09-rxjs-interop').then((m) => m.Sample09RxjsInterop),
  },
  {
    path: 'sample-10-linked-signal',
    loadComponent: () =>
      import('./sample-10-linked-signal/sample-10-linked-signal').then(
        (m) => m.Sample10LinkedSignal,
      ),
  },
  {
    path: 'sample-11-resource',
    loadComponent: () =>
      import('./sample-11-resource/sample-11-resource').then((m) => m.Sample11Resource),
  },
  {
    path: 'sample-12-router-input',
    loadComponent: () =>
      import('./sample-12-router-input/sample-12-router-input').then((m) => m.Sample12RouterInput),
  },
  {
    path: 'sample-12-router-input/:lessonId',
    loadComponent: () =>
      import('./sample-12-router-input/sample-12-router-input').then((m) => m.Sample12RouterInput),
  },
  {
    path: 'sample-13-signal-store-state',
    loadComponent: () =>
      import('./sample-13-signal-store-state/sample-13-signal-store-state').then(
        (m) => m.Sample13SignalStoreState,
      ),
  },
  {
    path: 'sample-14-signal-store-methods',
    loadComponent: () =>
      import('./sample-14-signal-store-methods/sample-14-signal-store-methods').then(
        (m) => m.Sample14SignalStoreMethods,
      ),
  },
  {
    path: 'sample-15-signal-store-hooks',
    loadComponent: () =>
      import('./sample-15-signal-store-hooks/sample-15-signal-store-hooks').then(
        (m) => m.Sample15SignalStoreHooks,
      ),
  },
  {
    path: 'sample-16-untracked',
    loadComponent: () =>
      import('./sample-16-untracked/sample-16-untracked').then((m) => m.Sample16Untracked),
  },
  {
    path: 'sample-17-multiple-queries',
    loadComponent: () =>
      import('./sample-17-multiple-queries/sample-17-multiple-queries').then(
        (m) => m.Sample17MultipleQueries,
      ),
  },
  {
    path: 'sample-18-readonly',
    loadComponent: () =>
      import('./sample-18-readonly/sample-18-readonly').then((m) => m.Sample18Readonly),
  },
  {
    path: 'sample-19-effect-cleanup',
    loadComponent: () =>
      import('./sample-19-effect-cleanup/sample-19-effect-cleanup').then(
        (m) => m.Sample19EffectCleanup,
      ),
  },
  {
    path: 'sample-20-output-observable',
    loadComponent: () =>
      import('./sample-20-output-observable/sample-20-output-observable').then(
        (m) => m.Sample20OutputObservable,
      ),
  },
  {
    path: 'sample-21-injection-context',
    loadComponent: () =>
      import('./sample-21-injection-context/sample-21-injection-context').then(
        (m) => m.Sample21InjectionContext,
      ),
  },
  {
    path: 'sample-22-ok-view-child',
    loadComponent: () =>
      import('./sample-22-ok-view-child/sample-22-ok-view-child').then(
        (m) => m.Sample22OkViewChild,
      ),
  },
  {
    path: 'sample-22-ng-view-child',
    loadComponent: () =>
      import('./sample-22-ng-view-child/sample-22-ng-view-child').then(
        (m) => m.Sample22NgViewChild,
      ),
  },
  {
    path: 'sample-01-signal',
    loadComponent: () =>
      import('./sample-01-signal/sample-01-signal').then((m) => m.Sample01Signal),
  },
  {
    path: 'canvas',
    loadComponent: () => import('./canvas/p01-canvas').then((m) => m.P01Canvas),
  },
  {
    path: 'computed',
    loadComponent: () => import('./computed/p01-computed').then((m) => m.P01Computed),
  },
  {
    path: 'novice',
    loadComponent: () => import('./novice/p01-novice').then((m) => m.P01Novice),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'novice',
  },
];

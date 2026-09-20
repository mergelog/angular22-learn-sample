import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { changeNameStatus, p00CanvasFeature } from './store/p00.canvas.store';
import { provideEffects } from '@ngrx/effects';
import { P00_EVO_FEATURE_KEY, p00EvoReducer } from './store/p00.evo.store';
import { P00_NOVICE_FEATURE_KEY, p00NoviceReducer } from './store/P00.novice.store';
import {
  P00_STORE_BRIDGE_FEATURE_KEY,
  storeBridgeReducer,
} from './sample-09-store-bridge/store/store-bridge.store';

export const P00_NGRX_ROUTES: Routes = [
  {
    path: 'canvas',
    providers: [
      provideState(p00CanvasFeature),
      provideEffects({ changeNumStatus: changeNameStatus }),
    ],
    loadComponent: () => import('./canvas/p00-canvas').then((m) => m.P00Canvas),
  },
  {
    path: 'evolution',
    providers: [provideState(P00_EVO_FEATURE_KEY, p00EvoReducer)],
    loadComponent: () => import('./evolution/p00-evolution').then((m) => m.P00Evolution),
  },
  {
    path: 'novice',
    providers: [provideState(P00_NOVICE_FEATURE_KEY, p00NoviceReducer)],
    loadComponent: () => import('./novice/p00-novice').then((m) => m.P00Novice),
  },
  {
    path: 'sample-01-in-out',
    loadComponent: () => import('./sample-01-in-out/sample-01-in-out').then((m) => m.Sample01InOut),
  },
  {
    path: 'sample-02-standalone',
    loadComponent: () =>
      import('./sample-02-standalone/sample-02-standalone').then((m) => m.Sample02Standalone),
  },
  {
    path: 'sample-03-view-child',
    loadComponent: () =>
      import('./sample-03-view-child/sample-03-view-child').then((m) => m.Sample03ViewChild),
  },
  {
    path: 'sample-04-control-flow',
    loadComponent: () =>
      import('./sample-04-control-flow/sample-04-control-flow').then((m) => m.Sample04ControlFlow),
  },
  {
    path: 'sample-05-content-projection',
    loadComponent: () =>
      import('./sample-05-content-projection/sample-05-content-projection').then(
        (m) => m.Sample05ContentProjection,
      ),
  },
  {
    path: 'sample-05-content-projection-class',
    loadComponent: () =>
      import('./sample-05-content-projection-class/sample-05-content-projection-class').then(
        (m) => m.Sample05ContentProjectionClass,
      ),
  },
  {
    path: 'sample-06-template-outlet',
    loadComponent: () =>
      import('./sample-06-template-outlet/sample-06-template-outlet').then(
        (m) => m.Sample06TemplateOutlet,
      ),
  },
  {
    path: 'sample-06-template-outlet-basic',
    loadComponent: () =>
      import('./sample-06-template-outlet-basic/sample-06-template-outlet-basic').then(
        (m) => m.Sample06TemplateOutletBasic,
      ),
  },
  {
    path: 'sample-06-template-outlet-medium',
    loadComponent: () =>
      import('./sample-06-template-outlet-medium/sample-06-template-outlet-medium').then(
        (m) => m.Sample06TemplateOutletMedium,
      ),
  },
  {
    path: 'sample-07-inheritance',
    loadComponent: () =>
      import('./sample-07-inheritance/sample-07-inheritance').then((m) => m.Sample07Inheritance),
  },
  {
    path: 'sample-08-content-children',
    loadComponent: () =>
      import('./sample-08-content-children/sample-08-content-children').then(
        (m) => m.Sample08ContentChildren,
      ),
  },
  {
    path: 'sample-09-store-bridge',
    providers: [provideState(P00_STORE_BRIDGE_FEATURE_KEY, storeBridgeReducer)],
    loadComponent: () =>
      import('./sample-09-store-bridge/sample-09-store-bridge').then((m) => m.Sample09StoreBridge),
  },
  {
    path: 'sample-10-material-overlay',
    loadComponent: () =>
      import('./sample-10-material-overlay/sample-10-material-overlay').then(
        (m) => m.Sample10MaterialOverlay,
      ),
  },
  {
    path: 'sample-11-router',
    // [■観点:loadComponent] 親画面も Route が選ばれたときに遅延読み込みする。
    loadComponent: () =>
      import('./sample-11-router/sample-11-router').then((m) => m.Sample11Router),
    children: [
      {
        path: 'overview',
        // [■観点:子Route] 親の router-outlet に表示する Component を遅延読み込みする。
        loadComponent: () =>
          import('./sample-11-router/children/router-overview/router-overview').then(
            (m) => m.RouterOverview,
          ),
      },
      {
        path: 'detail',
        loadComponent: () =>
          import('./sample-11-router/children/router-detail/router-detail').then(
            (m) => m.RouterDetail,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
    ],
  },
  {
    path: 'sample-12-provider-scope',
    loadComponent: () =>
      import('./sample-12-provider-scope/sample-12-provider-scope').then(
        (m) => m.Sample12ProviderScope,
      ),
  },
  {
    path: 'sample-13-cva',
    loadComponent: () => import('./sample-13-cva/sample-13-cva').then((m) => m.Sample13Cva),
  },
  {
    path: 'sample-14-export-as',
    loadComponent: () =>
      import('./sample-14-export-as/sample-14-export-as').then((m) => m.Sample14ExportAs),
  },
  {
    path: 'sample-15-dynamic-view',
    loadComponent: () =>
      import('./sample-15-dynamic-view/sample-15-dynamic-view').then((m) => m.Sample15DynamicView),
  },
  {
    path: 'sample-16-frame-events',
    loadComponent: () =>
      import('./sample-16-frame-events/sample-16-frame-events').then((m) => m.Sample16FrameEvents),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'novice',
  },
];

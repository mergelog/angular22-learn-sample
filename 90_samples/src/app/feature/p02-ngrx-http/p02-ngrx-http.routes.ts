import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { FooApi } from '../../web-app-common/store/foo/foo.api';
import { FooEffects } from '../../web-app-common/store/foo/foo.effects';
import { fooFeature } from '../../web-app-common/store/foo/foo.reducer';
import { FooService } from '../../web-app-common/store/foo/foo.service';

export const P02_NGRX_HTTP_ROUTES: Routes = [
  {
    path: 'listing-foo',
    providers: [FooApi, FooService, provideState(fooFeature), provideEffects(FooEffects)],
    loadComponent: () => import('./listing-foo/listing-foo').then((m) => m.ListingFoo),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'listing-foo',
  },
];

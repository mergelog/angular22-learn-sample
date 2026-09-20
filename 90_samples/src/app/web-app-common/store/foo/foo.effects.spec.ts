import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideEffects } from '@ngrx/effects';
import { Store, provideState, provideStore } from '@ngrx/store';
import { filter, firstValueFrom } from 'rxjs';

import { fooBackendInterceptor } from '../../../feature/p02-ngrx-http/mod-httpInterceptorFn/foo-backend.interceptor';
import { FooActions } from './foo.actions';
import { FooApi } from './foo.api';
import { FooEffects } from './foo.effects';
import { fooFeature } from './foo.reducer';
import { FooSelectors } from './foo.selectors';

describe('FooEffects', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([fooBackendInterceptor])),
        provideStore(),
        provideState(fooFeature),
        provideEffects(FooEffects),
        FooApi,
      ],
    });
  });

  it('pollingStarted でスタブバックエンドから取得した一覧が store に載る', async () => {
    const store = TestBed.inject(Store);

    store.dispatch(FooActions.pollingStarted());

    const items = await firstValueFrom(
      store.select(FooSelectors.selectItems).pipe(filter((current) => current.length > 0)),
    );

    store.dispatch(FooActions.pollingStopped());

    expect(items).toHaveLength(3);
    expect(items[0].fooId).toBe('foo-001');
  });
});

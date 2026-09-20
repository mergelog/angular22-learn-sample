import { DestroyRef, Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { FooActions } from './foo.actions';
import { FooSelectors } from './foo.selectors';

/** listing-foo から Store を直接触らせないためのファサード */
@Injectable()
export class FooService {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);

  readonly viewModel$ = this.store.select(FooSelectors.selectViewModel);

  constructor() {
    this.store.dispatch(FooActions.pollingStarted());

    this.destroyRef.onDestroy(() => {
      this.store.dispatch(FooActions.pollingStopped());
    });
  }

  refresh(): void {
    this.store.dispatch(FooActions.loadRequested());
  }
}

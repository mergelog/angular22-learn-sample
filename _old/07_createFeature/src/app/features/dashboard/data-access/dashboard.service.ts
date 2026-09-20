import { DestroyRef, Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { DashboardActions } from '../store/dashboard.actions';
import { DashboardSelectors } from '../store/dashboard.selectors';

@Injectable()
export class DashboardService {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);

  readonly viewModel$ = this.store.select(DashboardSelectors.selectViewModel);

  constructor() {
    this.store.dispatch(DashboardActions.pollingStarted());

    this.destroyRef.onDestroy(() => {
      this.store.dispatch(DashboardActions.pollingStopped());
    });
  }

  refresh(): void {
    this.store.dispatch(DashboardActions.loadRequested());
  }
}

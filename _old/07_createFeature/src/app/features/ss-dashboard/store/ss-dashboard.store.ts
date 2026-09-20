import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  EMPTY,
  Subscription,
  catchError,
  exhaustMap,
  map,
  pipe,
  tap,
  timer,
} from 'rxjs';

import { SsDashboardApi } from '../data-access/ss-dashboard.api';
import { mapSsDashboardResponse } from '../data-access/ss-dashboard.mapper';
import type { SsLot } from '../data-access/ss-dashboard.model';
import { SS_DASHBOARD_POLLING_INTERVAL_MS } from './ss-dashboard.config';

interface SsDashboardState {
  items: readonly SsLot[];
  loading: boolean;
  error: string | null;
}

type DashboardLoadReason = 'manual' | 'polling';

const initialState: SsDashboardState = {
  items: [],
  loading: false,
  error: null,
};

/**
 * Dashboard の NgRx Store / Effects 実装と比較するための Signal Store 実装。
 * Route provider として登録し、Dashboard feature 内だけで状態を共有する。
 */
export const SsDashboardStore = signalStore(
  withState(initialState),
  withComputed(({ items, loading, error }) => ({
    viewModel: computed(() => ({
      items: items(),
      loading: loading(),
      error: error(),
    })),
  })),
  withMethods((store, dashboardApi = inject(SsDashboardApi)) => {
    const loadDashboard = rxMethod<DashboardLoadReason>(
      pipe(
        // 取得中の手動更新・ポーリング要求は捨て、HTTP リクエストを重複させない。
        exhaustMap(() => {
          patchState(store, { loading: true, error: null });

          return dashboardApi.getDashboard().pipe(
            map(mapSsDashboardResponse),
            tap(({ items }) => patchState(store, { items, loading: false, error: null })),
            catchError((error: unknown) => {
              patchState(store, {
                loading: false,
                error: getErrorMessage(error),
              });

              return EMPTY;
            }),
          );
        }),
      ),
    );

    return {
      loadDashboard,
      refresh(): void {
        loadDashboard('manual');
      },
    };
  }),
  withHooks((store) => {
    const pollingIntervalMs = inject(SS_DASHBOARD_POLLING_INTERVAL_MS);
    let pollingSubscription: Subscription | undefined;

    return {
      onInit(): void {
        pollingSubscription = timer(0, pollingIntervalMs).subscribe(() => {
          store.loadDashboard('polling');
        });
      },
      onDestroy(): void {
        pollingSubscription?.unsubscribe();
      },
    };
  }),
);

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Failed to load dashboard.';
}

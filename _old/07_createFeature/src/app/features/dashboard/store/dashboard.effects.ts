import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, takeUntil, timer } from 'rxjs';

import { DashboardApi } from '../data-access/dashboard.api';
import { mapDashboardResponse } from '../data-access/dashboard.mapper';
import { DashboardActions } from './dashboard.actions';
import { DASHBOARD_POLLING_INTERVAL_MS } from './dashboard.config';

@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly dashboardApi = inject(DashboardApi);
  private readonly pollingIntervalMs = inject(DASHBOARD_POLLING_INTERVAL_MS);

  readonly startPolling$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.pollingStarted),
      switchMap(() =>
        timer(0, this.pollingIntervalMs).pipe(
          map(() => DashboardActions.loadRequested()),
          takeUntil(this.actions$.pipe(ofType(DashboardActions.pollingStopped))),
        ),
      ),
    ),
  );

  readonly loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadRequested),
      exhaustMap(() =>
        this.dashboardApi.getDashboard().pipe(
          map(mapDashboardResponse),
          map(({ items }) => DashboardActions.loadSucceeded({ items })),
          catchError((error: unknown) =>
            of(
              DashboardActions.loadFailed({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.message) {
    return error.message;
  }

  return 'Failed to load dashboard.';
}

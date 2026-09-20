import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { CafeDashboardApi } from '../../../core/api/cafe-dashboard.api';
import { loadDashboard, loadDashboardFailure, loadDashboardSuccess } from './cafe-status.actions';

const LOAD_DASHBOARD_ERROR_MESSAGE = 'カフェの状況を取得できませんでした。';

function toLoadDashboardErrorMessage(_error: unknown): string {
  return LOAD_DASHBOARD_ERROR_MESSAGE;
}

@Injectable()
export class CafeStatusEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(CafeDashboardApi);

  readonly loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadDashboard),
      exhaustMap(() =>
        this.api.getDashboard().pipe(
          map((dashboard) => loadDashboardSuccess({ dashboard })),
          catchError((error: unknown) =>
            of(
              loadDashboardFailure({
                errorMessage: toLoadDashboardErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}

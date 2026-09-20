import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, exhaustMap, map, of } from 'rxjs';

import { CafeDashboardApi } from '../../../core/api/cafe-dashboard.api';
import {
  loadDashboard,
  loadDashboardFailure,
  loadDashboardSuccess,
  updateTable,
  updateTableFailure,
  updateTableSuccess,
} from './cafe-status.actions';

const LOAD_DASHBOARD_ERROR_MESSAGE = 'カフェの状況を取得できませんでした。';
const UPDATE_TABLE_ERROR_MESSAGE = 'テーブルを更新できませんでした。';
const INVALID_UPDATE_TABLE_ERROR_MESSAGE = '入力内容が正しくありません。';
const TABLE_NOT_FOUND_ERROR_MESSAGE = '更新対象のテーブルが見つかりません。';

function toLoadDashboardErrorMessage(_error: unknown): string {
  return LOAD_DASHBOARD_ERROR_MESSAGE;
}

function toUpdateTableErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 400) {
      return INVALID_UPDATE_TABLE_ERROR_MESSAGE;
    }

    if (error.status === 404) {
      return TABLE_NOT_FOUND_ERROR_MESSAGE;
    }
  }

  return UPDATE_TABLE_ERROR_MESSAGE;
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

  readonly updateTable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTable),
      concatMap(({ request }) =>
        this.api.updateTable(request).pipe(
          map((table) => updateTableSuccess({ table })),
          catchError((error: unknown) =>
            of(
              updateTableFailure({
                tableNumber: request.tableNumber,
                message: toUpdateTableErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}

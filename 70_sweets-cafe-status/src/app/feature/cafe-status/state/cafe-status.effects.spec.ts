import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { firstValueFrom, of, Subject, take, throwError, toArray } from 'rxjs';

import { CafeDashboardApi } from '../../../core/api/cafe-dashboard.api';
import {
  CafeDashboard,
  CafeTable,
  UpdateTableRequest,
} from '../../../core/model/cafe-status.model';
import {
  loadDashboard,
  loadDashboardFailure,
  loadDashboardSuccess,
  updateTable,
  updateTableFailure,
  updateTableSuccess,
} from './cafe-status.actions';
import { CafeStatusEffects } from './cafe-status.effects';

describe('CafeStatusEffects', () => {
  let actions$: Subject<Action>;
  let api: {
    getDashboard: ReturnType<typeof vi.fn>;
    updateTable: ReturnType<typeof vi.fn>;
  };
  let effects: CafeStatusEffects;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    api = { getDashboard: vi.fn(), updateTable: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        CafeStatusEffects,
        provideMockActions(() => actions$),
        { provide: CafeDashboardApi, useValue: api },
      ],
    });

    effects = TestBed.inject(CafeStatusEffects);
  });

  it('取得成功時にdashboardを持つ成功actionを返す', async () => {
    const dashboard: CafeDashboard = {
      generatedAt: '2026-09-20T01:00:00.000Z',
      staff: { hall: 3, kitchen: 2 },
      seats: { usedToday: 8, reservedToday: 2, total: 12 },
      tables: [],
    };
    api.getDashboard.mockReturnValue(of(dashboard));

    const result = firstValueFrom(effects.loadDashboard$);
    actions$.next(loadDashboard());

    await expect(result).resolves.toEqual(loadDashboardSuccess({ dashboard }));
    expect(api.getDashboard).toHaveBeenCalledOnce();
  });

  it('取得失敗時に画面表示用メッセージを持つ失敗actionを返す', async () => {
    api.getDashboard.mockReturnValue(throwError(() => new Error('network error')));

    const result = firstValueFrom(effects.loadDashboard$);
    actions$.next(loadDashboard());

    await expect(result).resolves.toEqual(
      loadDashboardFailure({ errorMessage: 'カフェの状況を取得できませんでした。' }),
    );
    expect(api.getDashboard).toHaveBeenCalledOnce();
  });

  const table: CafeTable = {
    tableNumber: 'T01',
    classification: 'テーブル',
    status: '提供済',
    guestIds: ['G01'],
    予約: [],
    stateElapsedSeconds: 125,
    statusDurationsSeconds: {
      空き: 0,
      未オーダー: 0,
      調理中: 0,
      提供済: 125,
      片付け中: 0,
    },
    people: 2,
    billingAmount: 1_360,
    dailyUsageRate: 24,
  };

  const request: UpdateTableRequest = {
    tableNumber: 'T01',
    status: '片付け中',
    people: 3,
    billingAmount: 980,
  };

  it('更新成功時にAPI応答のtableを持つ成功actionを返す', async () => {
    api.updateTable.mockReturnValue(of(table));

    const result = firstValueFrom(effects.updateTable$);
    actions$.next(updateTable({ request }));

    await expect(result).resolves.toEqual(updateTableSuccess({ table }));
    expect(api.updateTable).toHaveBeenCalledWith(request);
  });

  it('更新失敗時に対象番号と画面表示用メッセージを持つ失敗actionを返す', async () => {
    api.updateTable.mockReturnValue(throwError(() => new Error('network error')));

    const result = firstValueFrom(effects.updateTable$);
    actions$.next(updateTable({ request }));

    await expect(result).resolves.toEqual(
      updateTableFailure({
        tableNumber: 'T01',
        message: 'テーブルを更新できませんでした。',
      }),
    );
    expect(api.updateTable).toHaveBeenCalledWith(request);
  });

  it('複数の更新要求を受信順に直列実行する', async () => {
    const firstResponse = new Subject<CafeTable>();
    const secondResponse = new Subject<CafeTable>();
    const secondRequest: UpdateTableRequest = { ...request, tableNumber: 'T02' };
    const secondTable: CafeTable = { ...table, tableNumber: 'T02' };
    api.updateTable.mockReturnValueOnce(firstResponse).mockReturnValueOnce(secondResponse);

    const result = firstValueFrom(effects.updateTable$.pipe(take(2), toArray()));
    actions$.next(updateTable({ request }));
    actions$.next(updateTable({ request: secondRequest }));

    expect(api.updateTable).toHaveBeenCalledTimes(1);
    firstResponse.next(table);
    firstResponse.complete();
    expect(api.updateTable).toHaveBeenCalledTimes(2);
    secondResponse.next(secondTable);
    secondResponse.complete();

    await expect(result).resolves.toEqual([
      updateTableSuccess({ table }),
      updateTableSuccess({ table: secondTable }),
    ]);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';

import { CafeDashboardApi } from '../../../core/api/cafe-dashboard.api';
import { CafeDashboard } from '../../../core/model/cafe-status.model';
import {
  loadDashboard,
  loadDashboardFailure,
  loadDashboardSuccess,
} from './cafe-status.actions';
import { CafeStatusEffects } from './cafe-status.effects';

describe('CafeStatusEffects', () => {
  let actions$: Subject<Action>;
  let api: { getDashboard: ReturnType<typeof vi.fn> };
  let effects: CafeStatusEffects;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    api = { getDashboard: vi.fn() };

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
});

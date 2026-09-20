import { CafeDashboard } from '../../../core/model/cafe-status.model';
import { loadDashboard, loadDashboardFailure, loadDashboardSuccess } from './cafe-status.actions';
import { cafeStatusReducer, initialCafeStatusState } from './cafe-status.reducer';

describe('cafeStatusReducer', () => {
  const dashboard: CafeDashboard = {
    generatedAt: '2026-09-20T01:00:00.000Z',
    staff: { hall: 3, kitchen: 2 },
    seats: { usedToday: 8, reservedToday: 2, total: 12 },
    tables: [],
  };

  it('取得開始時にloadingを開始して以前の取得エラーを消す', () => {
    const state = {
      ...initialCafeStatusState,
      dashboard,
      loadError: '以前のエラー',
    };

    const result = cafeStatusReducer(state, loadDashboard());

    expect(result).toEqual({
      ...state,
      loading: true,
      loadError: null,
    });
  });

  it('取得成功時にdashboardを保存してloadingを終了する', () => {
    const state = {
      ...initialCafeStatusState,
      loading: true,
    };

    const result = cafeStatusReducer(state, loadDashboardSuccess({ dashboard }));

    expect(result).toEqual({
      ...state,
      dashboard,
      loading: false,
    });
  });

  it('取得失敗時にエラーを保存してloadingを終了する', () => {
    const state = {
      ...initialCafeStatusState,
      dashboard,
      loading: true,
    };

    const result = cafeStatusReducer(
      state,
      loadDashboardFailure({ errorMessage: '取得できませんでした。' }),
    );

    expect(result).toEqual({
      ...state,
      loading: false,
      loadError: '取得できませんでした。',
    });
  });
});

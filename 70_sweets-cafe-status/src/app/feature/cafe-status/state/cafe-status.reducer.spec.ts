import { CafeDashboard } from '../../../core/model/cafe-status.model';
import {
  changeSplitPercent,
  loadDashboard,
  loadDashboardFailure,
  loadDashboardSuccess,
} from './cafe-status.actions';
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

  it('分割比率の変更を保持する', () => {
    const result = cafeStatusReducer(
      initialCafeStatusState,
      changeSplitPercent({ splitPercent: 42 }),
    );

    expect(result).toEqual({
      ...initialCafeStatusState,
      splitPercent: 42,
    });
  });

  it('右ペインの開閉はURLが正本なので開閉用のbooleanを持たない', () => {
    const booleanKeys = Object.entries(initialCafeStatusState)
      .filter(([, value]) => typeof value === 'boolean')
      .map(([key]) => key);

    expect(booleanKeys).toEqual(['loading']);
  });

  it('分割比率の変更で他の状態を変えない', () => {
    const state = {
      ...initialCafeStatusState,
      dashboard,
      loading: true,
      loadError: '取得できませんでした。',
    };

    const result = cafeStatusReducer(state, changeSplitPercent({ splitPercent: 30 }));

    expect(result).toEqual({ ...state, splitPercent: 30 });
  });
});

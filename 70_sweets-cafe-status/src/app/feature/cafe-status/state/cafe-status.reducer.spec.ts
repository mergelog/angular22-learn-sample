import { CafeDashboard, CafeTable } from '../../../core/model/cafe-status.model';
import {
  changeSplitPercent,
  loadDashboard,
  loadDashboardFailure,
  loadDashboardSuccess,
  updateTable,
  updateTableFailure,
  updateTableSuccess,
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

  it('更新成功時にAPI応答値で該当する一覧データだけを置換する', () => {
    const currentTable: CafeTable = {
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
    const otherTable: CafeTable = { ...currentTable, tableNumber: 'T02' };
    const updatedTable: CafeTable = {
      ...currentTable,
      status: '片付け中',
      people: 3,
      billingAmount: 980,
    };
    const state = {
      ...initialCafeStatusState,
      dashboard: { ...dashboard, tables: [currentTable, otherTable] },
    };

    const result = cafeStatusReducer(state, updateTableSuccess({ table: updatedTable }));

    expect(result.dashboard?.tables).toEqual([updatedTable, otherTable]);
    expect(result.dashboard?.tables[0]).toBe(updatedTable);
    expect(result.dashboard?.tables[1]).toBe(otherTable);
  });

  it('dashboard取得前の更新成功では一覧を生成しない', () => {
    const table = {
      tableNumber: 'T01',
      classification: 'テーブル',
      status: '提供済',
      guestIds: [],
      予約: [],
      stateElapsedSeconds: 0,
      statusDurationsSeconds: {
        空き: 0,
        未オーダー: 0,
        調理中: 0,
        提供済: 0,
        片付け中: 0,
      },
      people: 0,
      billingAmount: 0,
      dailyUsageRate: 0,
    } satisfies CafeTable;

    const result = cafeStatusReducer(initialCafeStatusState, updateTableSuccess({ table }));

    expect(result.dashboard).toBeNull();
  });

  it('更新開始時に対象番号を保存して以前の更新エラーを消す', () => {
    const state = {
      ...initialCafeStatusState,
      updateError: { tableNumber: 'T01', message: '以前のエラー' },
    };

    const result = cafeStatusReducer(
      state,
      updateTable({
        request: { tableNumber: 'T01', status: '片付け中', people: 3, billingAmount: 980 },
      }),
    );

    expect(result.updatingTableNumber).toBe('T01');
    expect(result.updateError).toBeNull();
  });

  it('更新失敗時に一覧を変更せず送信中状態を終了する', () => {
    const state = {
      ...initialCafeStatusState,
      dashboard,
      updatingTableNumber: 'T01',
    };

    const result = cafeStatusReducer(
      state,
      updateTableFailure({ tableNumber: 'T01', message: '更新できませんでした。' }),
    );

    expect(result.dashboard).toBe(dashboard);
    expect(result.updatingTableNumber).toBeNull();
  });

  it('先の更新成功で後続テーブルの送信中状態を解除しない', () => {
    const updatedTable: CafeTable = {
      tableNumber: 'T01',
      classification: 'テーブル',
      status: '片付け中',
      guestIds: [],
      予約: [],
      stateElapsedSeconds: 0,
      statusDurationsSeconds: {
        空き: 0,
        未オーダー: 0,
        調理中: 0,
        提供済: 0,
        片付け中: 0,
      },
      people: 0,
      billingAmount: 0,
      dailyUsageRate: 0,
    };
    const state = {
      ...initialCafeStatusState,
      dashboard,
      updatingTableNumber: 'T02',
    };

    const result = cafeStatusReducer(state, updateTableSuccess({ table: updatedTable }));

    expect(result.updatingTableNumber).toBe('T02');
  });

  it('先の更新失敗で後続テーブルの送信中状態を解除しない', () => {
    const state = {
      ...initialCafeStatusState,
      dashboard,
      updatingTableNumber: 'T02',
    };

    const result = cafeStatusReducer(
      state,
      updateTableFailure({ tableNumber: 'T01', message: '更新できませんでした。' }),
    );

    expect(result.updatingTableNumber).toBe('T02');
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

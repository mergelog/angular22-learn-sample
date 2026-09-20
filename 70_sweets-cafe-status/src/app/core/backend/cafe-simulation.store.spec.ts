import { TestBed } from '@angular/core/testing';

import { CAFE_CONFIG, CafeConfig } from '../config/cafe.config';
import { CafeSimulationStore } from './cafe-simulation.store';

describe('CafeSimulationStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-15T00:00:00.000Z'));
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const testConfig: CafeConfig = {
      seatCount: 1,
      hallStaffCount: 1,
      kitchenStaffCount: 1,
      dashboardUpdateIntervalMs: 500,
      backendUpdateIntervalMs: 500,
      apiResponseDelayMinMs: 0,
      apiResponseDelayMaxMs: 0,
      maxOrderHistoryCount: 1,
      sweetsMenu: [
        { name: 'テストケーキ', priceYen: 500, caloriesKcal: 300, cookingTimeMinutes: 5 },
      ],
    };

    TestBed.configureTestingModule({
      providers: [{ provide: CAFE_CONFIG, useValue: testConfig }],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('GETを繰り返さなくても内部タイマーで状態が進む', () => {
    const store = TestBed.inject(CafeSimulationStore);

    expect(store.getDashboard().generatedAt).toBe('2026-09-15T09:00:00.000+09:00');
    expect(store.getDashboard().tables[0].status).toBe('空き');

    vi.advanceTimersByTime(2_500);

    expect(store.getDashboard().tables[0].status).toBe('未オーダー');
    expect(store.getDashboard().tables[0].guestIds).toHaveLength(1);

    vi.advanceTimersByTime(1_000);

    expect(store.getOrders()[0]).toMatchObject({ durations: { orderMs: 1_000 } });
    expect(store.getDashboard().tables[0].statusDurationsSeconds).toMatchObject({
      空き: 2,
      未オーダー: 1,
      調理中: 0,
    });

    vi.advanceTimersByTime(3_000);

    expect(store.getOrders()[0]).toMatchObject({ durations: { cookingMs: 3_000 } });

    vi.advanceTimersByTime(12_000);

    expect(store.getOrders()[0]).toMatchObject({ durations: { mealMs: 12_000 } });

    vi.advanceTimersByTime(6_000);

    expect(store.getOrders()).toEqual([expect.objectContaining({ id: 'O0002' })]);
  });

  it('初期状態が提供済の注文にも、注文時間と調理時間を記録する', () => {
    vi.restoreAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.6);

    const store = TestBed.inject(CafeSimulationStore);
    const order = store.getOrders()[0];

    expect(order).toMatchObject({
      durations: { orderMs: 2_000, cookingMs: 5_000 },
    });
    expect(order.durations.mealMs).toBeUndefined();
  });

  it('指定テーブルへ予約を追加する', () => {
    const store = TestBed.inject(CafeSimulationStore);

    const table = store.addReservation('T01', {
      予約時間: '2026-09-15T10:00:00.000Z',
      滞在予定時間: 90,
      予約名: '山田 花子',
      人数: 1,
    });

    expect(table?.予約).toEqual([
      {
        予約時間: '2026-09-15T19:00:00.000+09:00',
        滞在予定時間: 90,
        予約名: '山田 花子',
        人数: 1,
      },
    ]);
  });
});

import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { CAFE_CONFIG, CafeConfig } from '../config/cafe.config';
import { CafeDashboard, CafeOrder, CafeTable } from '../model/cafe-status.model';
import { cafeBackendInterceptor } from './cafe-backend.interceptor';

describe('cafeBackendInterceptor', () => {
  let http: HttpClient;

  beforeEach(() => {
    const testConfig: CafeConfig = {
      seatCount: 4,
      hallStaffCount: 2,
      kitchenStaffCount: 1,
      dashboardUpdateIntervalMs: 60_000,
      backendUpdateIntervalMs: 60_000,
      apiResponseDelayMinMs: 0,
      apiResponseDelayMaxMs: 0,
      maxOrderHistoryCount: 300,
      sweetsMenu: [
        { name: 'テストケーキ', priceYen: 500, caloriesKcal: 300, cookingTimeMinutes: 5 },
      ],
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cafeBackendInterceptor])),
        { provide: CAFE_CONFIG, useValue: testConfig },
      ],
    });

    http = TestBed.inject(HttpClient);
  });

  it('GETで設定と全テーブルのスナップショットを返す', async () => {
    const dashboard = await firstValueFrom(http.get<CafeDashboard>('/api/cafe-status'));

    expect(dashboard.staff).toEqual({ hall: 2, kitchen: 1 });
    expect(dashboard.seats.total).toBe(4);
    expect(dashboard.tables).toHaveLength(4);
    expect(dashboard.tables[0].tableNumber).toBe('T01');
  });

  it('PUTで指定テーブルの状態を変更する', async () => {
    const table = await firstValueFrom(
      http.put<CafeTable>('/api/cafe-status', {
        tableNumber: 'T01',
        status: '調理中',
        people: 1,
        billingAmount: 1_200,
      }),
    );

    expect(table).toMatchObject({
      tableNumber: 'T01',
      status: '調理中',
      people: 1,
    });
    expect(table.billingAmount).toBeGreaterThan(0);
  });

  it('GETで来客に紐づく注文情報を返す', async () => {
    await firstValueFrom(http.delete<CafeTable>('/api/cafe-status/T03'));
    await firstValueFrom(
      http.put<CafeTable>('/api/cafe-status', {
        tableNumber: 'T03',
        status: '未オーダー',
        people: 3,
      }),
    );
    const table = await firstValueFrom(
      http.put<CafeTable>('/api/cafe-status', {
        tableNumber: 'T03',
        status: '調理中',
      }),
    );
    const orders = await firstValueFrom(http.get<readonly CafeOrder[]>('/api/cafe-orders'));

    expect(table.guestIds).toHaveLength(3);
    const tableOrders = orders.filter((order) => order.guestIds.join() === table.guestIds.join());
    expect(tableOrders.length).toBeGreaterThan(0);
    expect(tableOrders[0]).toMatchObject({
      tableNumber: 'T03',
      durations: { staySeconds: expect.any(Number) },
    });
  });

  it('DELETEで指定テーブルを空き状態へ戻す', async () => {
    const table = await firstValueFrom(http.delete<CafeTable>('/api/cafe-status/T01'));

    expect(table).toMatchObject({
      tableNumber: 'T01',
      status: '空き',
      people: 0,
      billingAmount: 0,
    });
  });

  it('POSTで指定テーブルに予約を追加する', async () => {
    const table = await firstValueFrom(
      http.post<CafeTable>('/api/cafe-status/T01/reservations', {
        予約時間: '2026-09-15T10:00:00.000Z',
        滞在予定時間: 90,
        予約名: '山田 花子',
        人数: 2,
      }),
    );

    expect(table.予約).toEqual([
      {
        予約時間: '2026-09-15T19:00:00.000+09:00',
        滞在予定時間: 90,
        予約名: '山田 花子',
        人数: 2,
      },
    ]);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CafeDashboardApi } from '../../core/api/cafe-dashboard.api';
import { CafeDashboard, CafeOrder } from '../../core/model/cafe-status.model';
import { ViewJson } from './view-json';

describe('ViewJson', () => {
  it('初期化時と更新ボタン押下時に状況と注文を取得し、JSONを表示する', () => {
    const dashboard: CafeDashboard = {
      generatedAt: '2026-09-15T00:00:00.000Z',
      staff: { hall: 3, kitchen: 2 },
      seats: { usedToday: 18, reservedToday: 6, total: 12 },
      tables: [],
    };
    const orders: readonly CafeOrder[] = [];
    const getDashboard = vi.fn(() => of(dashboard));
    const getOrders = vi.fn(() => of(orders));

    TestBed.configureTestingModule({
      imports: [ViewJson],
      providers: [
        provideRouter([]),
        { provide: CafeDashboardApi, useValue: { getDashboard, getOrders } },
      ],
    });

    const fixture = TestBed.createComponent(ViewJson);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(getDashboard).toHaveBeenCalledTimes(1);
    expect(getOrders).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('pre').textContent).toContain(
      '2026-09-15T00:00:00.000Z',
    );

    fixture.nativeElement.querySelector('button').click();

    expect(getDashboard).toHaveBeenCalledTimes(2);
    expect(getOrders).toHaveBeenCalledTimes(2);
  });
});

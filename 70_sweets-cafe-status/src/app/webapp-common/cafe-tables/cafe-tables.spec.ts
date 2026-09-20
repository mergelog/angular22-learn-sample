import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';

import { CafeDashboard } from '../../core/model/cafe-status.model';
import { loadDashboard } from '../../feature/cafe-status/state/cafe-status.actions';
import {
  CAFE_STATUS_FEATURE_KEY,
  initialCafeStatusState,
} from '../../feature/cafe-status/state/cafe-status.reducer';
import { CafeTables } from './cafe-tables';

describe('CafeTables', () => {
  it('初期表示でテーブル状況の一覧を描画する', () => {
    const dashboard: CafeDashboard = {
      generatedAt: '2026-09-20T01:00:00.000Z',
      staff: { hall: 3, kitchen: 2 },
      seats: { usedToday: 8, reservedToday: 2, total: 12 },
      tables: [
        {
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
        },
      ],
    };
    TestBed.configureTestingModule({
      imports: [CafeTables],
      providers: [
        provideRouter([]),
        provideMockStore({
          initialState: {
            [CAFE_STATUS_FEATURE_KEY]: {
              ...initialCafeStatusState,
              dashboard,
            },
          },
        }),
      ],
    });

    const dispatch = vi.spyOn(TestBed.inject(Store), 'dispatch');
    const fixture = TestBed.createComponent(CafeTables);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('tbody tr');
    expect(dispatch).toHaveBeenCalledWith(loadDashboard());
    expect(row.textContent).toContain('T01');
    expect(row.textContent).toContain('提供済');
    expect(row.textContent).toContain('¥1,360');
  });
});

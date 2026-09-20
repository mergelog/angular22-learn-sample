import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CafeDashboard } from '../../../../core/model/cafe-status.model';
import { CAFE_STATUS_FEATURE_KEY, initialCafeStatusState } from '../../state/cafe-status.reducer';
import { CafeTableOverview } from './cafe-table-overview';

describe('CafeTableOverview', () => {
  it('URLで選択したテーブルの概要をStoreから表示する', () => {
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
            空き: 60,
            未オーダー: 30,
            調理中: 90,
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
      imports: [CafeTableOverview],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { paramMap: of(convertToParamMap({ tableNumber: 'T01' })) },
          },
        },
        provideMockStore({
          initialState: {
            [CAFE_STATUS_FEATURE_KEY]: { ...initialCafeStatusState, dashboard },
          },
        }),
      ],
    });

    const fixture = TestBed.createComponent(CafeTableOverview);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('テーブル');
    expect(fixture.nativeElement.textContent).toContain('2分 5秒');
    expect(fixture.nativeElement.textContent).toContain('24%');
    expect(fixture.nativeElement.textContent).toContain('提供済');
  });
});

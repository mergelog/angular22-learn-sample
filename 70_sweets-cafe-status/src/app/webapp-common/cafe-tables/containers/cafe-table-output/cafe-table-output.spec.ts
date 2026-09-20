import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import {
  CAFE_STATUS_FEATURE_KEY,
  initialCafeStatusState,
} from '../../../../feature/cafe-status/state/cafe-status.reducer';
import { BaseCafeTableOutput } from './base-cafe-table-output';
import { CafeTableOutput } from './cafe-table-output';

describe('CafeTableOutput', () => {
  it('BaseCafeTableOutputを継承したcomponentとして生成できる', () => {
    TestBed.configureTestingModule({
      imports: [CafeTableOutput],
      providers: [
        provideRouter([]),
        provideMockStore({
          initialState: {
            [CAFE_STATUS_FEATURE_KEY]: initialCafeStatusState,
          },
        }),
      ],
    });

    const fixture = TestBed.createComponent(CafeTableOutput);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeInstanceOf(BaseCafeTableOutput);
  });

  it('close操作でcafe-statusの一覧URLへ遷移する', () => {
    const route = { paramMap: of(convertToParamMap({ tableNumber: 'T01' })) };
    const router = { navigate: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({
      imports: [CafeTableOutput],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        provideMockStore({
          initialState: {
            [CAFE_STATUS_FEATURE_KEY]: {
              ...initialCafeStatusState,
              dashboard: {
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
              },
            },
          },
        }),
      ],
    });
    const fixture = TestBed.createComponent(CafeTableOutput);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[aria-label="詳細を閉じる"]').click();

    expect(router.navigate).toHaveBeenCalledWith(['..'], { relativeTo: route });
  });
});

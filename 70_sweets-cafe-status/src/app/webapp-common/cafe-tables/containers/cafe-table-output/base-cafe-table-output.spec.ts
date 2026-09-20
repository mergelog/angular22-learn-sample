import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';

import { CafeDashboard } from '../../../../core/model/cafe-status.model';
import {
  CAFE_STATUS_FEATURE_KEY,
  initialCafeStatusState,
} from '../../../../feature/cafe-status/state/cafe-status.reducer';
import { BaseCafeTableOutput } from './base-cafe-table-output';

@Component({ template: '' })
class TestCafeTableOutput extends BaseCafeTableOutput {
  readonly currentTableNumber = this.tableNumber;
  readonly currentTable = this.selectedTable;

  close(): Promise<boolean> {
    return this.closePanel();
  }
}

describe('BaseCafeTableOutput', () => {
  it('URLのテーブル番号とStoreから選択中テーブルを導出する', async () => {
    const paramMap = new BehaviorSubject(convertToParamMap({ tableNumber: 'T01' }));
    const route = { paramMap };
    const navigate = vi.fn().mockResolvedValue(true);
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
      imports: [TestCafeTableOutput],
      providers: [
        provideMockStore({
          initialState: {
            [CAFE_STATUS_FEATURE_KEY]: {
              ...initialCafeStatusState,
              dashboard,
            },
          },
        }),
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: { navigate } },
      ],
    });

    const fixture = TestBed.createComponent(TestCafeTableOutput);
    fixture.detectChanges();

    expect(fixture.componentInstance.currentTableNumber()).toBe('T01');
    expect(fixture.componentInstance.currentTable()?.tableNumber).toBe('T01');

    paramMap.next(convertToParamMap({ tableNumber: 'T02' }));

    expect(fixture.componentInstance.currentTableNumber()).toBe('T02');
    expect(fixture.componentInstance.currentTable()).toBeNull();

    await fixture.componentInstance.close();

    expect(navigate).toHaveBeenCalledWith(['..'], { relativeTo: route });
  });
});

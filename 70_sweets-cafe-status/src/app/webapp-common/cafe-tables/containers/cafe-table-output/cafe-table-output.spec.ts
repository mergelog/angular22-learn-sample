import { DatePipe } from '@angular/common';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CafeDashboard, UpdateTableRequest } from '../../../../core/model/cafe-status.model';
import { updateTable } from '../../../../feature/cafe-status/state/cafe-status.actions';
import {
  CAFE_STATUS_FEATURE_KEY,
  initialCafeStatusState,
} from '../../../../feature/cafe-status/state/cafe-status.reducer';
import { CafeInfoHeader } from '../../dumb/cafe-info-header/cafe-info-header';
import { BaseCafeTableOutput } from './base-cafe-table-output';
import { CafeTableOutput } from './cafe-table-output';

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
              dashboard,
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

  it('詳細ペインにdashboardの取得時刻を表示する', () => {
    TestBed.configureTestingModule({
      imports: [CafeTableOutput],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ tableNumber: 'T01' })) },
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
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
    const fixture = TestBed.createComponent(CafeTableOutput);
    fixture.detectChanges();

    const formatted = new DatePipe('en-US').transform(dashboard.generatedAt, 'yyyy/MM/dd HH:mm:ss');

    expect(fixture.nativeElement.querySelector('.snapshot-time').textContent).toContain(
      `取得時刻 ${formatted}`,
    );
  });

  it('保存要求をupdateTable actionとしてdispatchする', () => {
    TestBed.configureTestingModule({
      imports: [CafeTableOutput],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ tableNumber: 'T01' })) },
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
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
    const fixture = TestBed.createComponent(CafeTableOutput);
    const store = TestBed.inject(MockStore);
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.detectChanges();
    const request: UpdateTableRequest = {
      tableNumber: 'T01',
      status: '片付け中',
      people: 3,
      billingAmount: 980,
    };

    const header = fixture.debugElement.query(By.directive(CafeInfoHeader))
      .componentInstance as CafeInfoHeader;
    header.saveRequested.emit(request);

    expect(dispatch).toHaveBeenCalledWith(updateTable({ request }));
  });

  it('表示中テーブルの更新中状態を編集フォームへ渡す', () => {
    TestBed.configureTestingModule({
      imports: [CafeTableOutput],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ tableNumber: 'T01' })) },
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        provideMockStore({
          initialState: {
            [CAFE_STATUS_FEATURE_KEY]: {
              ...initialCafeStatusState,
              dashboard,
              updatingTableNumber: 'T01',
            },
          },
        }),
      ],
    });
    const fixture = TestBed.createComponent(CafeTableOutput);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.edit-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const saveButton = fixture.nativeElement.querySelector('.save-button') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
    expect(saveButton.textContent).toContain('保存中');
  });

  for (const unknownTableNumber of ['T99', 't01']) {
    it(`存在しないテーブル番号 ${unknownTableNumber} をnot-found表示する`, () => {
      TestBed.configureTestingModule({
        imports: [CafeTableOutput],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              paramMap: of(convertToParamMap({ tableNumber: unknownTableNumber })),
            },
          },
          { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
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
      const fixture = TestBed.createComponent(CafeTableOutput);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.detail-state').textContent).toContain(
        'テーブルが見つかりません',
      );
      expect(fixture.nativeElement.querySelector('.detail-state').textContent).toContain(
        unknownTableNumber,
      );
    });
  }

  it('初回取得中はnot-foundではなくloadingを表示する', () => {
    TestBed.configureTestingModule({
      imports: [CafeTableOutput],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ tableNumber: 'T01' })) },
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        provideMockStore({
          initialState: {
            [CAFE_STATUS_FEATURE_KEY]: {
              ...initialCafeStatusState,
              loading: true,
            },
          },
        }),
      ],
    });
    const fixture = TestBed.createComponent(CafeTableOutput);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('テーブル詳細を読み込んでいます');
    expect(fixture.nativeElement.textContent).not.toContain('テーブルが見つかりません');
  });
});

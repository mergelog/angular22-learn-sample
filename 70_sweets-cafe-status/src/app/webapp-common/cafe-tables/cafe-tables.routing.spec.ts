import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideStore } from '@ngrx/store';
import { SplitAreaComponent } from 'angular-split';

import { routes } from '../../app.routes';
import { CafeDashboard, CafeTable } from '../../core/model/cafe-status.model';

function createTable(tableNumber: string, overrides: Partial<CafeTable> = {}): CafeTable {
  return {
    tableNumber,
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
    ...overrides,
  };
}

const dashboard: CafeDashboard = {
  generatedAt: '2026-09-20T01:00:00.000Z',
  staff: { hall: 3, kitchen: 2 },
  seats: { usedToday: 8, reservedToday: 2, total: 12 },
  tables: [
    createTable('T01'),
    createTable('T02', { classification: 'カウンター', status: '調理中' }),
  ],
};

function configureCafeStatusTestBed(): void {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      provideStore(),
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });
}

async function openCafeStatus(url: string): Promise<RouterTestingHarness> {
  const harness = await RouterTestingHarness.create(url);
  TestBed.inject(HttpTestingController).expectOne('/api/cafe-status').flush(dashboard);
  harness.detectChanges();

  return harness;
}

function detailPaneArea(harness: RouterTestingHarness): SplitAreaComponent {
  return harness.fixture.debugElement.queryAll(By.directive(SplitAreaComponent))[1]
    .componentInstance as SplitAreaComponent;
}

describe('cafe-statusのURL連動', () => {
  it('URLを直接指定すると対象テーブルの右ペインが開く', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');
    const detailPane: HTMLElement =
      harness.fixture.nativeElement.querySelector('app-cafe-table-output');

    expect(detailPaneArea(harness).visible()).toBe(true);
    expect(detailPane.querySelector('.info-header h2')?.textContent).toBe('T01');
    expect(detailPane.querySelector('app-cafe-table-overview')?.textContent).toContain('Overview');
    expect(detailPane.textContent).not.toContain('テーブルが見つかりません');
  });
});

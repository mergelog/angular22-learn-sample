import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideStore } from '@ngrx/store';
import { SplitAreaComponent, SplitComponent } from 'angular-split';

import { routes } from '../../app.routes';
import { CafeDashboard, CafeTable } from '../../core/model/cafe-status.model';
import { CafeInfoHeader } from './dumb/cafe-info-header/cafe-info-header';

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
      provideLocationMocks(),
      provideStore(),
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });
}

async function createCafeStatusHarness(url: string): Promise<RouterTestingHarness> {
  // ブラウザの戻る・進むをRouterへ伝えるため、bootstrap時と同じlocation監視を開始する
  TestBed.inject(Router).setUpLocationChangeListener();

  return RouterTestingHarness.create(url);
}

async function openCafeStatus(url: string): Promise<RouterTestingHarness> {
  const harness = await createCafeStatusHarness(url);
  TestBed.inject(HttpTestingController).expectOne('/api/cafe-status').flush(dashboard);
  harness.detectChanges();

  return harness;
}

function detailPaneArea(harness: RouterTestingHarness): SplitAreaComponent {
  return harness.fixture.debugElement.queryAll(By.directive(SplitAreaComponent))[1]
    .componentInstance as SplitAreaComponent;
}

function splitSizes(harness: RouterTestingHarness): unknown[] {
  return harness.fixture.debugElement
    .queryAll(By.directive(SplitAreaComponent))
    .map((area) => (area.componentInstance as SplitAreaComponent).size());
}

async function dragGutterTo(harness: RouterTestingHarness, listPercent: number): Promise<void> {
  const split = harness.fixture.debugElement.query(By.directive(SplitComponent));

  (split.componentInstance as SplitComponent).dragEnd.emit({
    gutterNum: 1,
    sizes: [listPercent, 100 - listPercent],
  });
  await harness.fixture.whenStable();
  harness.detectChanges();
}

function detailPane(harness: RouterTestingHarness): HTMLElement {
  return harness.fixture.nativeElement.querySelector('app-cafe-table-output');
}

function tableRow(harness: RouterTestingHarness, tableNumber: string): HTMLTableRowElement {
  const rows: HTMLTableRowElement[] = Array.from(
    harness.fixture.nativeElement.querySelectorAll('tbody tr'),
  );

  return rows.find((row) => row.textContent?.includes(tableNumber))!;
}

async function clickTableRow(harness: RouterTestingHarness, tableNumber: string): Promise<void> {
  tableRow(harness, tableNumber).click();
  await harness.fixture.whenStable();
  harness.detectChanges();
}

async function closeDetailPane(harness: RouterTestingHarness): Promise<void> {
  detailPane(harness).querySelector<HTMLButtonElement>('[aria-label="詳細を閉じる"]')!.click();
  await harness.fixture.whenStable();
  harness.detectChanges();
}

async function navigateHistory(
  harness: RouterTestingHarness,
  direction: 'back' | 'forward',
): Promise<void> {
  const location = TestBed.inject(Location);

  if (direction === 'back') {
    location.back();
  } else {
    location.forward();
  }

  // Routerはpopstateをmacrotaskで受けてからナビゲーションするため、1tick進めてから待つ
  await new Promise((resolve) => setTimeout(resolve));
  await harness.fixture.whenStable();
  harness.detectChanges();
}

describe('cafe-statusのURL連動', () => {
  it('URLを直接指定すると対象テーブルの右ペインが開く', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');
    const pane = detailPane(harness);

    expect(detailPaneArea(harness).visible()).toBe(true);
    expect(pane.querySelector('.info-header h2')?.textContent).toBe('T01');
    expect(pane.querySelector('app-cafe-table-overview')?.textContent).toContain('Overview');
    expect(pane.textContent).not.toContain('テーブルが見つかりません');
  });

  it('一覧の行クリックで対象テーブルの右ペインが開く', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status');

    expect(detailPaneArea(harness).visible()).toBe(false);

    await clickTableRow(harness, 'T02');

    expect(TestBed.inject(Router).url).toBe('/cafe-status/T02/overview');
    expect(detailPaneArea(harness).visible()).toBe(true);
    expect(detailPane(harness).querySelector('.info-header h2')?.textContent).toBe('T02');
    expect(tableRow(harness, 'T02').getAttribute('aria-selected')).toBe('true');
    expect(tableRow(harness, 'T01').getAttribute('aria-selected')).toBe('false');
  });

  it('closeで右ペインと行の選択状態が解除される', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');

    expect(detailPaneArea(harness).visible()).toBe(true);
    expect(tableRow(harness, 'T01').getAttribute('aria-selected')).toBe('true');

    await closeDetailPane(harness);

    expect(TestBed.inject(Router).url).toBe('/cafe-status');
    expect(detailPaneArea(harness).visible()).toBe(false);
    expect(detailPane(harness)).toBeNull();
    expect(tableRow(harness, 'T01').getAttribute('aria-selected')).toBe('false');
  });

  it('戻る・進むで右ペインと行の選択状態が同期する', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status');
    await clickTableRow(harness, 'T01');
    await clickTableRow(harness, 'T02');

    await navigateHistory(harness, 'back');

    expect(TestBed.inject(Router).url).toBe('/cafe-status/T01/overview');
    expect(detailPane(harness).querySelector('.info-header h2')?.textContent).toBe('T01');
    expect(tableRow(harness, 'T01').getAttribute('aria-selected')).toBe('true');

    await navigateHistory(harness, 'back');

    expect(TestBed.inject(Router).url).toBe('/cafe-status');
    expect(detailPaneArea(harness).visible()).toBe(false);
    expect(tableRow(harness, 'T01').getAttribute('aria-selected')).toBe('false');

    await navigateHistory(harness, 'forward');

    expect(TestBed.inject(Router).url).toBe('/cafe-status/T01/overview');
    expect(detailPaneArea(harness).visible()).toBe(true);
    expect(detailPane(harness).querySelector('.info-header h2')?.textContent).toBe('T01');
    expect(tableRow(harness, 'T01').getAttribute('aria-selected')).toBe('true');
  });

  it('初回取得の完了前はnot-foundではなくloadingを表示する', async () => {
    configureCafeStatusTestBed();

    const harness = await createCafeStatusHarness('/cafe-status/T01/overview');
    const request = TestBed.inject(HttpTestingController).expectOne('/api/cafe-status');

    expect(detailPane(harness).textContent).toContain('テーブル詳細を読み込んでいます');
    expect(detailPane(harness).textContent).not.toContain('テーブルが見つかりません');

    request.flush(dashboard);
    harness.detectChanges();

    expect(detailPane(harness).querySelector('.info-header h2')?.textContent).toBe('T01');
    expect(detailPane(harness).textContent).not.toContain('テーブルが見つかりません');
  });

  it('再読み込み後も一覧と詳細が同じselectorのdashboardを参照する', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');

    expect(tableRow(harness, 'T01').textContent).toContain('提供済');
    expect(detailPane(harness).querySelector('.summary')?.textContent).toContain('提供済');
    expect(detailPane(harness).querySelector('app-cafe-table-overview')?.textContent).toContain(
      '24%',
    );

    const refreshButton: HTMLButtonElement =
      harness.fixture.nativeElement.querySelector('.refresh-button');

    refreshButton.click();
    harness.detectChanges();

    TestBed.inject(HttpTestingController)
      .expectOne('/api/cafe-status')
      .flush({
        ...dashboard,
        tables: [
          createTable('T01', { status: '片付け中', people: 4, dailyUsageRate: 57 }),
          dashboard.tables[1],
        ],
      });
    harness.detectChanges();

    expect(tableRow(harness, 'T01').textContent).toContain('片付け中');
    expect(tableRow(harness, 'T01').textContent).toContain('4名');
    expect(detailPane(harness).querySelector('.summary')?.textContent).toContain('片付け中');
    expect(detailPane(harness).querySelector('app-cafe-table-overview')?.textContent).toContain(
      '57%',
    );
  });

  it('更新成功時に一覧と詳細を同時に更新する', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');
    const header = harness.fixture.debugElement.query(By.directive(CafeInfoHeader))
      .componentInstance as CafeInfoHeader;

    detailPane(harness).querySelector<HTMLButtonElement>('.edit-button')!.click();
    header.form.patchValue({ status: '片付け中', people: 3, billingAmount: 980 });
    harness.detectChanges();
    detailPane(harness).querySelector<HTMLButtonElement>('.save-button')!.click();

    const updateRequest = TestBed.inject(HttpTestingController).expectOne('/api/cafe-status');
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush(
      createTable('T01', { status: '片付け中', people: 3, billingAmount: 980 }),
    );
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(tableRow(harness, 'T01').textContent).toContain('片付け中');
    expect(tableRow(harness, 'T01').textContent).toContain('3名');
    expect(tableRow(harness, 'T01').textContent).toContain('¥980');
    expect(detailPane(harness).querySelector('.summary')?.textContent).toContain('片付け中');
  });

  it('更新要求値ではなくAPI応答値を正として表示する', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');
    const header = harness.fixture.debugElement.query(By.directive(CafeInfoHeader))
      .componentInstance as CafeInfoHeader;

    detailPane(harness).querySelector<HTMLButtonElement>('.edit-button')!.click();
    header.form.patchValue({ status: '調理中', people: 3, billingAmount: 980 });
    harness.detectChanges();
    detailPane(harness).querySelector<HTMLButtonElement>('.save-button')!.click();

    const updateRequest = TestBed.inject(HttpTestingController).expectOne('/api/cafe-status');
    expect(updateRequest.request.body).toEqual({
      tableNumber: 'T01',
      status: '調理中',
      people: 3,
      billingAmount: 980,
    });
    updateRequest.flush(
      createTable('T01', { status: '提供済', people: 2, billingAmount: 1_480 }),
    );
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(tableRow(harness, 'T01').textContent).toContain('提供済');
    expect(tableRow(harness, 'T01').textContent).toContain('2名');
    expect(tableRow(harness, 'T01').textContent).toContain('¥1,480');
    expect(tableRow(harness, 'T01').textContent).not.toContain('¥980');
    expect(detailPane(harness).querySelector('.summary')?.textContent).toContain('提供済');
  });

  it('更新失敗時にStoreのテーブルを変更しない', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');
    const header = harness.fixture.debugElement.query(By.directive(CafeInfoHeader))
      .componentInstance as CafeInfoHeader;

    detailPane(harness).querySelector<HTMLButtonElement>('.edit-button')!.click();
    header.form.patchValue({ status: '片付け中', people: 3, billingAmount: 980 });
    harness.detectChanges();
    detailPane(harness).querySelector<HTMLButtonElement>('.save-button')!.click();

    TestBed.inject(HttpTestingController)
      .expectOne('/api/cafe-status')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(tableRow(harness, 'T01').textContent).toContain('提供済');
    expect(tableRow(harness, 'T01').textContent).toContain('2名');
    expect(tableRow(harness, 'T01').textContent).toContain('¥1,360');
    expect(tableRow(harness, 'T01').textContent).not.toContain('片付け中');
    expect(detailPane(harness).querySelector('.summary')?.textContent).toContain('提供済');
  });

  it('更新失敗時にフォーム入力とエラーを残す', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');
    const header = harness.fixture.debugElement.query(By.directive(CafeInfoHeader))
      .componentInstance as CafeInfoHeader;
    const editedValue = { status: '片付け中' as const, people: 3, billingAmount: 980 };

    detailPane(harness).querySelector<HTMLButtonElement>('.edit-button')!.click();
    header.form.patchValue(editedValue);
    harness.detectChanges();
    detailPane(harness).querySelector<HTMLButtonElement>('.save-button')!.click();

    TestBed.inject(HttpTestingController)
      .expectOne('/api/cafe-status')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(detailPane(harness).querySelector('.edit-form')).not.toBeNull();
    expect(header.form.getRawValue()).toEqual(editedValue);
    expect(detailPane(harness).querySelector('.update-error')?.textContent).toContain(
      'テーブルを更新できませんでした。',
    );
  });

  it('別テーブルへ以前の更新エラーを表示しない', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');
    const header = harness.fixture.debugElement.query(By.directive(CafeInfoHeader))
      .componentInstance as CafeInfoHeader;

    detailPane(harness).querySelector<HTMLButtonElement>('.edit-button')!.click();
    header.form.patchValue({ status: '片付け中', people: 3, billingAmount: 980 });
    harness.detectChanges();
    detailPane(harness).querySelector<HTMLButtonElement>('.save-button')!.click();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/cafe-status')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(detailPane(harness).querySelector('.update-error')).not.toBeNull();

    await clickTableRow(harness, 'T02');

    expect(detailPane(harness).querySelector('.info-header h2')?.textContent).toBe('T02');
    expect(detailPane(harness).querySelector('.update-error')).toBeNull();
    expect(detailPane(harness).textContent).not.toContain('テーブルを更新できませんでした。');
  });

  it('同じフォームからの二重送信を防止する', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');
    const pane = detailPane(harness);
    const header = harness.fixture.debugElement.query(By.directive(CafeInfoHeader))
      .componentInstance as CafeInfoHeader;

    pane.querySelector<HTMLButtonElement>('.edit-button')!.click();
    header.form.patchValue({ status: '片付け中', people: 3, billingAmount: 980 });
    harness.detectChanges();
    pane.querySelector<HTMLButtonElement>('.save-button')!.click();
    harness.detectChanges();

    expect(pane.querySelector<HTMLButtonElement>('.save-button')!.disabled).toBe(true);
    pane.querySelector<HTMLFormElement>('.edit-form')!.dispatchEvent(new Event('submit'));
    harness.detectChanges();

    const updateRequests = TestBed.inject(HttpTestingController).match('/api/cafe-status');
    expect(updateRequests).toHaveLength(1);
    updateRequests[0].flush(
      createTable('T01', { status: '片付け中', people: 3, billingAmount: 980 }),
    );
    await harness.fixture.whenStable();
  });

  it('別テーブルの後続更新を破棄せず受信順に処理する', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');
    const http = TestBed.inject(HttpTestingController);
    let header = harness.fixture.debugElement.query(By.directive(CafeInfoHeader))
      .componentInstance as CafeInfoHeader;

    detailPane(harness).querySelector<HTMLButtonElement>('.edit-button')!.click();
    header.form.patchValue({ status: '片付け中', people: 3, billingAmount: 980 });
    harness.detectChanges();
    detailPane(harness).querySelector<HTMLButtonElement>('.save-button')!.click();
    const firstUpdate = http.expectOne('/api/cafe-status');

    await clickTableRow(harness, 'T02');
    header = harness.fixture.debugElement.query(By.directive(CafeInfoHeader))
      .componentInstance as CafeInfoHeader;
    detailPane(harness).querySelector<HTMLButtonElement>('.edit-button')!.click();
    header.form.patchValue({ status: '未オーダー', people: 4, billingAmount: 0 });
    harness.detectChanges();
    detailPane(harness).querySelector<HTMLButtonElement>('.save-button')!.click();

    http.expectNone('/api/cafe-status');

    firstUpdate.flush(
      createTable('T01', { status: '片付け中', people: 3, billingAmount: 980 }),
    );
    const secondUpdate = http.expectOne('/api/cafe-status');
    expect(secondUpdate.request.body).toEqual({
      tableNumber: 'T02',
      status: '未オーダー',
      people: 4,
      billingAmount: 0,
    });
    secondUpdate.flush(
      createTable('T02', {
        classification: 'カウンター',
        status: '未オーダー',
        people: 4,
        billingAmount: 0,
      }),
    );
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(tableRow(harness, 'T01').textContent).toContain('片付け中');
    expect(tableRow(harness, 'T02').textContent).toContain('未オーダー');
    expect(tableRow(harness, 'T02').textContent).toContain('4名');
  });

  it('ドラッグで変えた分割比率が遷移や開閉のあとも維持される', async () => {
    configureCafeStatusTestBed();

    const harness = await openCafeStatus('/cafe-status/T01/overview');

    expect(splitSizes(harness)).toEqual([65, 35]);

    await dragGutterTo(harness, 30);

    expect(splitSizes(harness)).toEqual([30, 70]);

    await clickTableRow(harness, 'T02');

    expect(splitSizes(harness)).toEqual([30, 70]);

    await closeDetailPane(harness);
    await clickTableRow(harness, 'T01');

    expect(splitSizes(harness)).toEqual([30, 70]);
  });

  for (const unknownTableNumber of ['T99', 't01']) {
    it(`存在しないテーブル番号 ${unknownTableNumber} のURLでnot-foundを表示する`, async () => {
      configureCafeStatusTestBed();

      const harness = await openCafeStatus(`/cafe-status/${unknownTableNumber}/overview`);

      expect(detailPaneArea(harness).visible()).toBe(true);
      expect(detailPane(harness).textContent).toContain('テーブルが見つかりません');
      expect(detailPane(harness).textContent).toContain(unknownTableNumber);
      expect(detailPane(harness).querySelector('.info-header')).toBeNull();
      expect(tableRow(harness, 'T01').getAttribute('aria-selected')).toBe('false');
    });
  }
});

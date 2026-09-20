import { DatePipe } from '@angular/common';
import { ComponentRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CafeTable, TABLE_STATUSES } from '../../../../core/model/cafe-status.model';
import { CafeInfoHeader } from './cafe-info-header';

describe('CafeInfoHeader', () => {
  const table: CafeTable = {
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
  };

  const generatedAt = '2026-09-20T01:00:00.000Z';

  let componentRef: ComponentRef<CafeInfoHeader>;

  function query(selector: string): HTMLElement | null {
    return componentRef.location.nativeElement.querySelector(selector);
  }

  function click(selector: string): void {
    query(selector)?.click();
    TestBed.tick();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CafeInfoHeader] });
    componentRef = TestBed.createComponent(CafeInfoHeader).componentRef;
    componentRef.setInput('table', table);
    componentRef.setInput('generatedAt', generatedAt);
    TestBed.tick();
  });

  it('選択テーブルの要約を表示する', () => {
    expect(componentRef.location.nativeElement.textContent).toContain('T01');
    expect(componentRef.location.nativeElement.textContent).toContain('テーブル · 提供済');
  });

  it('dashboardの取得時刻を表示する', () => {
    const formatted = new DatePipe('en-US').transform(generatedAt, 'yyyy/MM/dd HH:mm:ss');

    expect(componentRef.location.nativeElement.textContent).toContain(`取得時刻 ${formatted}`);
  });

  it('取得時刻が未設定なら—を表示する', () => {
    componentRef.setInput('generatedAt', null);
    TestBed.tick();

    expect(componentRef.location.nativeElement.textContent).toContain('取得時刻 —');
  });

  it('表示中テーブルの現在値でフォームを初期化する', () => {
    expect(componentRef.instance.form.getRawValue()).toEqual({
      status: '提供済',
      people: 2,
      billingAmount: 1_360,
    });
  });

  it('別テーブルへ切り替えるとフォームを初期化する', () => {
    componentRef.instance.form.patchValue({ people: 8 });
    componentRef.setInput('table', { ...table, tableNumber: 'T02', people: 4 });
    TestBed.tick();

    expect(componentRef.instance.form.getRawValue().people).toBe(4);
  });

  it('同じテーブルの再取得では入力内容を保持する', () => {
    componentRef.instance.form.patchValue({ people: 8 });
    componentRef.setInput('table', { ...table, people: 4 });
    TestBed.tick();

    expect(componentRef.instance.form.getRawValue().people).toBe(8);
  });

  it('close操作を親へ通知する', () => {
    const closeRequested = vi.fn();
    componentRef.instance.closeRequested.subscribe(closeRequested);

    click('.close-button');

    expect(closeRequested).toHaveBeenCalledOnce();
  });

  it('初期表示では編集欄を表示しない', () => {
    expect(query('.edit-form')).toBeNull();
    expect(query('.edit-button')).not.toBeNull();
  });

  it('編集ボタンで編集欄を表示する', () => {
    click('.edit-button');

    expect(query('.edit-form')).not.toBeNull();
    expect(query('.edit-button')).toBeNull();
  });

  it('キャンセルで編集欄を閉じて入力内容を破棄する', () => {
    click('.edit-button');
    componentRef.instance.form.patchValue({ people: 8 });

    click('.cancel-button');

    expect(query('.edit-form')).toBeNull();
    expect(componentRef.instance.form.getRawValue().people).toBe(2);
  });

  it('別テーブルへ切り替えると編集を終了する', () => {
    click('.edit-button');

    componentRef.setInput('table', { ...table, tableNumber: 'T02' });
    TestBed.tick();

    expect(query('.edit-form')).toBeNull();
  });

  it('状態の入力欄に全ステータスと現在値を表示する', () => {
    click('.edit-button');
    const select = query('select[formControlName="status"]') as HTMLSelectElement;

    expect([...select.options].map((option) => option.value)).toEqual([...TABLE_STATUSES]);
    expect(select.value).toBe('提供済');
  });

  it('状態の選択をフォームへ反映する', () => {
    click('.edit-button');
    const select = query('select[formControlName="status"]') as HTMLSelectElement;

    select.value = '片付け中';
    select.dispatchEvent(new Event('change'));

    expect(componentRef.instance.form.getRawValue().status).toBe('片付け中');
  });

  it('保存で入力値とテーブル番号を親へ通知する', () => {
    const saveRequested = vi.fn();
    componentRef.instance.saveRequested.subscribe(saveRequested);

    click('.edit-button');
    componentRef.instance.form.patchValue({ status: '片付け中', people: 3, billingAmount: 980 });
    click('.save-button');

    expect(saveRequested).toHaveBeenCalledWith({
      tableNumber: 'T01',
      status: '片付け中',
      people: 3,
      billingAmount: 980,
    });
  });
});

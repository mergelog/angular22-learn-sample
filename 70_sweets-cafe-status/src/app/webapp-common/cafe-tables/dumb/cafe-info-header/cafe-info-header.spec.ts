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

  it('更新エラーを表示する', () => {
    componentRef.setInput('updateError', 'テーブルを更新できませんでした。');
    TestBed.tick();

    expect(query('.update-error')?.textContent).toContain('テーブルを更新できませんでした。');
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

  it('人数の入力欄に現在値を表示する', () => {
    click('.edit-button');
    const input = query('input[formControlName="people"]') as HTMLInputElement;

    expect(input.type).toBe('number');
    expect(input.value).toBe('2');
  });

  it('人数の入力をフォームへ反映する', () => {
    click('.edit-button');
    const input = query('input[formControlName="people"]') as HTMLInputElement;

    input.value = '5';
    input.dispatchEvent(new Event('input'));

    expect(componentRef.instance.form.getRawValue().people).toBe(5);
  });

  it('会計金額の入力欄に現在値を表示する', () => {
    click('.edit-button');
    const input = query('input[formControlName="billingAmount"]') as HTMLInputElement;

    expect(input.type).toBe('number');
    expect(input.value).toBe('1360');
  });

  it('会計金額の入力をフォームへ反映する', () => {
    click('.edit-button');
    const input = query('input[formControlName="billingAmount"]') as HTMLInputElement;

    input.value = '2480';
    input.dispatchEvent(new Event('input'));

    expect(componentRef.instance.form.getRawValue().billingAmount).toBe(2_480);
  });

  it.each([
    ['負の値', '-1'],
    ['小数', '2.5'],
    ['未入力', ''],
  ])('人数が%sならエラーを表示する', (_label, value) => {
    click('.edit-button');
    const input = query('input[formControlName="people"]') as HTMLInputElement;

    input.value = value;
    input.dispatchEvent(new Event('input'));
    TestBed.tick();

    expect(componentRef.instance.form.controls.people.invalid).toBe(true);
    expect(query('[data-error="people"]')?.textContent).toContain(
      '人数は0以上の整数で入力してください。',
    );
  });

  it('人数が0ならエラーを表示しない', () => {
    click('.edit-button');
    const input = query('input[formControlName="people"]') as HTMLInputElement;

    input.value = '0';
    input.dispatchEvent(new Event('input'));
    TestBed.tick();

    expect(componentRef.instance.form.controls.people.valid).toBe(true);
    expect(query('[data-error="people"]')).toBeNull();
  });

  it.each([
    ['負の値', '-1'],
    ['小数', '980.5'],
    ['未入力', ''],
  ])('会計金額が%sならエラーを表示する', (_label, value) => {
    click('.edit-button');
    const input = query('input[formControlName="billingAmount"]') as HTMLInputElement;

    input.value = value;
    input.dispatchEvent(new Event('input'));
    TestBed.tick();

    expect(componentRef.instance.form.controls.billingAmount.invalid).toBe(true);
    expect(query('[data-error="billingAmount"]')?.textContent).toContain(
      '会計金額は0以上の整数で入力してください。',
    );
  });

  it('会計金額が0ならエラーを表示しない', () => {
    click('.edit-button');
    const input = query('input[formControlName="billingAmount"]') as HTMLInputElement;

    input.value = '0';
    input.dispatchEvent(new Event('input'));
    TestBed.tick();

    expect(componentRef.instance.form.controls.billingAmount.valid).toBe(true);
    expect(query('[data-error="billingAmount"]')).toBeNull();
  });

  it('入力がinvalidなら保存ボタンを無効化する', () => {
    click('.edit-button');
    const input = query('input[formControlName="people"]') as HTMLInputElement;

    input.value = '-1';
    input.dispatchEvent(new Event('input'));
    TestBed.tick();

    expect((query('.save-button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('送信中は保存ボタンを無効化して保存中と表示する', () => {
    click('.edit-button');

    componentRef.setInput('saving', true);
    TestBed.tick();

    const saveButton = query('.save-button') as HTMLButtonElement;

    expect(saveButton.disabled).toBe(true);
    expect(saveButton.textContent).toContain('保存中');
  });

  it('invalidなsubmitは親へ通知しない', () => {
    const saveRequested = vi.fn();
    componentRef.instance.saveRequested.subscribe(saveRequested);

    click('.edit-button');
    const input = query('input[formControlName="people"]') as HTMLInputElement;

    input.value = '-1';
    input.dispatchEvent(new Event('input'));
    query('.edit-form')?.dispatchEvent(new Event('submit'));
    TestBed.tick();

    expect(saveRequested).not.toHaveBeenCalled();
  });

  it('送信中のsubmitは親へ通知しない', () => {
    const saveRequested = vi.fn();
    componentRef.instance.saveRequested.subscribe(saveRequested);

    click('.edit-button');
    componentRef.setInput('saving', true);
    TestBed.tick();

    query('.edit-form')?.dispatchEvent(new Event('submit'));
    TestBed.tick();

    expect(saveRequested).not.toHaveBeenCalled();
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

  it('更新失敗後も編集欄と入力内容を維持する', () => {
    click('.edit-button');
    componentRef.instance.form.patchValue({ status: '片付け中', people: 3, billingAmount: 980 });

    componentRef.setInput('saving', true);
    TestBed.tick();
    componentRef.setInput('saving', false);
    componentRef.setInput('table', { ...table });
    TestBed.tick();

    expect(query('.edit-form')).not.toBeNull();
    expect(componentRef.instance.form.getRawValue()).toEqual({
      status: '片付け中',
      people: 3,
      billingAmount: 980,
    });
  });
});

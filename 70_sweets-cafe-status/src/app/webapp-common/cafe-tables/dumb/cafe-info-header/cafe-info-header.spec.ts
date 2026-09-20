import { ComponentRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CafeTable } from '../../../../core/model/cafe-status.model';
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

  let componentRef: ComponentRef<CafeInfoHeader>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CafeInfoHeader] });
    componentRef = TestBed.createComponent(CafeInfoHeader).componentRef;
    componentRef.setInput('table', table);
    componentRef.changeDetectorRef.detectChanges();
  });

  it('選択テーブルの要約を表示する', () => {
    expect(componentRef.location.nativeElement.textContent).toContain('T01');
    expect(componentRef.location.nativeElement.textContent).toContain('テーブル · 提供済');
  });

  it('close操作を親へ通知する', () => {
    const closeRequested = vi.fn();
    componentRef.instance.closeRequested.subscribe(closeRequested);

    componentRef.location.nativeElement.querySelector('button').click();

    expect(closeRequested).toHaveBeenCalledOnce();
  });
});

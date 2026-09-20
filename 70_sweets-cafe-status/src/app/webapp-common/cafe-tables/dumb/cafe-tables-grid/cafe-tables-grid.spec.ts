import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafeTable } from '../../../../core/model/cafe-status.model';
import { CafeTablesGrid } from './cafe-tables-grid';

const table: CafeTable = {
  tableNumber: 'T01',
  classification: 'カウンター',
  status: '調理中',
  guestIds: ['guest-1', 'guest-2'],
  予約: [],
  stateElapsedSeconds: 125,
  statusDurationsSeconds: {
    空き: 10,
    未オーダー: 20,
    調理中: 30,
    提供済: 40,
    片付け中: 50,
  },
  people: 2,
  billingAmount: 2_400,
  dailyUsageRate: 50,
};

describe('CafeTablesGrid', () => {
  let component: CafeTablesGrid;
  let fixture: ComponentFixture<CafeTablesGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeTablesGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(CafeTablesGrid);
    fixture.componentRef.setInput('tables', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('API・Store・Routerのproviderなしで作成できる', () => {
    expect(component).toBeTruthy();
  });

  it('tables inputで渡したテーブルを描画する', () => {
    fixture.componentRef.setInput('tables', [table]);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('tbody tr') as HTMLTableRowElement;

    expect(row.textContent).toContain('T01');
    expect(row.textContent).toContain('カウンター');
    expect(row.textContent).toContain('調理中');
    expect(row.textContent).toContain('2名');
    expect(row.textContent).toContain('¥2,400');
    expect(row.textContent).toContain('2分 5秒');
  });

  it('選択中のテーブル番号に一致する行を強調表示する', () => {
    fixture.componentRef.setInput('tables', [table]);
    fixture.componentRef.setInput('selectedTableNumber', 'T01');
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('tbody tr') as HTMLTableRowElement;

    expect(row.classList).toContain('selected');
    expect(row.getAttribute('aria-selected')).toBe('true');
  });

  it('行をクリックするとtableSelectedでテーブル番号を通知する', () => {
    const tableSelected = vi.fn();
    component.tableSelected.subscribe(tableSelected);
    fixture.componentRef.setInput('tables', [table]);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('tbody tr') as HTMLTableRowElement;
    row.click();

    expect(tableSelected).toHaveBeenCalledOnce();
    expect(tableSelected).toHaveBeenCalledWith('T01');
  });
});

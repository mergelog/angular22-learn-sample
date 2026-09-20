import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafeTablesGrid } from './cafe-tables-grid';

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
});

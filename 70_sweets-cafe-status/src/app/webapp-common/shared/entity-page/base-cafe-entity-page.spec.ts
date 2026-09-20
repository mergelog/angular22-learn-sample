import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { BaseCafeEntityPage } from './base-cafe-entity-page';

@Component({ template: '' })
class TestCafeEntityPage extends BaseCafeEntityPage {
  readonly currentTableNumber = this.selectedTableNumber;

  constructor() {
    super();
  }
}

describe('BaseCafeEntityPage', () => {
  it('URLのtableNumberを初期表示と戻る・進む相当のナビゲーション後に取得する', () => {
    const events = new Subject<NavigationEnd>();
    const route = {
      firstChild: {
        snapshot: { paramMap: convertToParamMap({ tableNumber: 'T01' }) },
      },
    };

    TestBed.configureTestingModule({
      imports: [TestCafeEntityPage],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: { events, navigate: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(TestCafeEntityPage);
    expect(fixture.componentInstance.currentTableNumber()).toBe('T01');

    route.firstChild.snapshot.paramMap = convertToParamMap({ tableNumber: 'T02' });
    events.next(new NavigationEnd(1, '/cafe-status/T02/overview', '/cafe-status/T02/overview'));

    expect(fixture.componentInstance.currentTableNumber()).toBe('T02');

    route.firstChild.snapshot.paramMap = convertToParamMap({ tableNumber: 'T01' });
    events.next(new NavigationEnd(2, '/cafe-status/T01/overview', '/cafe-status/T01/overview'));

    expect(fixture.componentInstance.currentTableNumber()).toBe('T01');

    route.firstChild.snapshot.paramMap = convertToParamMap({ tableNumber: 'T02' });
    events.next(new NavigationEnd(3, '/cafe-status/T02/overview', '/cafe-status/T02/overview'));

    expect(fixture.componentInstance.currentTableNumber()).toBe('T02');
  });
});

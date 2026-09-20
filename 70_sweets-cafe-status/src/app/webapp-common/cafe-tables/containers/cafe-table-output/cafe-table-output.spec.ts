import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';

import {
  CAFE_STATUS_FEATURE_KEY,
  initialCafeStatusState,
} from '../../../../feature/cafe-status/state/cafe-status.reducer';
import { BaseCafeTableOutput } from './base-cafe-table-output';
import { CafeTableOutput } from './cafe-table-output';

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
});

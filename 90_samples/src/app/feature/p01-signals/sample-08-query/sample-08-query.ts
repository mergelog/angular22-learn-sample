import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
import { Sample08ProjectedNote } from './children/sample-08-projected-note/sample-08-projected-note';
import { Sample08ProjectionHost } from './children/sample-08-projection-host/sample-08-projection-host';

@Component({
  selector: 'app-sample-08-query',
  imports: [P01SignalsNavi, Sample08ProjectedNote, Sample08ProjectionHost],
  templateUrl: './sample-08-query.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample08Query {
  // [■観点:viewChild] 自身のテンプレート内にある要素をSignalとして参照する。
  readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');
  focusInput(): void {
    this.nameInput().nativeElement.focus();
  }
}

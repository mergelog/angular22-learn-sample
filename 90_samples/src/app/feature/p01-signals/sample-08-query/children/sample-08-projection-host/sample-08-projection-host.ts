import { ChangeDetectionStrategy, Component, contentChild } from '@angular/core';
import { Sample08ProjectedNote } from '../sample-08-projected-note/sample-08-projected-note';

@Component({
  selector: 'app-sample-08-projection-host',
  template:
    "<ng-content /> <p>contentChildで見つかったか: {{ projectedNote() ? 'はい' : 'いいえ' }}</p>",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample08ProjectionHost {
  // [■観点:contentChild] ng-content経由で渡された子をSignalとして参照する。
  readonly projectedNote = contentChild(Sample08ProjectedNote);
}

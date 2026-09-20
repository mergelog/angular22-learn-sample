import { ChangeDetectionStrategy, Component, ElementRef, viewChildren } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
import { Sample17ProjectedTags } from './children/sample-17-projected-tags/sample-17-projected-tags';
import { Sample17Tag } from './children/sample-17-tag/sample-17-tag';
@Component({
  selector: 'app-sample-17-multiple-queries',
  imports: [P01SignalsNavi, Sample17ProjectedTags, Sample17Tag],
  templateUrl: './sample-17-multiple-queries.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample17MultipleQueries {
  // [■観点:viewChildren] 同じテンプレート参照を持つ複数要素を、配列のSignalとして取得する。
  readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('actionButton');
  buttonCount(): number {
    return this.buttons().length;
  }
}

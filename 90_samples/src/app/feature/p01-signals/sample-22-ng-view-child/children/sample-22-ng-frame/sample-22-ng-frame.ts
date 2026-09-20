import { ChangeDetectionStrategy, Component, contentChild, viewChild } from '@angular/core';
import { Sample22NgPanel } from '../sample-22-ng-panel/sample-22-ng-panel';

@Component({
  selector: 'app-sample-22-ng-frame',
  template: `
    <ng-content />
    <p>viewChild: {{ viewPanel() ? '取れた' : '取れない' }}</p>
    <p>contentChild: {{ contentPanel() ? '取れた' : '取れない' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample22NgFrame {
  // 以下は ng-content で親から差し込まれた子（自分のHTMLに書いていない）という理由で取れないのでNG
  readonly viewPanel = viewChild(Sample22NgPanel);
  readonly contentPanel = contentChild(Sample22NgPanel);
}

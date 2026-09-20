import { ChangeDetectionStrategy, Component, contentChild, viewChild } from '@angular/core';
import { Sample22OkPanel } from '../sample-22-ok-panel/sample-22-ok-panel';

@Component({
  selector: 'app-sample-22-ok-frame',
  imports: [Sample22OkPanel],
  template: `
    <app-sample-22-ok-panel />
    <p>viewChild: {{ viewPanel() ? '取れた(OK)' : '取れない' }}</p>
    <p>contentChild: {{ contentPanel() ? '取れた' : '取れない!!' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample22OkFrame {
  readonly viewPanel = viewChild(Sample22OkPanel);
  readonly contentPanel = contentChild(Sample22OkPanel); // 取れない
}

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample-22-ok-panel',
  template: '<p>panel</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample22OkPanel {}

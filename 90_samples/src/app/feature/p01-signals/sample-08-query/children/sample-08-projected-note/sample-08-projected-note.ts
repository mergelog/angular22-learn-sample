import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({
  selector: 'app-sample-08-projected-note',
  template: '<p>投影された子コンポーネント</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample08ProjectedNote {}

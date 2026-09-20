import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
import { Sample07Stepper } from './children/sample-07-stepper/sample-07-stepper';
@Component({
  selector: 'app-sample-07-model',
  imports: [P01SignalsNavi, Sample07Stepper],
  templateUrl: './sample-07-model.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample07Model {
  readonly count = signal(0);
}

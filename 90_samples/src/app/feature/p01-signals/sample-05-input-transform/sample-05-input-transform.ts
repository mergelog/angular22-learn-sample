import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
import { Sample05Name } from './children/sample-05-name/sample-05-name';
@Component({
  selector: 'app-sample-05-input-transform',
  imports: [P01SignalsNavi, Sample05Name],
  templateUrl: './sample-05-input-transform.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample05InputTransform {
  readonly rawName = signal('  Angular Signals  ');
}

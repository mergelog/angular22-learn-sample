import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
import { Sample22NgFrame } from './children/sample-22-ng-frame/sample-22-ng-frame';
import { Sample22NgPanel } from './children/sample-22-ng-panel/sample-22-ng-panel';

@Component({
  selector: 'app-sample-22-ng-view-child',
  imports: [P01SignalsNavi, Sample22NgFrame, Sample22NgPanel],
  templateUrl: './sample-22-ng-view-child.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample22NgViewChild {}

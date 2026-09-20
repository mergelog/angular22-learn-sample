import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
import { Sample22OkFrame } from './children/sample-22-ok-frame/sample-22-ok-frame';

@Component({
  selector: 'app-sample-22-ok-view-child',
  imports: [P01SignalsNavi, Sample22OkFrame],
  templateUrl: './sample-22-ok-view-child.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample22OkViewChild {}

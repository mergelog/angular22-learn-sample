import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
import { Sample06Notice } from './children/sample-06-notice/sample-06-notice';
@Component({
  selector: 'app-sample-06-output',
  imports: [P01SignalsNavi, Sample06Notice],
  templateUrl: './sample-06-output.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample06Output {
  readonly notice = signal('まだ通知はない');
  receive(message: string): void {
    this.notice.set(message);
  }
}

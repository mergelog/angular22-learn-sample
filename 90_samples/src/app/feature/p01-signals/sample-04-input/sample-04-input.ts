import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
import { Sample04Message } from './children/sample-04-message/sample-04-message';
@Component({
  selector: 'app-sample-04-input',
  imports: [P01SignalsNavi, Sample04Message],
  templateUrl: './sample-04-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample04Input {
  readonly message = signal('親の初期メッセージ');
  change(): void {
    this.message.set('親から更新したメッセージ');
  }
}

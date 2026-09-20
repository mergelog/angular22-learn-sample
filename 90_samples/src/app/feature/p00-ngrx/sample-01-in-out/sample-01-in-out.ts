import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { InnerA } from './children/inner-a/inner-a';

@Component({
  selector: 'app-sample-01-in-out',
  imports: [P00NgrxNavi, InnerA],
  styleUrl: './sample-01-in-out.scss',
  templateUrl: './sample-01-in-out.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample01InOut {
  readonly messageForChild = signal('親から子へ渡したメッセージ初期値');
  readonly count = signal(0);
  readonly messageFromChild = signal('まだ通知はありません');

  changeMessage(): void {
    this.messageForChild.set('親がメッセージを変更しました');
  }

  receiveMessage(message: string): void {
    this.messageFromChild.set(message);
  }
}

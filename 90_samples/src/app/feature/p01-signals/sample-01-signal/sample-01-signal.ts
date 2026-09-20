import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

@Component({
  selector: 'app-sample-01-signal',
  imports: [P01SignalsNavi],
  templateUrl: './sample-01-signal.html',
  styleUrl: './sample-01-signal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample01Signal {
  // [■観点:signal] 値の読み取りと更新を通知できる状態。テンプレートでは count() として読む。
  readonly count = signal(0);

  increment(): void {
    // [■観点:update] 現在値から次の値を作る更新。非同期処理など、現在値を基準にする場合にも安全。
    this.count.update((currentCount) => currentCount + 1);
  }

  decrement(): void {
    this.count.update((currentCount) => currentCount - 1);
  }

  reset(): void {
    // [■観点:set] 現在値に関係なく、状態を指定した値で置き換える。
    this.count.set(0);
  }
}

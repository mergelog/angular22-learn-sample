import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
@Component({
  selector: 'app-sample-19-effect-cleanup',
  imports: [P01SignalsNavi],
  templateUrl: './sample-19-effect-cleanup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample19EffectCleanup {
  readonly enabled = signal(false);
  readonly ticks = signal(0);
  // [■観点:onCleanup] effectの再実行・破棄前に、前回作成したタイマーを確実に解除する。
  private readonly timer = effect((onCleanup) => {
    if (!this.enabled()) return;
    const timerId = window.setInterval(() => this.ticks.update((value) => value + 1), 1000);
    onCleanup(() => window.clearInterval(timerId));
  });
  toggle(): void {
    this.enabled.update((value) => !value);
  }
}

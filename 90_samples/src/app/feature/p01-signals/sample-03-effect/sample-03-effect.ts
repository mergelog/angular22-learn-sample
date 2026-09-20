import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

@Component({
  selector: 'app-sample-03-effect',
  imports: [P01SignalsNavi],
  templateUrl: './sample-03-effect.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample03Effect {
  readonly theme = signal<'light' | 'dark'>('light');
  // [■観点:effect] Signalを読んだ副作用。値が変わるたびに再実行され、ここではブラウザの表示設定を更新する。
  private readonly syncTheme = effect(() => {
    document.documentElement.dataset['sampleTheme'] = this.theme();
  });
  toggle(): void {
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }
}

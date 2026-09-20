import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
@Component({
  selector: 'app-sample-18-readonly',
  imports: [P01SignalsNavi],
  templateUrl: './sample-18-readonly.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample18Readonly {
  private readonly writableTemperature = signal(20);
  // [■観点:asReadonly] 消費側には読み取りだけを公開し、更新APIを隠す。
  readonly temperature = this.writableTemperature.asReadonly();
  warmUp(): void {
    this.writableTemperature.update((value) => value + 1);
  }
}

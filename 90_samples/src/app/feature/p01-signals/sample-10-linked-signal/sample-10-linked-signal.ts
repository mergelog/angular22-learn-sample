import { ChangeDetectionStrategy, Component, linkedSignal, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

@Component({
  selector: 'app-sample-10-linked-signal',
  imports: [P01SignalsNavi],
  templateUrl: './sample-10-linked-signal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample10LinkedSignal {
  readonly options = signal(['standard', 'express']);
  // [■観点:linkedSignal] optionsが変われば先頭値に戻るが、選択中の値はローカルで変更できる。
  readonly selected = linkedSignal(() => this.options()[0]);
  select(option: string): void {
    this.selected.set(option);
  }
  replaceOptions(): void {
    this.options.set(['economy', 'priority']);
  }
}

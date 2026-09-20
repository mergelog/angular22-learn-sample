import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

@Component({
  selector: 'app-sample-02-computed',
  imports: [P01SignalsNavi],
  templateUrl: './sample-02-computed.html',
  styleUrl: './sample-02-computed.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample02Computed {
  readonly price = signal(1200);
  readonly quantity = signal(1);
  // [■観点:computed] 依存するSignalが変わった時だけ、合計を自動で再計算する読み取り専用Signal。
  readonly total = computed(() => this.price() * this.quantity());
  changeQuantity(amount: number): void {
    this.quantity.update((value) => Math.max(1, value + amount));
  }
}

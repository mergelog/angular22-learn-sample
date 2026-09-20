import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';
import { increment, signalComparisonFeature } from './comparison.store';

@Component({
  selector: 'app-learn-03-store-select-signal-to-signal',
  imports: [P04StoreNavi],
  templateUrl: './learn-03-store-select-signal-to-signal.html',
  styleUrl: './learn-03-store-select-signal-to-signal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn03StoreSelectSignalToSignal {
  private readonly store = inject(Store);

  // どちらもSignalが返却される
  readonly countBySelectSignal = this.store.selectSignal(signalComparisonFeature.selectCount);
  readonly countByToSignal = toSignal(this.store.select(signalComparisonFeature.selectCount), {
    requireSync: true,
  });

  increment(): void {
    this.store.dispatch(increment());
  }
}

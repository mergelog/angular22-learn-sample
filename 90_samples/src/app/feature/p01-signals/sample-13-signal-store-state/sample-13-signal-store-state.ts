import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

const Sample13Store = signalStore(
  withState({ count: 0, label: 'SignalStore' }),
  withMethods((store) => ({
    increment: () => patchState(store, (state) => ({ count: state.count + 1 })),
  })),
);

@Component({
  selector: 'app-sample-13-signal-store-state',
  imports: [P01SignalsNavi],
  providers: [Sample13Store],
  templateUrl: './sample-13-signal-store-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample13SignalStoreState {
  readonly store = inject(Sample13Store);
  increment(): void {
    this.store.increment();
  }
}

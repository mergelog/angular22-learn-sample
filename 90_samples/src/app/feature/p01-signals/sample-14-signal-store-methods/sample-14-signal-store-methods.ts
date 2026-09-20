import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

const Sample14Store = signalStore(
  withState({ count: 0 }),
  withComputed(({ count }) => ({ doubled: computed(() => count() * 2) })),
  withMethods((store) => ({
    increment: () => patchState(store, (state) => ({ count: state.count + 1 })),
    reset: () => patchState(store, { count: 0 }),
  })),
);

@Component({
  selector: 'app-sample-14-signal-store-methods',
  imports: [P01SignalsNavi],
  providers: [Sample14Store],
  templateUrl: './sample-14-signal-store-methods.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample14SignalStoreMethods {
  readonly store = inject(Sample14Store);
}

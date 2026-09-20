import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

const withLearningMessage = () =>
  withMethods(() => ({ learningMessage: () => 'custom with... で再利用する機能を追加できる' }));

const Sample15Store = signalStore(
  withState({ initialized: false }),
  withMethods((store) => ({ markInitialized: () => patchState(store, { initialized: true }) })),
  withHooks({
    onInit: (store) => store.markInitialized(),
    onDestroy: () => console.info('Sample15Store destroyed'),
  }),
  withLearningMessage(),
);

@Component({
  selector: 'app-sample-15-signal-store-hooks',
  imports: [P01SignalsNavi],
  providers: [Sample15Store],
  templateUrl: './sample-15-signal-store-hooks.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample15SignalStoreHooks {
  readonly store = inject(Sample15Store);
  readonly message = signal('onInitがStore初期化時に実行される');
}

import { inject, runInInjectionContext } from '@angular/core';
import { signalStore, type, withState } from '@ngrx/signals';
import {
  Dispatcher,
  Events,
  eventGroup,
  injectDispatch,
  on,
  ReducerEvents,
  withEventHandlers,
  withReducer,
} from '@ngrx/signals/events';
import { tap } from 'rxjs';
import { createTerminalInjector } from '../../injector';

const counterEvents = eventGroup({ // createActionGroup 相当
  source: 'Counter',
  events: { add: type<number>() },
});

const CounterStore = signalStore(
  withState({ count: 0 }),
  withReducer(
    on(counterEvents.add, ({ payload }, state) => ({ count: state.count + payload })),
  ),
  withEventHandlers((store, events = inject(Events)) => ({
    log$: events.on(counterEvents.add)
      .pipe(
        tap(({ payload }) => console.log(`受信: +${payload} / 合計: ${store.count()}`))
      ),
  })),
);

export function runSignalStoreEventsExample(): void {
  // ブラウザなら bootstrapApplication が platform → root と injector を積んでくれるが
  // ターミナル(Node)実行にはそれが無い
  // 親が Injector.NULL なので、「親を辿れば見つかる」が一切効かず
  // 必要なものは全部この配列に自分で並べる必要がある。
  const injector = createTerminalInjector([CounterStore, Dispatcher, Events, ReducerEvents]);

  try {
    runInInjectionContext(injector, () => {
      const store = inject(CounterStore);
      const dispatcher = inject(Dispatcher);
      const dispatch = injectDispatch(counterEvents);

      console.log('初期値:', store.count());
      dispatcher.dispatch(counterEvents.add(2));
      dispatch.add(3);
      console.log('最終値:', store.count());
    });
  } finally {
    injector.destroy();
  }
}

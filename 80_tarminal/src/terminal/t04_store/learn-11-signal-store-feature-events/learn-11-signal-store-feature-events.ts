import { inject, runInInjectionContext } from '@angular/core';
import { signalStore, signalStoreFeature, type, withState } from '@ngrx/signals';
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

const counterEvents = eventGroup({
  source: 'Counter',
  events: { add: type<number>() },
});

function withCounterEvents() {
  return signalStoreFeature(
    withState({ count: 0 }),
    withReducer(
      on(counterEvents.add, ({ payload }, state) => ({ count: state.count + payload })),
    ),
    withEventHandlers((store, events = inject(Events)) => ({
      log$: events.on(counterEvents.add).pipe(tap(({ payload }) => console.log(`受信: +${payload} / 合計: ${store.count()}`))),
    })),
  );
}

const CounterStore = signalStore(withCounterEvents());

export function runSignalStoreFeatureEventsExample(): void {
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

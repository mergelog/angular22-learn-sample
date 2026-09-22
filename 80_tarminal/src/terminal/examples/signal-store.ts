import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { createTerminalInjector } from '../injector';

const CounterStore = signalStore(
  withState({ count: 0 }),
  withMethods((store) => ({
    increment(): void {
      patchState(store, { count: store.count() + 1 });
    },
  })),
);

export function runSignalStoreExample(): void {
  const injector = createTerminalInjector([CounterStore]);

  try {
    const store = injector.get(CounterStore);

    console.log('SignalStore before:', store.count());
    store.increment();
    console.log('SignalStore after: ', store.count());
  } finally {
    injector.destroy();
  }
}

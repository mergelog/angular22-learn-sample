import { createAction, createReducer, on, provideStore, Store } from '@ngrx/store';
import { createTerminalInjector } from '../injector';

const increment = createAction('[Terminal] Increment');
const counterReducer = createReducer(0, on(increment, (count) => count + 1));

interface AppState {
  count: number;
}

export function runNgRxExample(): void {
  const injector = createTerminalInjector([provideStore({ count: counterReducer })]);

  try {
    const store = injector.get(Store<AppState>);
    const count = store.selectSignal((state) => state.count);

    console.log('NgRx before:', count());
    store.dispatch(increment());
    console.log('NgRx after: ', count());
  } finally {
    injector.destroy();
  }
}

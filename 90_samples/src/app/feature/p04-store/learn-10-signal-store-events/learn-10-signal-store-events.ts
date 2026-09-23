import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { signalStore, type, withState } from '@ngrx/signals';
import {
  Dispatcher,
  Events,
  eventGroup,
  injectDispatch,
  on,
  provideDispatcher,
  withEventHandlers,
  withReducer,
} from '@ngrx/signals/events';
import { tap } from 'rxjs';
import { CounterEventLog } from '../counter-event-log';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

const counterEvents = eventGroup({
  source: 'Counter',
  events: { add: type<number>() },
});

const CounterStore = signalStore(
  withState({ count: 0 }),
  withReducer(on(counterEvents.add, ({ payload }, state) => ({ count: state.count + payload }))),
  withEventHandlers((store, events = inject(Events), log = inject(CounterEventLog)) => ({
    log$: events
      .on(counterEvents.add)
      .pipe(tap(({ payload }) => log.record(payload, store.count()))),
  })),
);

@Component({
  selector: 'app-learn-10-signal-store-events',
  imports: [P04StoreNavi],
  providers: [CounterStore, CounterEventLog, provideDispatcher()],
  templateUrl: './learn-10-signal-store-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn10SignalStoreEvents {
  readonly store = inject(CounterStore);
  readonly log = inject(CounterEventLog);
  readonly dispatch = injectDispatch(counterEvents);
  private readonly dispatcher = inject(Dispatcher);

  addWithDispatcher(): void {
    this.dispatcher.dispatch(counterEvents.add(2));
  }
}

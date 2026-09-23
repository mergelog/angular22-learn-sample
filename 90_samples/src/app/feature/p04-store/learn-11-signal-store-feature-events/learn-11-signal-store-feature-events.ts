import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { withDevtools, withGlitchTracking, withTrackedReducer } from '@ngrx-toolkit/core';
import { signalStore, signalStoreFeature, type, withState } from '@ngrx/signals';
import {
  Dispatcher,
  Events,
  eventGroup,
  injectDispatch,
  on,
  provideDispatcher,
  withEventHandlers,
} from '@ngrx/signals/events';
import { tap } from 'rxjs';
import { CounterEventLog } from '../counter-event-log';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

const counterEvents = eventGroup({
  source: 'Counter Feature',
  events: { add: type<number>() },
});

function withCounterEvents() {
  return signalStoreFeature(
    withState({ count: 0 }),
    withTrackedReducer(on(counterEvents.add, ({ payload }, state) => ({ count: state.count + payload }))),
    withEventHandlers((store, events = inject(Events), log = inject(CounterEventLog)) => ({
      log$: events
        .on(counterEvents.add)
        .pipe(tap(({ payload }) => log.record(payload, store.count()))),
    })),
  );
}

const CounterStore = signalStore(
  withDevtools('learn-11-counter', withGlitchTracking()),
  withCounterEvents(),
);

@Component({
  selector: 'app-learn-11-signal-store-feature-events',
  imports: [P04StoreNavi],
  providers: [CounterStore, CounterEventLog, provideDispatcher()],
  templateUrl: './learn-11-signal-store-feature-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn11SignalStoreFeatureEvents {
  readonly store = inject(CounterStore);
  readonly log = inject(CounterEventLog);
  readonly dispatch = injectDispatch(counterEvents);
  private readonly dispatcher = inject(Dispatcher);

  addWithDispatcher(): void {
    this.dispatcher.dispatch(counterEvents.add(2));
  }
}

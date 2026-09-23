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
  events: {
    add: type<number>()
  },
});

/*
`signalStoreFeature()` の利点は、**複数の Store 設定を、別の Store でも使える1つの部品にまとめられること**です。

[learn-10](./90_samples/src/app/feature/p04-store/learn-10-signal-store-events/learn-10-signal-store-events.ts:23) 
は `withState`・`withTrackedReducer`・`withEventHandlers` を Store に直接並べています。

[learn-11](./90_samples/src/app/feature/p04-store/learn-11-signal-store-feature-events/learn-11-signal-store-feature-events.ts:24) 
はその3つを `withCounterEvents()` にまとめ、Store 側から1つの Feature として組み込んでいます。NgRx もこの用途を「カスタム Store Feature」として提供しています。
[NgRx 公式ガイド](https://ngrx.io/guide/signals/signal-store/custom-store-features)

この2例では処理内容はほぼ同じです。`signalStoreFeature()` を使っただけで、イベント処理が速くなったり、別の仕組みになったりはしません。
**今の learn-11 で得ている主な利点は、関連する設定をひとまとまりにできること**です。
別の CounterStore でも同じ状態・更新・ログ処理が必要になれば、`withCounterEvents()` を再利用できます。

一度しか使わない小さな Store なら learn-10 の直接記述も十分わかりやすいです。
なお、再利用先でも `CounterEventLog` など、この Feature が依存するものは用意する必要があります。

*/
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

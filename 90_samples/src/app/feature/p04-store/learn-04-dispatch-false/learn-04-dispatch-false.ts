import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';
import { DispatchFalseTracker, runSideEffect } from './dispatch-false.effect';

@Component({
  selector: 'app-learn-04-dispatch-false',
  imports: [P04StoreNavi],
  templateUrl: './learn-04-dispatch-false.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn04DispatchFalse {
  private readonly store = inject(Store);
  private readonly tracker = inject(DispatchFalseTracker);

  readonly executionCount = this.tracker.count;

  run(): void {
    this.store.dispatch(runSideEffect());
  }
}

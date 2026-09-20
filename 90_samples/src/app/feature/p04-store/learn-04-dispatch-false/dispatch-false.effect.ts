import { Injectable, inject, signal } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { createAction } from '@ngrx/store';
import { tap } from 'rxjs';

export const runSideEffect = createAction('[Dispatch False] Run Side Effect');

@Injectable()
export class DispatchFalseTracker {
  private readonly countState = signal(0);

  readonly count = this.countState.asReadonly();

  record(): void {
    this.countState.update((count) => count + 1);
  }
}

export const trackDispatchFalseRun = createEffect(
  (actions$ = inject(Actions), tracker = inject(DispatchFalseTracker)) =>
    actions$.pipe(
      ofType(runSideEffect),
      tap(() => tracker.record()),
    ),
  { functional: true, dispatch: false },
);

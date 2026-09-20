import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, takeUntil, timer } from 'rxjs';

import { FooApi } from './foo.api';
import { FooActions } from './foo.actions';
import { FOO_POLLING_INTERVAL_MS } from './foo.config';
import { mapFooListResponse } from './foo.mapper';

@Injectable()
export class FooEffects {
  private readonly actions$ = inject(Actions);
  private readonly fooApi = inject(FooApi);
  private readonly pollingIntervalMs = inject(FOO_POLLING_INTERVAL_MS);

  readonly startPolling$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FooActions.pollingStarted),
      switchMap(() =>
        timer(0, this.pollingIntervalMs).pipe(
          map(() => FooActions.loadRequested()),
          takeUntil(this.actions$.pipe(ofType(FooActions.pollingStopped))),
        ),
      ),
    ),
  );

  readonly loadFooList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FooActions.loadRequested),
      exhaustMap(() =>
        this.fooApi.getFooList().pipe(
          map(mapFooListResponse),
          map(({ items }) => FooActions.loadSucceeded({ items })),
          catchError((error: unknown) => of(FooActions.loadFailed({ error: getErrorMessage(error) }))),
        ),
      ),
    ),
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.message) {
    return error.message;
  }

  return 'Failed to load foo list.';
}

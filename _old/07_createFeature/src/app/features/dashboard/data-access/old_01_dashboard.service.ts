import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, shareReplay, switchMap, timer } from 'rxjs';

import type { Dashboard } from './dashboard.model';

const POLLING_INTERVAL_MS = 5_000;

@Injectable()
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly dashboard$ = timer(0, POLLING_INTERVAL_MS).pipe(
    switchMap(() =>
      this.http.get<Dashboard>('/api/dashboard').pipe(
        catchError((error: unknown) => {
          console.error('Failed to load dashboard.', error);

          return EMPTY;
        }),
      ),
    ),
    takeUntilDestroyed(this.destroyRef),
    shareReplay({
      bufferSize: 1,
      refCount: false,
    }),
  );
}

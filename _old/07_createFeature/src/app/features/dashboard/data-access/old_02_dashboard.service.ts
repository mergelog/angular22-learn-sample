import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  EMPTY,
  ReplaySubject,
  Subject,
  catchError,
  distinctUntilChanged,
  exhaustMap,
  map,
  merge,
  switchMap,
  take,
  tap,
  timer,
} from 'rxjs';

import type { Dashboard, Lot } from './dashboard.model';
import { DashboardApi } from './dashboard.api';
import { mapDashboardResponse } from './dashboard.mapper';
import { DASHBOARD_POLLING_INTERVAL_MS } from '../store/dashboard.config';

/**
 * NgRx を使わずに Dashboard の共有状態をサービス内に集約する比較用実装。
 *
 * 利用する場合は Dashboard ルートの providers に登録する。現在のアプリからは
 * 意図的に未登録であり、実行には使用されない。
 */
@Injectable()
export class Old02DashboardService {
  private readonly dashboardApi = inject(DashboardApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pollingIntervalMs = inject(DASHBOARD_POLLING_INTERVAL_MS);

  private readonly stateSubject = new BehaviorSubject<Old02DashboardState>(initialDashboardState);
  private readonly loadRequestedSubject = new Subject<DashboardLoadReason>();
  private readonly pollingEnabledSubject = new BehaviorSubject(false);
  private readonly transitionSubject = new ReplaySubject<DashboardTransition>(100);

  /** 同じサービスインスタンスを注入する全コンポーネントで共有される状態。 */
  readonly state$ = this.stateSubject.asObservable();
  readonly viewModel$ = this.state$;

  /** 状態遷移の監査・デバッグ・テスト用のログ。直近100件を再生する。 */
  readonly transitions$ = this.transitionSubject.asObservable();

  constructor() {
    const pollingRequests$ = this.pollingEnabledSubject.pipe(
      distinctUntilChanged(),
      switchMap((enabled) =>
        enabled
          ? timer(0, this.pollingIntervalMs).pipe(map((): DashboardLoadReason => 'polling'))
          : EMPTY,
      ),
    );

    merge(this.loadRequestedSubject, pollingRequests$)
      .pipe(
        tap((reason) => this.recordTransition('load-requested', reason)),
        // 取得中の手動更新・ポーリング要求は捨て、HTTP リクエストを重複させない。
        exhaustMap((reason) => this.loadDashboard(reason)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.startPolling();
  }

  refresh(): void {
    this.loadRequestedSubject.next('manual');
  }

  startPolling(): void {
    if (this.pollingEnabledSubject.value) {
      return;
    }

    this.pollingEnabledSubject.next(true);
    this.updateState((state) => ({ ...state, polling: true }));
    this.recordTransition('polling-started');
  }

  stopPolling(): void {
    if (!this.pollingEnabledSubject.value) {
      return;
    }

    this.pollingEnabledSubject.next(false);
    this.updateState((state) => ({ ...state, polling: false }));
    this.recordTransition('polling-stopped');
  }

  /**
   * 保持中の値は表示したままキャッシュだけを無効化し、直後に再取得する。
   */
  invalidateCache(): void {
    this.updateState((state) => ({ ...state, cacheValid: false }));
    this.recordTransition('cache-invalidated');
    this.loadRequestedSubject.next('cache-invalidated');
  }

  /**
   * 保存 API を呼ぶ前に画面を更新し、失敗時は直前の状態へ戻す。
   * DashboardApi に更新 API がないため、呼び出し元から保存処理を受け取る。
   */
  optimisticallyUpdateLot(
    lotName: string,
    changes: Partial<Omit<Lot, 'lotName'>>,
    save: () => ReturnType<DashboardApi['getDashboard']>,
  ): void {
    const previousState = this.stateSubject.value;
    const previousDashboard = previousState.dashboard;

    if (!previousDashboard) {
      return;
    }

    const dashboard = {
      ...previousDashboard,
      items: previousDashboard.items.map((item) =>
        item.lotName === lotName ? { ...item, ...changes } : item,
      ),
    };

    this.updateState((state) => ({ ...state, dashboard }));
    this.recordTransition('optimistic-update-applied', undefined, lotName);

    save()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.recordTransition('optimistic-update-committed', undefined, lotName),
        error: (error: unknown) => {
          this.updateState((state) => ({
            ...state,
            dashboard: previousDashboard,
            error: getErrorMessage(error),
          }));
          this.recordTransition('optimistic-update-rolled-back', undefined, lotName);
        },
      });
  }

  private loadDashboard(reason: DashboardLoadReason) {
    this.updateState((state) => ({ ...state, loading: true, error: null }));
    this.recordTransition('load-started', reason);

    return this.dashboardApi.getDashboard().pipe(
      map(mapDashboardResponse),
      tap((dashboard) => {
        this.updateState((state) => ({
          ...state,
          dashboard,
          loading: false,
          error: null,
          cacheValid: true,
          updatedAt: new Date().toISOString(),
        }));
        this.recordTransition('load-succeeded', reason);
      }),
      map(() => undefined),
      catchError((error: unknown) => {
        this.updateState((state) => ({
          ...state,
          loading: false,
          error: getErrorMessage(error),
        }));
        this.recordTransition('load-failed', reason);

        return EMPTY;
      }),
    );
  }

  private updateState(update: (state: Old02DashboardState) => Old02DashboardState): void {
    this.stateSubject.next(update(this.stateSubject.value));
  }

  private recordTransition(
    type: DashboardTransitionType,
    reason?: DashboardLoadReason,
    lotName?: string,
  ): void {
    this.transitionSubject.next({
      type,
      reason,
      lotName,
      occurredAt: new Date().toISOString(),
    });
  }
}

export interface Old02DashboardState {
  dashboard: Dashboard | null;
  loading: boolean;
  error: string | null;
  polling: boolean;
  cacheValid: boolean;
  updatedAt: string | null;
}

export type DashboardLoadReason = 'polling' | 'manual' | 'cache-invalidated';

export interface DashboardTransition {
  type: DashboardTransitionType;
  reason?: DashboardLoadReason;
  lotName?: string;
  occurredAt: string;
}

export type DashboardTransitionType =
  | 'polling-started'
  | 'polling-stopped'
  | 'load-requested'
  | 'load-started'
  | 'load-succeeded'
  | 'load-failed'
  | 'cache-invalidated'
  | 'optimistic-update-applied'
  | 'optimistic-update-committed'
  | 'optimistic-update-rolled-back';

const initialDashboardState: Old02DashboardState = {
  dashboard: null,
  loading: false,
  error: null,
  polling: false,
  cacheValid: false,
  updatedAt: null,
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Failed to load dashboard.';
}

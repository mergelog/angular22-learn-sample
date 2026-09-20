import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { CafeDashboardApi } from '../../core/api/cafe-dashboard.api';
import { CAFE_CONFIG } from '../../core/config/cafe.config';
import { CafeDashboard, CafeOrder } from '../../core/model/cafe-status.model';

@Component({
  selector: 'app-view-json',
  imports: [JsonPipe, RouterLink],
  templateUrl: './view-json.html',
  styleUrl: './view-json.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewJson implements OnInit {
  private readonly api = inject(CafeDashboardApi);
  private readonly config = inject(CAFE_CONFIG);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly dashboard = signal<CafeDashboard | undefined>(undefined);
  protected readonly orders = signal<readonly CafeOrder[]>([]);
  protected readonly errorMessage = signal<string | undefined>(undefined);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.refreshView();
    const dashboardUpdateId = setInterval(
      () => this.refreshView(),
      this.config.dashboardUpdateIntervalMs,
    );

    // [■観点:定期更新] 表示用の定期取得と、バックエンド内の状態更新は別の間隔で動作します。
    this.destroyRef.onDestroy(() => clearInterval(dashboardUpdateId));
  }

  protected refreshView(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(undefined);

    forkJoin({
      dashboard: this.api.getDashboard(),
      orders: this.api.getOrders(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ dashboard, orders }) => {
          this.dashboard.set(dashboard);
          this.orders.set(orders);
        },
        error: () => this.errorMessage.set('カフェの状況または注文情報を取得できませんでした。'),
      });
  }
}

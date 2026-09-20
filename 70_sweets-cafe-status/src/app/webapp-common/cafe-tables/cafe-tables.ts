import { DatePipe, DecimalPipe } from '@angular/common';
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
import { finalize } from 'rxjs';

import { CafeDashboardApi } from '../../core/api/cafe-dashboard.api';
import { CafeDashboard, TableStatus } from '../../core/model/cafe-status.model';

@Component({
  selector: 'app-cafe-tables',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './cafe-tables.html',
  styleUrl: './cafe-tables.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeTables implements OnInit {
  private readonly api = inject(CafeDashboardApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly dashboard = signal<CafeDashboard | null>(null);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .getDashboard()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (dashboard) => this.dashboard.set(dashboard),
        error: () => this.errorMessage.set('カフェの状況を取得できませんでした。'),
      });
  }

  protected statusClass(status: TableStatus): string {
    switch (status) {
      case '空き':
        return 'available';
      case '未オーダー':
        return 'waiting';
      case '調理中':
        return 'cooking';
      case '提供済':
        return 'served';
      case '片付け中':
        return 'cleaning';
    }
  }

  protected formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}時間 ${minutes}分`;
    }

    if (minutes > 0) {
      return `${minutes}分 ${seconds}秒`;
    }

    return `${seconds}秒`;
  }
}

import { DatePipe } from '@angular/common';
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
import { CafeDashboard } from '../../core/model/cafe-status.model';
import { CafeTablesGrid } from './dumb/cafe-tables-grid/cafe-tables-grid';

@Component({
  selector: 'app-cafe-tables',
  imports: [CafeTablesGrid, DatePipe, RouterLink],
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
  protected readonly selectedTableNumber = signal<string | null>(null);

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

  protected selectTable(tableNumber: string): void {
    this.selectedTableNumber.set(tableNumber);
  }
}

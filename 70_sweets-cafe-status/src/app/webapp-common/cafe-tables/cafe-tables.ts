import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { loadDashboard } from '../../feature/cafe-status/state/cafe-status.actions';
import {
  selectDashboard,
  selectLoading,
  selectLoadError,
} from '../../feature/cafe-status/state/cafe-status.selectors';
import { CafeTablesGrid } from './dumb/cafe-tables-grid/cafe-tables-grid';

@Component({
  selector: 'app-cafe-tables',
  imports: [CafeTablesGrid, DatePipe, RouterLink],
  templateUrl: './cafe-tables.html',
  styleUrl: './cafe-tables.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeTables implements OnInit {
  private readonly store = inject(Store);

  protected readonly dashboard = this.store.selectSignal(selectDashboard);
  protected readonly loading = this.store.selectSignal(selectLoading);
  protected readonly errorMessage = this.store.selectSignal(selectLoadError);
  protected readonly selectedTableNumber = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.store.dispatch(loadDashboard());
  }

  protected selectTable(tableNumber: string): void {
    this.selectedTableNumber.set(tableNumber);
  }
}

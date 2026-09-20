import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, of } from 'rxjs';

import { TABLE_STATUSES } from '../../../../core/model/cafe-status.model';
import { selectDashboard } from '../../state/cafe-status.selectors';

@Component({
  selector: 'app-cafe-table-overview',
  templateUrl: './cafe-table-overview.html',
  styleUrl: './cafe-table-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeTableOverview {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);

  private readonly dashboard = this.store.selectSignal(selectDashboard);
  private readonly tableNumber = toSignal(
    this.route.parent?.paramMap.pipe(map((params) => params.get('tableNumber'))) ?? of(null),
    { initialValue: null },
  );

  protected readonly statuses = TABLE_STATUSES;
  protected readonly table = computed(() => {
    const tableNumber = this.tableNumber();
    return this.dashboard()?.tables.find((table) => table.tableNumber === tableNumber) ?? null;
  });

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

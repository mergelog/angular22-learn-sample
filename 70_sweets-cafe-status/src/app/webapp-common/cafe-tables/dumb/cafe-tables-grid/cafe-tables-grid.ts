import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CafeTable, TableStatus } from '../../../../core/model/cafe-status.model';

@Component({
  selector: 'app-cafe-tables-grid',
  imports: [DecimalPipe],
  templateUrl: './cafe-tables-grid.html',
  styleUrl: './cafe-tables-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeTablesGrid {
  readonly tables = input.required<readonly CafeTable[]>();

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

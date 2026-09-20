import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  untracked,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CafeTable, TableStatus } from '../../../../core/model/cafe-status.model';

@Component({
  selector: 'app-cafe-info-header',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './cafe-info-header.html',
  styleUrl: './cafe-info-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeInfoHeader {
  readonly table = input.required<CafeTable>();
  readonly generatedAt = input<string | null>(null);
  readonly closeRequested = output<void>();

  // 詳細ペインの編集欄。値の正本はStoreではなくこのFormGroup
  readonly form = new FormGroup({
    status: new FormControl<TableStatus>('空き', { nonNullable: true }),
    people: new FormControl<number>(0, { nonNullable: true }),
    billingAmount: new FormControl<number>(0, { nonNullable: true }),
  });

  // 表示対象の切り替えだけを検知する。再取得で値が変わっただけでは通知しない
  private readonly tableNumber = computed(() => this.table().tableNumber);

  constructor() {
    effect(() => {
      this.tableNumber();
      untracked(() => this.resetForm());
    });
  }

  // 入力内容を表示中テーブルの現在値へ戻す
  private resetForm(): void {
    const { status, people, billingAmount } = this.table();

    this.form.reset({ status, people, billingAmount });
  }
}

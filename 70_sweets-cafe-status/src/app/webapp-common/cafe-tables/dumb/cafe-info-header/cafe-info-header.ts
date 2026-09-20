import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import {
  CafeTable,
  TABLE_STATUSES,
  TableStatus,
  UpdateTableRequest,
} from '../../../../core/model/cafe-status.model';
import { nonNegativeInteger } from '../../../shared/forms/non-negative-integer.validator';

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
  readonly saving = input(false);
  readonly updateError = input<string | null>(null);
  readonly closeRequested = output<void>();
  readonly saveRequested = output<UpdateTableRequest>();

  // 詳細ペインの編集欄。値の正本はStoreではなくこのFormGroup
  readonly form = new FormGroup({
    status: new FormControl<TableStatus>('空き', { nonNullable: true }),
    people: new FormControl<number>(0, {
      nonNullable: true,
      validators: nonNegativeInteger(),
    }),
    billingAmount: new FormControl<number>(0, {
      nonNullable: true,
      validators: nonNegativeInteger(),
    }),
  });

  // 編集欄を開いているかどうか。入力値そのものはFormGroupが持つ
  protected readonly editing = signal(false);

  // 状態の選択肢。モデル側の定義をそのまま使う
  protected readonly statuses = TABLE_STATUSES;

  // 表示対象の切り替えだけを検知する。再取得で値が変わっただけでは通知しない
  private readonly tableNumber = computed(() => this.table().tableNumber);

  constructor() {
    effect(() => {
      this.tableNumber();
      untracked(() => {
        this.editing.set(false);
        this.resetForm();
      });
    });
  }

  protected startEditing(): void {
    this.resetForm();
    this.editing.set(true);
  }

  protected cancelEditing(): void {
    this.editing.set(false);
    this.resetForm();
  }

  protected save(): void {
    // 無効な入力と送信中の二重送信は親へ通知しない
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saveRequested.emit({
      tableNumber: this.table().tableNumber,
      ...this.form.getRawValue(),
    });
  }

  // 入力内容を表示中テーブルの現在値へ戻す
  private resetForm(): void {
    const { status, people, billingAmount } = this.table();

    this.form.reset({ status, people, billingAmount });
  }
}

import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type Priority = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-sample-13-priority-control',
  templateUrl: './priority-control.html',
  styleUrl: './priority-control.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PriorityControl),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityControl implements ControlValueAccessor {
  readonly options: readonly { value: Priority; label: string }[] = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
  ];
  readonly value = signal<Priority>('medium');
  readonly disabled = signal(false);

  private onChange: (value: Priority) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  // [■観点:writeValue] FormControl → カスタム部品へ値を反映する入口。
  writeValue(value: Priority | null): void {
    this.value.set(value ?? 'medium');
  }

  // [■観点:registerOnChange] カスタム部品 → FormControl へ値を返す callback を受け取る。
  registerOnChange(fn: (value: Priority) => void): void {
    this.onChange = fn;
  }

  // [■観点:registerOnTouched] ユーザーが部品を操作したことを Forms API へ返す。
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // [■観点:setDisabledState] FormControl.disable() の状態をカスタム部品へ同期する。
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  select(priority: Priority): void {
    if (this.disabled()) return;

    this.value.set(priority);
    this.onChange(priority);
    this.onTouched();
  }
}

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// 0以上の整数だけを許可する。未入力の数値入力欄はnullになるため、それもエラーにする
export function nonNegativeInteger(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;

    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      return { nonNegativeInteger: true };
    }

    return null;
  };
}
